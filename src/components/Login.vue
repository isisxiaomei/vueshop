<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar-box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单 -->
      <el-form
        label-width="0px"
        class="login-form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <!-- username -->
        <el-form-item class="username" prop="userName">
          <el-input
            prefix-icon="el-icon-user-solid"
            v-model="loginForm.userName"
          ></el-input>
        </el-form-item>
        <!-- passwd -->
        <el-form-item class="passwd" prop="password">
          <el-input
            prefix-icon="el-icon-s-cooperation"
            v-model="loginForm.password"
            show-password
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="login-set-btns">
          <el-button type="primary" @click="onSubmit">登录</el-button>
          <el-button type="info" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import Axios from '../common/utils/axios.js'
export default {
  data () {
    return {
      loginForm: {        // 表单数据绑定
        userName: 'admin',
        password: 123455
      },
      loginFormRules: {   // 表单规则校验
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ]
      }
    }
  },
  methods: {
    onReset () {
      // 只是清空提示的校验规则和输入栏的输入值，但是会显示默认值
      this.$refs.loginFormRef.resetFields()
    },
    onSubmit () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const result = await Axios.post('/login', this.loginForm);
        if (result.meta.status != 200) return this.$message.error(result.meta.msg);
        this.$message.success(result.meta.msg)
        window.sessionStorage.setItem('token', result.data.token)
        this.$router.push('/home')
      })
    }
  }
};
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: #2b4b6b;
}
.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar-box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login-form {
    position: absolute;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0px 10px;
  }
  .login-set-btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
