<template>
  <div>
    <!-- 面包屑 -->
    <div class="p-role-breadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 按钮和角色列表 -->
    <div class="p-role-content">
      <el-card>
        <el-row :gutter="10">
          <el-col :span="6">
            <el-button type="primary">添加角色</el-button>
          </el-col>
        </el-row>
        <el-table :data="roleList" style="width: 100%" border stripe>
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row
                v-for="(item1, index) in scope.row.children"
                :key="item1.id + index"
                :class="['bg-bottom', index === 0 ? 'bg-top' : '', 'v-center']"
              >
                <!-- 一级权限占5列 -->
                <el-col :span="5">
                  <el-tag>{{ item1.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 二三级权限占19列 -->
                <el-col :span="19">
                  <el-row
                    v-for="(item2, index) in item1.children"
                    :key="item2.id + index"
                    :class="[index === 0 ? '' : 'bg-top', 'v-center']"
                  >
                    <el-col :span="6">
                      <el-tag type="success">{{ item2.authName }}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag
                        type="warning"
                        v-for="item3 in item2.children"
                        :key="item3.id"
                        closable
                        @close="removePermissByRoleId(scope.row, item3.id)"
                      >
                        {{ item3.authName }}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!-- 索引列 -->
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="roleName" label="角色名称"> </el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit"
                >编辑</el-button
              >
              <el-button size="mini" type="danger" icon="el-icon-delete"
                >删除</el-button
              >
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-setting"
                @click="showPermission(scope.row)"
                >分配权限</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-dialog
        title="树状权限列表"
        :visible.sync="dialogVisible"
        width="60%"
        @close="closeDialog"
      >
        <el-tree
          :data="permissionTree"
          :props="defaultProps"
          :default-checked-keys="defKeys"
          node-key="id"
          default-expand-all
          show-checkbox
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setPermission()">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Axios from "../../common/utils/axios.js";
export default {
  data () {
    return {
      roleList: [],   // 权限列表,
      dialogVisible: false,
      permissionTree: null,
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: []
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      let { data, meta } = await Axios.get(`/permission-roles`)
      if (meta && meta.status != 200) return this.$message.error('获取角色权限列表失败')
      if (data && data.length > 0) {
        this.roleList = data
        this.$message.success(meta.msg)
      }
    },
    async removePermissByRoleId (role, permissId) {
      let res = await this.$confirm(`确定删除权限id：${permissId}的用户吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error);
      // 如果取消删除，res的值是字符串cancel
      // 如果取消删除，res的值是字符串confirm
      if (res != 'confirm') return this.$message.info('已取消删除')

      let { data, meta } = await Axios.get(`/api/roles?roleId=${role.id}&permissId=${permissId}`)
      if (meta && meta.status != 200) return this.$message.error('删除权限失败')
      if (data && data.length > 0) {
        //   TODO:备注这里没有直接请求刷新列表接口，而是直接将返回的数据（这里返回的数据就是删除后的）赋值给当前行，这样不渲染整个列表，折叠也就不会收起了
        role.children = data[0].children
        console.log(data[0].children);
        this.$message.success(meta.msg)
      }
    },
    // 查看所有树状权限列表
    async showPermission (role) {
      let { data, meta } = await Axios.get(`/api/permissList/tree`)
      if (meta && meta.status != 200) return this.$message.error('获取树状权限列表失败')
      if (data && data.length > 0) {
        this.permissionTree = data
      }
      this.queryDefKeys(role)
      this.dialogVisible = true
    },
    // 递归查找默认已经被选中的节点
    queryDefKeys (currentNode) {
      if (!currentNode.children) {
        return this.defKeys.push(currentNode.id)
      }
      currentNode.children.forEach(item => {
        this.queryDefKeys(item)
      })
    },
    closeDialog () {
      this.defKeys.length = 0
    },
    async setPermission () {
      this.dialogVisible = false
      const nodeKeys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const { meta } = await Axios.get('/api/setPermiss', {
        params: nodeKeys.join(',')
      })
      if (meta && meta.status != 200) return this.$message.error(meta.msg)
      this.$message.success(meta.msg)
    }
  }

}
</script>

<style lang="less">
.p-role-breadcrumb .el-breadcrumb {
  font-size: 15px;
  margin-bottom: 15px;
}
.p-role-content .el-table .el-table_1_column_5 {
  text-align: center;
}
.el-tag {
  margin: 7px;
}
.bg-top {
  border-top: 1px solid #eee;
}
.bg-bottom {
  border-bottom: 1px solid #eee;
}
.v-center {
  display: flex;
  align-items: center;
}
</style>