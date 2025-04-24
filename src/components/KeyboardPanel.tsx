import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import { View, Text } from '@tarojs/components'
import './KeyboardPanel.scss'

interface KeyboardPanelProps {
  onKeyClick: (key: string) => void
  type?: 'province' | 'normal'
  visible?: boolean
  onClose?: () => void
}

// 省份简称
const PROVINCE_SHORT = [
  { name: '京' },
  { name: '沪' },
  { name: '辽' },
  { name: '苏' },
  { name: '闽' },
  { name: '粤' },
  { name: '桂' },
  { name: '甘' },
  { name: '鲁' },
  { name: '桂' },
  { name: '津' },
  { name: '渝' },
  { name: '吉' },
  { name: '浙' },
  { name: '赣' },
  { name: '琼' },
  { name: '宁' },
  { name: '青' },
  { name: '豫' },
  { name: '鄂' },
  { name: '冀' },
  { name: '晋' },
  { name: '黑' },
  { name: '皖' },
  { name: '湘' },
  { name: '川' },
  { name: '蒙' },
  { name: '陕' },
  { name: '贵' },
  { name: '云' },
  { name: '藏' },
  { name: '新' },
]

// 数字字母键盘配置
const KEYBOARD_LETTERS = [
  { name: '1' },
  { name: '2' },
  { name: '3' },
  { name: '4' },
  { name: '5' },
  { name: '6' },
  { name: '7' },
  { name: '8' },
  { name: '9' },
  { name: '0' },
  { name: 'Q' },
  { name: 'W' },
  { name: 'E' },
  { name: 'R' },
  { name: 'T' },
  { name: 'Y' },
  { name: 'U' },
  { name: 'I' },
  { name: 'O' },
  { name: 'P' },
  { name: 'A' },
  { name: 'S' },
  { name: 'D' },
  { name: 'F' },
  { name: 'G' },
  { name: 'H' },
  { name: 'J' },
  { name: 'K' },
  { name: 'L' },
  { name: 'Z' },
  { name: 'X' },
  { name: 'C' },
  { name: 'V' },
  { name: 'B' },
  { name: 'N' },
  { name: 'M' },
  { name: '港' },
  { name: '澳' },
  { name: '学' },
  { name: '领' },
  { name: '警' },
  { name: '删除', className: 'delete' },
]

const KeyboardPanel = forwardRef<any, KeyboardPanelProps>(
  ({ onKeyClick, type = 'province', visible = false, onClose }, ref) => {
    const [keyboardType, setKeyboardType] = useState<'province' | 'normal'>(
      type,
    )
    const [animationClass, setAnimationClass] = useState('')

    useEffect(() => {
      setKeyboardType(type)
    }, [type])

    useEffect(() => {
      // 动画效果控制
      if (visible) {
        setAnimationClass('slide-in')
      } else {
        setAnimationClass('slide-out')
      }
    }, [visible])

    // 点击键盘按钮
    const handleClickKey = (key: string) => {
      onKeyClick(key)
      if (key !== '删除' && keyboardType === 'province') {
        setKeyboardType('normal')
      }
    }

    const handleClose = () => {
      if (onClose) {
        onClose()
      }
    }

    if (!visible && animationClass !== 'slide-out') {
      return null
    }

    return (
      <View className={`keyboard-popup ${visible ? 'visible' : ''}`} catchMove>
        <View
          className={`keyboard-overlay ${animationClass}`}
          onClick={handleClose}
        />
        <View className={`keyboard-panel ${animationClass}`}>
          <View className="keyboard-header">
            <Text onClick={handleClose}>取消</Text>
            <Text onClick={handleClose}>&lt;</Text>
          </View>

          {/* 键盘 */}
          <View className="keyboard-container">
            {keyboardType === 'province' ? (
              <View className="province-keyboard">
                {PROVINCE_SHORT.map((item, index) => (
                  <View
                    key={index}
                    className="key-item"
                    onClick={() => handleClickKey(item.name)}
                  >
                    {item.name}
                  </View>
                ))}
                <View
                  className="key-item delete"
                  onClick={() => handleClickKey('删除')}
                >
                  删除
                </View>
              </View>
            ) : (
              <View className="normal-keyboard">
                {KEYBOARD_LETTERS.map((item, index) => (
                  <View
                    key={index}
                    className={`key-item ${item.className || ''}`}
                    onClick={() => handleClickKey(item.name)}
                  >
                    {item.name}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    )
  },
)

export default KeyboardPanel
