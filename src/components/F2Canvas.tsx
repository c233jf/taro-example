import { type CanvasProps, Canvas as AntVCanvas, Children } from '@antv/f2'
import { Canvas, type CanvasTouchEvent } from '@tarojs/components'
import Taro, { useReady } from '@tarojs/taro'
import { type FC, useEffect, useRef, useState } from 'react'

interface PropsType {
  chartId: string
  children: JSX.Element
}

interface CanvasStaticConfig {
  context: CanvasRenderingContext2D
  pixelRatio: number
  height: number
  width: number
  createImage: () => HTMLImageElement
  requestAnimationFrame?: typeof requestAnimationFrame
  cancelAnimationFrame?: typeof cancelAnimationFrame
  offscreenCanvas?: any
  isTouchEvent: (e: any) => boolean
  isMouseEvent: (e: any) => boolean
}

const MAX_RETRY = 5
const RETRY_DELAY = 100

let federatedEventPatched = false

/**
 * 小程序没有浏览器 Event，g-lite 的 FederatedEvent.preventDefault 里
 * `nativeEvent instanceof Event` 会抛 ReferenceError。
 * 严格模式下给 globalThis.Event 赋值也无法让自由变量 Event 生效，
 * 因此直接 patch 当前图表所用的 FederatedEvent 原型。
 */
function patchFederatedEventPreventDefault(antvCanvas: AntVCanvas) {
  if (federatedEventPatched) return

  const gCanvas = (antvCanvas as any).canvas
  const plugins: any[] = gCanvas?.context?.renderingPlugins || []
  const sampleEvent = plugins.find((p) => p?.rootPointerEvent)?.rootPointerEvent
  if (!sampleEvent) return

  let proto = Object.getPrototypeOf(sampleEvent)
  while (
    proto &&
    !Object.prototype.hasOwnProperty.call(proto, 'preventDefault')
  ) {
    proto = Object.getPrototypeOf(proto)
  }
  if (!proto) return

  proto.preventDefault = function preventDefault(this: any) {
    const nativeEvent = this.nativeEvent
    if (
      nativeEvent &&
      nativeEvent.cancelable &&
      typeof nativeEvent.preventDefault === 'function'
    ) {
      try {
        nativeEvent.preventDefault()
      } catch {
        // ignore mini program / TaroEvent quirks
      }
    }
    this.defaultPrevented = true
  }

  federatedEventPatched = true
}

/** 去掉 React element 多余字段，只保留 F2 需要的结构 */
function pickElement(children: any): any {
  if (!children) return children
  return Children.map(children, (item) => {
    if (!item) return item
    const { key, ref, type, props } = item
    return {
      key,
      ref,
      type,
      props: {
        ...props,
        children: pickElement(props?.children),
      },
    }
  })
}

/** 对齐 @antv/f-wx：把小程序 touch 坐标补成 F2/G 需要的 clientX/clientY */
function convertTouches(touches: any) {
  if (!touches) return touches
  return Array.from(touches as any[]).map((touch: any) => ({
    ...touch,
    clientX: touch.clientX ?? touch.x,
    clientY: touch.clientY ?? touch.y,
    x: touch.x,
    y: touch.y,
    identifier: touch.identifier,
    pageX: touch.pageX ?? touch.x,
    pageY: touch.pageY ?? touch.y,
  }))
}

/** TaroEvent 的 target 等字段是只读 getter，不能原地修改，需构造新事件对象 */
function dispatchTouchEvent(el: any, event: CanvasTouchEvent, type: string) {
  if (!el || !event) return
  const detail = (event as any).detail
  const e: any = {
    ...event,
    type,
    target: el,
    currentTarget: el,
    preventDefault:
      typeof event.preventDefault === 'function'
        ? event.preventDefault.bind(event)
        : () => {},
    stopPropagation:
      typeof event.stopPropagation === 'function'
        ? event.stopPropagation.bind(event)
        : () => {},
    touches: convertTouches(event.touches),
    changedTouches: convertTouches(event.changedTouches),
    clientX: detail?.x,
    clientY: detail?.y,
    detail,
  }
  el.dispatchEvent(e)
}

const F2Canvas: FC<PropsType> = ({ chartId, children }) => {
  const staticConfig = useRef<CanvasStaticConfig>()
  const chartRef = useRef<AntVCanvas>()
  const canvasElRef = useRef<any>()
  const [isReady, setIsReady] = useState(false)

  const initCanvas = (attempt = 0) => {
    Taro.createSelectorQuery()
      .select(`#${chartId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvasInfo = res?.[0] as
          | {
              node: HTMLCanvasElement & {
                createImage: () => HTMLImageElement
                requestAnimationFrame?: typeof requestAnimationFrame
                cancelAnimationFrame?: typeof cancelAnimationFrame
              }
              width: number
              height: number
            }
          | null
          | undefined

        if (!canvasInfo?.node) {
          if (attempt < MAX_RETRY) {
            setTimeout(() => initCanvas(attempt + 1), RETRY_DELAY)
          } else {
            console.warn(`[F2Canvas] canvas node not found: #${chartId}`)
          }
          return
        }

        const { node, width, height } = canvasInfo
        const pixelRatio = Taro.getSystemInfoSync().pixelRatio
        node.width = width * pixelRatio
        node.height = height * pixelRatio

        const context = node.getContext('2d') as CanvasRenderingContext2D
        if (!context) {
          console.warn(`[F2Canvas] getContext failed: #${chartId}`)
          return
        }

        // 对齐 @antv/f-wx：小程序需额外传入 createImage / offscreenCanvas 等
        let offscreenCanvas: any
        try {
          offscreenCanvas = Taro.createOffscreenCanvas({ type: '2d' })
        } catch {
          offscreenCanvas = undefined
        }

        staticConfig.current = {
          context,
          pixelRatio,
          height,
          width,
          createImage: () => node.createImage(),
          requestAnimationFrame: node.requestAnimationFrame?.bind(node),
          cancelAnimationFrame: node.cancelAnimationFrame?.bind(node),
          offscreenCanvas,
          isTouchEvent: (e) => String(e?.type || '').startsWith('touch'),
          isMouseEvent: (e) => String(e?.type || '').startsWith('mouse'),
        }
        setIsReady(true)
      })
  }

  useReady(() => {
    Taro.nextTick(() => initCanvas())
  })

  const renderChart = (config: CanvasProps) => {
    if (chartRef.current) {
      chartRef.current.update(config)
    } else {
      chartRef.current = new AntVCanvas(config)
      chartRef.current.render()
      patchFederatedEventPreventDefault(chartRef.current)
    }
    canvasElRef.current = chartRef.current.getCanvasEl()
  }

  useEffect(() => {
    if (!isReady || !staticConfig.current) return
    // Chart 必须作为 Canvas 的 children，不能把 Chart.props 摊平到 Canvas
    renderChart({
      ...staticConfig.current,
      children: pickElement(children),
    })
  }, [children, isReady])

  const handleTouchStart = (e: CanvasTouchEvent) => {
    dispatchTouchEvent(canvasElRef.current, e, 'touchstart')
  }

  const handleTouchMove = (e: CanvasTouchEvent) => {
    dispatchTouchEvent(canvasElRef.current, e, 'touchmove')
  }

  const handleTouchEnd = (e: CanvasTouchEvent) => {
    dispatchTouchEvent(canvasElRef.current, e, 'touchend')
  }

  return (
    <Canvas
      type="2d"
      canvasId={chartId}
      id={chartId}
      style={{ width: '100%', height: '100%' }}
      disableScroll
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  )
}

export default F2Canvas
