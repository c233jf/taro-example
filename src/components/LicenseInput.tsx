import { FC, useState, useRef, useEffect } from 'react'
import { View, Text, PageContainer, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import KeyboardPanel from './KeyboardPanel.tsx'
import './LicenseInput.scss'

interface LicenseData {
  licensePlate: string
  defaulted: boolean
  id: string
}

interface LicenseInputProps {
  curItemData?: LicenseData | null
  onConfirm: (data: LicenseData) => void
  onCancel?: () => void
  visible: boolean
}

const LicenseInput: FC<LicenseInputProps> = ({
  curItemData,
  onConfirm,
  onCancel,
  visible = false,
}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [licenseData, setLicenseData] = useState<LicenseData>({
    licensePlate: '',
    defaulted: true,
    id: '',
  })
  const [switchChecked, setSwitchChecked] = useState(true)
  const [keyboardType, setKeyboardType] = useState<'province' | 'normal'>(
    'province',
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const licensePlateUpdatedRef = useRef(false)

  // 初始化或重置时设置初始车牌号
  useEffect(() => {
    if (visible) {
      if (curItemData) {
        setLicenseData({ ...curItemData })
        const licensePlate = curItemData.licensePlate || ''
        setCurrentIndex(licensePlate.length)
        setKeyboardType(licensePlate.length > 0 ? 'normal' : 'province')
        setSwitchChecked(curItemData.defaulted)
      } else {
        // 重置为默认值
        setLicenseData({
          licensePlate: '',
          defaulted: true,
          id: '',
        })
        setCurrentIndex(0)
        setKeyboardType('province')
        setSwitchChecked(true)
      }
      licensePlateUpdatedRef.current = false
      // 默认不显示键盘
      setKeyboardVisible(false)
    }
  }, [curItemData, visible])

  const handleConfirm = () => {
    if (!licenseData.licensePlate || licenseData.licensePlate.length < 7) {
      Taro.showToast({
        title: '请输入正确的车牌号码!',
        icon: 'none',
      })
      return
    }
    onConfirm(licenseData)
  }

  // 处理键盘按键点击
  const handleKeyClick = (key: string) => {
    let licensePlate = licenseData.licensePlate

    if (key === '删除') {
      // 删除逻辑
      if (licensePlate.length > 0) {
        const newLicense = licensePlate.slice(0, -1)
        setLicenseData((prev) => ({ ...prev, licensePlate: newLicense }))
        setCurrentIndex(currentIndex === 3 ? 1 : currentIndex - 1)
        if (newLicense.length === 0) {
          setKeyboardType('province')
        }
      }
    } else {
      // 输入逻辑
      if (licensePlate.length < 8) {
        const newLicense = licensePlate + key
        setLicenseData((prev) => ({ ...prev, licensePlate: newLicense }))
        setCurrentIndex(currentIndex === 1 ? 3 : currentIndex + 1)
        setKeyboardType('normal')
      }
    }
  }

  const handleSwitchChange = (e) => {
    const checked = e.detail.value
    setSwitchChecked(checked)
    setLicenseData((prev) => ({ ...prev, defaulted: checked }))
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  // 显示键盘
  const showKeyboard = () => {
    setKeyboardVisible(true)
  }

  // 隐藏键盘
  const hideKeyboard = () => {
    setKeyboardVisible(false)
  }

  const licensePlate = licenseData.licensePlate

  return (
    <PageContainer show={visible} round onAfterLeave={handleCancel}>
      <View
        className={`license-popup-content ${keyboardVisible ? 'keyboard-visible' : ''}`}
      >
        <View className="header">
          <Text className="back-arrow" onClick={handleCancel}>
            &lt;
          </Text>
          <Text className="title">新增车辆</Text>
        </View>

        <View className="content">
          <Text className="sub-title">输入车牌号</Text>

          {/* 车牌输入框 */}
          <View className="license-plate-input" onClick={showKeyboard}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) =>
              index === 2 ? (
                <View key={`dot-${index}`} className="dot">
                  •
                </View>
              ) : (
                <View
                  key={index}
                  className={`plate-box ${currentIndex === index ? 'active' : ''} ${licensePlate[index > 2 ? index - 1 : index] ? 'filled' : ''}`}
                >
                  {licensePlate[index > 2 ? index - 1 : index] || ''}
                  {currentIndex === index &&
                    !licensePlate[index > 2 ? index - 1 : index] && (
                      <Text className="input-line">|</Text>
                    )}
                </View>
              ),
            )}
          </View>

          <View className="set-default">
            <Text className="text">设为默认</Text>
            <Switch
              checked={switchChecked}
              color="#15d193"
              onChange={handleSwitchChange}
              style={{ transform: 'scale(0.8)' }}
            />
          </View>

          <View className="submit-btn" onClick={handleConfirm}>
            确定
          </View>
        </View>
      </View>

      {/* 键盘弹出层 */}
      <KeyboardPanel
        type={keyboardType}
        onKeyClick={handleKeyClick}
        visible={keyboardVisible}
        onClose={hideKeyboard}
      />
    </PageContainer>
  )
}

export default LicenseInput
