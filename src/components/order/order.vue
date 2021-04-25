<template>
  <!-- // "element-ui": "2.4.5", -->
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getOrderList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table :data="orderList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="orderNumber" label="订单编号"> </el-table-column>
        <el-table-column prop="orderPrice" label="订单价格"> </el-table-column>
        <el-table-column prop="orderPay" label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.orderPay == 1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isSend" label="是否发货"></el-table-column>
        <el-table-column prop="createTime" label="下单时间"></el-table-column>
        <el-table-column label="操作" width="200px">
          <!-- enterable="false" 鼠标放到鼠标弹层上，移除鼠标弹层 -->
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editAddress"
            >
            </el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgress(scope.row)"
            >
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 ： layout： 表示用到什么组件-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 修改地址对话框 -->
      <base-dialog
        :dialogVisible="showEditDialog"
        :title="editDialogTitle"
        @cancel-dialog="editDialogCancel"
        @ok-dialog="editDialogOk"
      >
        <el-form
          ref="addressFormRef"
          :model="addressForm"
          :rules="addressFormRules"
          label-width="80px"
        >
          <el-form-item label="省市区县" prop="address1">
            <!-- options用来指定数据源  props指定配置对象 -->
            <el-cascader
              v-model="addressForm.address1"
              :options="cityMap"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input
              v-model="addressForm.address2"
              placeholder="请填写详细地址"
            ></el-input>
          </el-form-item>
        </el-form>
      </base-dialog>
      <!-- 物流进度对话框 -->
      <base-dialog
        :dialogVisible="showProgressDialog"
        :title="progressDialogTitle"
        @cancel-dialog="progressDialogCancel"
        @ok-dialog="progressDialogOk"
      >
        <el-timeline reverse>
          <el-timeline-item
            v-for="(item, index) in progressList"
            :key="index"
            :timestamp="item.ftime"
          >
            {{ item.context }}
          </el-timeline-item>
        </el-timeline>
      </base-dialog>
    </el-card>
  </div>
</template>

<script>
import Axios from '../../common/utils/axios.js';
import BaseDialog from '../../base/basecomponents/dialog.vue';
import cityMap from '@/common/dataMap/cityMap'
export default {
  data () {
    return {
      queryInfo: {
        query: '',      // 查询的内容
        pageNum: 1,     // 当前页码
        pageSize: 10,   // 每页显示条数
      },
      orderList: [],    // 订单数据
      total: 0,
      cityMap: cityMap,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请输入省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      showEditDialog: false,
      editDialogTitle: '修改地址',

      showProgressDialog: false,
      progressDialogTitle: '物流进度',
      progressList: [],     // 物流数据列表
    }

  },
  components: {
    BaseDialog
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList () {
      let { data, meta } = await Axios.get('/orders', {
        params: this.queryInfo
      })
      if (meta && meta.status !== 200) return this.$message.error(meta.msg)
      this.$message.success(meta.msg)
      this.orderList = data.goods
      this.total = data.total
    },

    // pageSize变化触发的回调
    handleSizeChange (newPageSize) {
      this.queryInfo.pageSize = newPageSize
      this.getOrderList()
    },

    // pageNum变化触发的回调
    handleCurrentChange (newNum) {
      this.queryInfo.pageNum = newNum
      this.getOrderList()
    },

    // 修改地址触发回调
    editAddress () {
      this.showEditDialog = true
    },

    // 修改地址对话框取消回调
    editDialogCancel () {
      this.showEditDialog = false
      this.$refs.addressFormRef.resetFields()
    },

    // 修改地址对话框确定回调
    editDialogOk () {
      this.showEditDialog = false
    },

    // 展示物流进度对话框
    async showProgress (row) {
      let { data, meta } = await Axios.get(`/kuaidi/${row.orderId}`)
      if (meta && meta.status !== 200) return this.$message.error(meta.msg)
      this.$message.success(meta.msg)
      this.progressList = data
      this.showProgressDialog = true
    },

    // 物流对话框取消回调
    progressDialogCancel () {
      this.showProgressDialog = false
    },

    // 物流对话框确定回调
    progressDialogOk () {
      this.showProgressDialog = false
    },
  }

}
</script>


<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>