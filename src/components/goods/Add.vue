<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        :closable="false"
        center
        show-icon
      >
      </el-alert>
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-position="top"
        label-width="100px"
      >
        <!-- v-model绑定的当前活跃的name属性 -->
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="handleTabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称:" prop="goodsName">
              <el-input v-model="addForm.goodsName"></el-input>
            </el-form-item>
            <el-form-item label="商品价格:" prop="goodsPrice">
              <el-input v-model="addForm.goodsPrice" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量:" prop="goodsWeight">
              <el-input v-model="addForm.goodsWeight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量:" prop="goodsNumber">
              <el-input v-model="addForm.goodsNumber"></el-input>
            </el-form-item>
            <el-form-item label="商品分类：" prop="goodsCat">
              <!-- options用来指定数据源  props指定配置对象 -->
              <el-cascader
                v-model="addForm.goodsCat"
                :options="categoryList"
                :props="{
                  ...cascaderProps,
                  checkStrictly: true,
                  expandTrigger: 'hover',
                }"
                clearable
                @change="handleCateChanged"
              ></el-cascader
            ></el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attrName"
              v-for="(item, index) of manyTableList"
              :key="index"
            >
              <el-checkbox-group v-model="item.attrVals">
                <el-checkbox
                  :label="attrVal"
                  v-for="(attrVal, ind) of item.attrVals"
                  :key="ind"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attrName"
              v-for="item of onlyTableList"
              :key="item.attrId"
            >
              <el-input v-model="item.attrVals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action指定上传到服务器的地址  on-preview预览图片触发的回调 on-remove删除图片触发的回调-->
            <!-- 图片 -->
            <el-upload
              action="https://www.fastmock.site/mock/ec506369e4e21894afac3bd163cea378/api/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goodsIntroduce" ref="myQuillEditor">
            </quill-editor>
            <el-button type="primary" class="add-btn" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import Axios from '../../common/utils/axios.js';
import _ from "lodash";
export default {
  data () {
    return {
      activeIndex: "0",       // steps和tabs当前的活跃值
      categoryList: [],       // 商品分类列表数据
      cascaderProps: {        // 级联选择器的配置对象
        value: 'catId',
        label: 'catName',
        children: 'children'
      },
      manyTableList: [],      // 商品参数数据
      onlyTableList: [],      // 商品属性数据
      uploadURL: `https://www.fastmock.site/mock/ec506369e4e21894afac3bd163cea378/api/upload`,    // 图片上传地址
      addForm: {
        goodsName: '',
        goodsPrice: 0,
        goodsNumber: '',
        goodsWeight: '',
        goodsCat: [],       // 商品分类
        pics: [],           // 图片path数组
        goodsIntroduce: '', // 商品描述
      },
      addFormRules: {
        goodsName: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goodsPrice: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goodsNumber: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goodsWeight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goodsCat: [
          { required: true, message: '请选择分类', trigger: 'blur' }
        ],
      }
    }

  },
  created () {
    this.getCategoryLsit();
  },
  methods: {
    // 获取商品分类数据列表
    async getCategoryLsit () {
      let { data, meta } = await Axios.get('/categories')
      if (meta && meta.status !== 200) return this.$message.error(meta.msg)
      this.categoryList = data.result
    },



    // 级联选择项发生变化，触发的回调
    handleCateChanged () {
      if (this.addForm.goodsCat.length != 3) {
        this.$message.info()
        this.addForm.goodsCat = []
      }
    },

    // tabs切换前调用的钩子函数，可以阻止tab切换
    beforeTabLeave (activeName, oldName) {
      if (oldName == 0 && this.addForm.goodsCat.length != 3) {
        this.$message.error('请先选择商品分类！！！')
        return false
      }
      return true
    },

    // tab切换时触发
    async handleTabClick () {
      // 商品参数数据
      if (this.activeIndex == 1 && this.addForm.goodsCat.length == 3) {
        let { data, meta } = await Axios.get(`/categories/${this.addForm.goodsCat[2]}/attributes`, {
          params: { sel: 'many' }
        })
        if (meta && meta.status !== 200) return this.$message.error(meta.msg)
        data.forEach(item => {
          item.attrVals = item.attrVals.split(' ')
        });
        this.manyTableList = data
      }
      // 商品属性数据
      if (this.activeIndex == 2 && this.addForm.goodsCat.length == 3) {
        let { data, meta } = await Axios.get(`/categories/${this.addForm.goodsCat[2]}/attributes`, {
          params: { sel: 'only' }
        })
        if (meta && meta.status !== 200) return this.$message.error(meta.msg)
        this.onlyTableList = data
      }
    },

    // 预览图片触发的回调
    handlePreview () {

    },

    // 删除图片触发的回调
    handleRemove (file) {
      console.log(file);
      let tmpPath = file.response.data.tmpPath
      let index = this.addForm.pics.findIndex(item => item.pic == tmpPath)
      this.addForm.pics.splice(index, 1)
    },

    // 图片上传成功触发的回调
    handleSuccess (response) {
      let picInfo = {
        pic: response.data.tmpPath
      }
      this.addForm.pics.push(picInfo)
    },

    // 添加商品回调（整个表单的校验）
    addGoods () {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) {
          this.$message.error('请填入必填项...')
          return
        }
        // 成功的业务逻辑
        const addFormCopyValue = _.cloneDeep(this.addForm)
        addFormCopyValue.goodsCat = addFormCopyValue.goodsCat.join(',')

        // 提交添加商品信息...

        // 跳转商品列表页面
        this.$router.push('/goods-list')
      })
    }
  }

}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
}
.el-step__title {
  font-size: 14px;
}

.add-btn {
  margin-top: 15px;
}
</style>