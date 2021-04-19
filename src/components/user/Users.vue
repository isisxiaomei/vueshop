<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 表单区域 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            :clearable="true"
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="isShowAddUserDialog = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="userName" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="roleName" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <!-- slot-scope="scope"   scope.raw可以获取当前行的数据对象； 如果设置了slot-scope，则table-column的props就不会生效了-->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mgState"
              @change="saveUserState(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <!-- enterable="false" 鼠标放到鼠标弹层上，移除鼠标弹层 -->
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="modifyUser(scope.row)"
            >
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row)"
            >
            </el-button>
            <el-tooltip content="分配角色" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showRole(scope.row)"
              >
              </el-button>
            </el-tooltip>
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
        :total="totalNum"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框  -->
    <el-dialog
      title="添加用户"
      :visible.sync="isShowAddUserDialog"
      width="30%"
      @close="closedAddUserDialog"
    >
      <!-- 内容主体 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addForm.userName"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- footer取消确定按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowAddUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="onAddUserSubmit">确 定 </el-button>
      </span>
    </el-dialog>

    <!--  修改用户对话框 v-if="isShowModifyDialog"-->
    <el-dialog
      title="修改用户信息"
      :visible="isShowModifyDialog"
      width="50%"
      @close="closedModifyDialog"
    >
      <el-form
        :model="rowItem"
        ref="rowItemFormRef"
        :rules="modifyFormRules"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="rowItem.userName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="rowItem.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="rowItem.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowModifyDialog = false">取 消</el-button>
        <el-button type="primary" @click="onModifyUserSubmit">确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="isShowRoleVisible"
      width="60%"
      @close="resetRoleDialog"
    >
      <div>
        <p>当前用户：{{ userInfo.userName }}</p>
        <p>当前角色：{{ userInfo.roleName }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Axios from '../../common/utils/axios.js';
export default {

  data () {
    // 表单自定义邮箱规则校验：value是输入值，校验成功直接调cb()；失败需要传递error给cb
    var checkEmail = (rule, value, cb) => {
      let regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的邮箱'))
    };
    let checkMobile = (rule, value, cb) => {
      let regPhone = /^[1][3,4,5,7,8][0-9]{9}$/
      if (regPhone.test(value)) {
        return cb()
      }
      cb(new Error('请输入11位正确的手机号'))
    };

    this.userInfo = {}

    return {
      // 请求参数
      queryInfo: {
        query: null,                  // 查询参数
        pageNum: 1,                   // 当前页码
        pageSize: 2,                  // 每页显示条数
      },
      totalNum: null,                 // 总记录数
      pageNum: null,                  // 当前页码
      userList: [],                   // 用户信息列表
      isShowAddUserDialog: false,     // 添加用户对话框是否展示
      addForm: {                      // 添加用户表单数据对象
        userName: '',
        password: '',
        email: '',
        mobile: '',
      },
      addFormRules: {                 // 添加用户表单属性规则校验
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      isShowModifyDialog: false,      // 是否展示修改用户对话框
      rowItem: {},                    // 被选择的列表行
      modifyFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      isShowRoleVisible: false, // 是否展示分配角色对话框
      selectRoleId: '',             // 已选中的角色id值
      roleList: '',                 // 角色列表
    }
  },
  created () {
    this.getUserList()
  },
  methods: {

    // 用户列表
    async getUserList () {
      const res = await Axios.get('/users', { params: this.queryInfo })
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.totalNum = res.data.totalNum
      this.pageNum = res.data.pageNum
    },

    // 每页显示条数变化触发的回调
    handleSizeChange (newPageSize) {
      this.queryInfo.pageSize = newPageSize
      this.getUserList()
    },

    // 页面变化触发的回调
    handleCurrentChange (newPageNum) {
      this.queryInfo.pageNum = newPageNum
      this.getUserList()
    },

    // 保存用户状态更改
    async saveUserState (rowItem) {
      const res = await Axios.put(`/users/${rowItem.id}/state/${rowItem.mgState}`)
      if (res.meta.status != 200) {
        rowItem.mgState = !rowItem.mgState
        return this.$message.error(`更新用户状态失败`)
      }
      this.$message.success(res.meta.msg)
    },

    // 添加用户
    onAddUserSubmit () {
      // validate对整个表单进行校验，参数为一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：是否校验成功和未通过校验的字段。valid是boolean值，如果校验不通过则false
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const res = await Axios.post(`/addusers`, this.addForm)
        if (res.meta.status != 201) {
          return this.$message.error(`添加用户失败`)
        }
        this.$message.success(res.meta.msg)
        this.isShowAddUserDialog = false
        this.getUserList()
      })
    },

    // 修改用户表单提交 /${this.rowItem.userName}/${this.rowItem.email}/${this.rowItem.mobile}
    onModifyUserSubmit () {
      this.$refs.rowItemFormRef.validate(async valid => {
        if (!valid) return
        const res = await Axios.put(`/modifyusers/${this.rowItem.id}`)
        if (res.meta.status != 200) {
          return this.$message.error(`修改用户失败`)
        }
        this.$message.success(res.meta.msg)
        this.isShowModifyDialog = false
        this.getUserList()
      })
    },

    // 监听添加用户对话框的关闭不管是点击确定/取消/❌按钮，
    closedAddUserDialog () {
      // 清空校验规则提示，再次进入只展示表单value默认值
      this.$refs.addFormRef.resetFields()
    },

    // 监听修改用户对话框的关闭
    closedModifyDialog () {
      this.$refs.rowItemFormRef.resetFields()
    },

    // TODO:点击修改用户 有问题后面需要再看
    modifyUser (rowItem) {
      this.rowItem = rowItem
      this.isShowModifyDialog = true
      console.log(111111, this.rowItem);
    },

    // 删除用户
    async deleteUser (rowItem) {
      let res = await this.$confirm(`确定删除id：${rowItem.id}的用户吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error);
      // 如果取消删除，res的值是字符串cancel
      // 如果取消删除，res的值是字符串confirm
      if (res != 'confirm') return this.$message.info('已取消删除')
      let deleteRes = await Axios.delete(`/deleteUserById/${this.rowItem.id}`)
      if (deleteRes.meta.status != 200) return this.$message.error(`删除用户失败`)
      this.$message.success(deleteRes.meta.msg)
      this.getUserList()
    },

    // 展示分配角色对话框
    async showRole (userInfo) {
      this.userInfo = userInfo
      this.isShowRoleVisible = true
      let { data, meta } = await Axios.get(`/permission-roles`)
      if (meta && meta.status != 200) return this.$message.error('获取角色权限列表失败')
      if (data && data.length > 0) {
        this.roleList = data
        this.$message.success(meta.msg)
      }
    },

    // 点击确定按钮分配角色
    async saveRoleInfo () {
      if (!this.selectRoleId) {
        return this.$message.error('selectRoleId为空，请选择要分配的角色')
      }
      let { meta } = await Axios.put(`/users/${this.userInfo.id}/role`, {
        'rid': this.selectRoleId
      })
      if (meta && meta.status != 200) return this.$message.error('分配角色失败')
      this.$message.success(meta.msg)
      this.getUserList()
      this.isShowRoleVisible = false
    },

    // @close监听对话框的关闭，重置对话框上的文本等
    resetRoleDialog () {
      this.selectRoleId = ''
      this.userInfo = {}
    }

  }
}
</script>

<style lang="less">
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 12px;
}
.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
  .el-row {
    margin-bottom: 20px;
  }
  .el-table {
    margin-bottom: 20px;
    .el-table_1_column_7 {
      text-align: center;
    }
  }
}
</style>
