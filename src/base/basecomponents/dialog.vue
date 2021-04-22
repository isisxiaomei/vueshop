<template>
  <div class="dialog-wrapper">
    <el-dialog :title="title" :visible="dialogVisible">
      <div class="dialog-content">
        <slot />
      </div>
      <div slot="footer">
        <el-button type="primary" @click="cancelDialog">取 消</el-button>
        <el-button type="primary" @click="onOKDialog">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    title: {                    // 标题
      type: String,
      default: ''
    },
    dialogVisible: {            // 是否可见
      type: Boolean,
      default: false
    },
    cancelTxt: {
      type: String,
      default: '取 消'
    },
    okTxt: {
      type: String,
      default: '确 定'
    }

  },
  methods: {
    cancelDialog () {
      this.$emit('cancel-dialog')
    },

    onOKDialog () {
      this.$emit('ok-dialog')
    }
  }
}
</script>

<style>
</style>