<template>
  <div class="model-panel">
    <p class="sub-title">输入车牌号</p>
    <KeyboardPanel
      v-show="visiable"
      ref="inputRef"
      :cur-item="licenseData.licensePlate"
      @submit="submit"
    />
    <div class="set-default">
      <span class="text">设为默认</span>
      <van-switch v-model="licenseData.defaulted" size="20" class="switch" />
    </div>
    <div class="comfim-btn" @click="confirm">确定</div>
  </div>
</template>

<script>
import { Field, Switch, Toast } from 'vant'
import KeyboardPanel from './KeyboardPanel.vue'
export default {
  name: 'LicenseInput',
  components: {
    KeyboardPanel,
    [Field.name]: Field,
    [Switch.name]: Switch,
  },
  props: {
    curItemData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      visiable: true,
      licenseData: {
        licensePlate: '',
        defaulted: true,
        id: '',
      },
    }
  },
  created() {
    if (this.curItemData) {
      this.licenseData = Object.assign({}, this.curItemData)
    }
  },
  mounted() {},
  methods: {
    confirm() {
      this.$refs.inputRef.submit()
      if (
        !this.licenseData.licensePlate ||
        this.licenseData.licensePlate.length < 7
      ) {
        return Toast('请输入正确的车牌号码!')
      }
      this.$emit('confirm', this.licenseData)
    },
    submit(data) {
      this.licenseData.licensePlate = data
    },
  },
}
</script>

<style lang="less" scoped>
.model-panel {
  padding: 0 16px;
  .sub-title {
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #333333;
    margin: 15px 0;
  }
  .set-default {
    margin-top: 24px;
    border-top: 1px solid #eeeeee;
    padding: 18px 0 24px 0;
    position: relative;
    .text {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #333333;
    }
    .switch {
      position: absolute;
      right: 0;
    }
    /deep/ .van-switch--on {
      background-color: #15d193;
    }
  }
  .comfim-btn {
    width: 351px;
    height: 43px;
    background: #15d193;
    border-radius: 26px;
    font-size: 18px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #ffffff;
    line-height: 43px;
    text-align: center;
  }
}
</style>
