<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div class="header-left">
        <img src="../assets/logo.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout" class="logout-btn">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-btn" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <!-- 点击的时候会联动，只要对index做了区分就可以了；并且index只接受字符串 -->
          <el-submenu
            :index="'/' + item.path"
            v-for="item of menuList"
            :key="item.id"
          >
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + itemChild.path"
              v-for="itemChild in item.children"
              :key="itemChild.id"
              @click="saveActiveStatus('/' + itemChild.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ itemChild.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <!-- router-view给home组件的子组件提供的渲染位置-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Axios from '../common/utils/axios';
export default {
  data () {
    return {
      menuList: null,
      isCollapse: false,    // 是否水平折叠菜单栏
      activePath: ''        // 保存动态选中的侧栏菜单项path
    }
  },
  created () {
    this.getMenuList()
    this.initData()
  },
  methods: {

    // 初始化页面数据
    initData () {
      this.activePath = window.sessionStorage.getItem('activePath')
    },

    // 退出登录
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },

    // 获取菜单列表
    async getMenuList () {
      const res = await Axios.get('/menus')
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },

    // 菜单栏折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },

    // 点击菜单项后，将index的状态存放在sessionStorage中，刷新页面时，可以从sessionStorage中获取活跃的状态，赋值给default-active属性，高亮菜单项
    saveActiveStatus (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }

  }
}
</script>

<style scoped lang="less">
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  .header-left {
    img {
      width: 50px;
      height: 50px;
    }
    span {
      // TODO:  样式后续自己补上写
      color: #eaedf1;
    }
  }
}

.el-aside {
  background-color: #333744;
  .toggle-btn {
    background-color: #4a5064;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    font-size: 10px;
    line-height: 24px;
    cursor: pointer;
  }
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}
</style>

