import { useState } from 'react'
import { View, Button, Text } from '@tarojs/components'
import { observer } from 'mobx-react'
import Taro, { useLoad } from '@tarojs/taro'
import { Axis, Chart, Interval, ScrollBar, TextGuide } from '@antv/f2'

import { useStoreContext } from '../../store/context'
import F2Canvas from '../../components/F2Canvas'

import './index.scss'

interface ChartData {
  date: string
  steps: number
}

function formatNumber(n: number) {
  return String(Math.floor(n * 100) / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const Index = () => {
  const { counterStore } = useStoreContext()
  const [chartData, setChartData] = useState<ChartData[]>([])

  const increment = () => {
    console.log('increment clicked')
    counterStore.increment()
  }

  const decrement = () => {
    console.log('decrement clicked')
    counterStore.decrement()
  }

  const incrementAsync = () => {
    console.log('incrementAsync clicked')
    counterStore.incrementAsync()
  }

  function fetchChartData() {
    Taro.request({
      url: 'https://gw.alipayobjects.com/os/antfincdn/ZpWsTPpY6%26/steps.json',
      success: (res) => {
        setChartData(res.data)
      },
    })
  }

  useLoad(fetchChartData)

  return (
    <View className="index">
      <View className="counter-section">
        <View className="counter-title">计数器演示</View>
        <View className="counter-btns">
          <Button type="default" onClick={increment}>
            +
          </Button>
          <Button type="default" onClick={decrement}>
            -
          </Button>
          <Button type="default" onClick={incrementAsync}>
            Add Async
          </Button>
          <Text>{counterStore.counter}</Text>
        </View>
      </View>

      <View className="chart-container">
        <F2Canvas chartId="chart-canvas">
          <Chart data={chartData}>
            <Axis field="date" type="timeCat" tickCount={5} />
            <Axis field="steps" formatter={formatNumber} />
            <Interval x="date" y="steps" />
            {chartData.map((item) => {
              const { steps } = item
              return (
                <TextGuide
                  key={item.date}
                  records={[item]}
                  content={`${steps}`}
                  style={{
                    fill: '#000',
                    fontSize: '24px',
                  }}
                  offsetY={-20}
                  offsetX={-15}
                />
              )
            })}
            <ScrollBar mode="x" range={[0.1, 0.3]} />
          </Chart>
        </F2Canvas>
      </View>
    </View>
  )
}

export default observer(Index)
