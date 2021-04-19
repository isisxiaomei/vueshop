<template>
  <div>
    <!-- 面包屑 -->
    <div class="permiss-breadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 表格区域 -->
    <div class="permiss-card">
      <el-card>
        <el-table :data="permissionList" style="width: 100%" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="authName" label="权限名称"> </el-table-column>
          <el-table-column prop="path" label="路径"> </el-table-column>
          <el-table-column label="权限等级">
            <template slot-scope="scope">
              <el-tag type="" effect="dark">{{
                levelMap[String(scope.row.level)]
              }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import Axios from "../../common/utils/axios.js";
export default {
  data () {
    return {
      permissionList: [],   // 权限列表,
      levelMap: {           // 等级映射
        '1': '等级一',
        '2': '等级二',
        '3': '等级三',
        '4': '等级四',
      }
    }
  },
  created () {
    this.getPermissionList()
  },
  methods: {
    async getPermissionList () {

      let { data, meta } = await Axios.get(`/permission/list`)
      if (meta && meta.status != 200) return this.$message.error('获取权限列表失败')
      if (data && data.length > 0) {
        this.permissionList = data
        this.$message.success(meta.msg)
      }
    }
  }
}
</script>

<style lang="less">
.permiss-breadcrumb .el-breadcrumb {
  font-size: 15px;
  margin-bottom: 15px;
}
</style>