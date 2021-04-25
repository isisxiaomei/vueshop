<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 表单区域 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table :data="goodList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goodsName" label="商品名称"> </el-table-column>
        <el-table-column prop="goodsPrice" label="商品价格(元)" width="150px">
        </el-table-column>
        <el-table-column
          prop="goodsWeight"
          label="商品重量"
          width="90px"
        ></el-table-column>
        <el-table-column prop="addTime" label="创建时间"></el-table-column>
        <el-table-column label="操作" width="200px">
          <!-- enterable="false" 鼠标放到鼠标弹层上，移除鼠标弹层 -->
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row)"
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
    </el-card>
  </div>
</template>

<script>
import Axios from '../../common/utils/axios.js';
export default {
  data () {
    return {
      queryInfo: {
        query: '',      // 查询的内容
        pageNum: 1,     // 当前页码
        pageSize: 10,   // 每页显示条数
      },
      goodList: [],     // 商品列表
      total: 0,         // 商品总数
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList () {
      let { data, meta } = await Axios.get('/goods', {
        params: this.queryInfo
      })
      if (meta && meta.status !== 200) return this.$message.error(meta.msg)
      this.$message.success(meta.msg)
      this.goodList = data.goods
      this.total = data.total
    },

    // pageSize变化触发的回调
    handleSizeChange (newSize) {
      this.queryInfo.pageSize = newSize
      this.getGoodsList()
    },

    // pageNum变化触发的回调
    handleCurrentChange (newPage) {
      this.queryInfo.pageNum = newPage
      this.getGoodsList()
    },

    // 删除列表项
    async removeById (row) {
      let res = await this.$confirm(`确定删除id：${row.goodsId}的用户吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error);
      // 如果取消删除，res的值是字符串cancel;否则是confirm
      if (res != 'confirm') return this.$message.info('已取消删除')
      let deleteRes = await Axios.delete(`/goods/${row.goodsId}`)
      if (deleteRes.meta.status != 200) return this.$message.error(deleteRes.meta.msg)
      this.$message.success(deleteRes.meta.msg)
      this.getGoodsList()
    },

    //  添加商品导航跳转
    goAddPage () {
      // 编程式导航跳转
      this.$router.push('/goods-add')
    }
  }

}
</script>

<style lang="less" scoped>
</style>