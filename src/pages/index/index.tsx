import { useEffect, useState } from 'react'
import { View, Button, Text } from '@tarojs/components'
import { observer } from 'mobx-react'
import Taro from '@tarojs/taro'
import { useStoreContext } from '../../store/context'
import LicenseInput from '../../components/LicenseInput'

import './index.scss'

interface LicenseData {
  licensePlate: string
  defaulted: boolean
  id: string
}

const Index = () => {
  const { counterStore } = useStoreContext()
  const [showLicensePopup, setShowLicensePopup] = useState(false)
  const [licenses, setLicenses] = useState<LicenseData[]>([])

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

  const handleOpenLicensePopup = () => {
    console.log('opening license popup')
    setShowLicensePopup(true)
  }

  const handleCloseLicensePopup = () => {
    console.log('closing license popup')
    setShowLicensePopup(false)
  }

  const handleConfirmLicense = (data: LicenseData) => {
    console.log('license confirmed:', data)
    const newLicense = {
      ...data,
      id: Date.now().toString(),
    }
    setLicenses((prev) => [...prev, newLicense])
    Taro.showToast({
      title: '添加成功',
      icon: 'success',
    })
    setShowLicensePopup(false)
  }

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

      <View className="license-section">
        <View className="license-title">车牌输入演示</View>
        <Button
          type="primary"
          className="license-btn"
          onClick={handleOpenLicensePopup}
        >
          添加车牌
        </Button>

        <View className="license-list">
          {licenses.length > 0 ? (
            licenses.map((license) => (
              <View key={license.id} className="license-item">
                <View className="license-plate">{license.licensePlate}</View>
                {license.defaulted && <View className="default-tag">默认</View>}
              </View>
            ))
          ) : (
            <View className="empty-tip">暂无车牌，请添加</View>
          )}
        </View>
      </View>

      <LicenseInput
        visible={showLicensePopup}
        onConfirm={handleConfirmLicense}
        onCancel={handleCloseLicensePopup}
      />
    </View>
  )
}

export default observer(Index)
