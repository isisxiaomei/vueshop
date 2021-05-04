import Vue from "vue";
import VueRouter from "vue-router";
// import Login from "../components/Login.vue";
// import Home from "../components/Home.vue";
// import Welcome from "../components/Welcome.vue";
// import User from "../components/user/Users.vue";
// import Cate from "../components/goods/Cate.vue";
// import Params from "../components/goods/Params.vue";
// import List from "../components/goods/List.vue";
// import Add from "../components/goods/Add.vue";
// import Report from "../components/report/Report.vue";
// import Order from "../components/order/order.vue";
// import PermissionList from "../components/permission/PermissionList.vue";
// import PermissionRole from "../components/permission/PermissionRole.vue";

const Login = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/Welcome.vue')

const User = () => import(/* webpackChunkName: "user-permiss-role" */ '../components/user/Users.vue')
const PermissionList = () => import(/* webpackChunkName: "user-permiss-role" */ '../components/permission/PermissionList.vue')
const PermissionRole = () => import(/* webpackChunkName: "user-permiss-role" */ '../components/permission/PermissionRole.vue')

const Cate = () => import(/* webpackChunkName: "cate-params" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "cate-params" */ '../components/goods/Params.vue')

const List = () => import(/* webpackChunkName: "goods-add" */ '../components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "goods-add" */ '../components/goods/Add.vue')

const Report = () => import(/* webpackChunkName: "report-order" */ '../components/report/Report.vue')
const Order = () => import(/* webpackChunkName: "report-order" */ '../components/order/order.vue')



Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  {
    // 先访问渲染home组件，接着home组件的内容部分使用 `router-view` 给 重定向的welcome组件提供渲染出口位置
    path: "/home",
    component: Home,
    redirect: '/welcome',
    children: [
      { path: "/welcome", component: Welcome, },
      { path: "/user-list", component: User },
      { path: "/permission-list", component: PermissionList },
      { path: "/permission-roles", component: PermissionRole },
      { path: "/goods-sort", component: Cate },
      { path: "/sort-param", component: Params },
      { path: "/goods-list", component: List },
      { path: "/goods-add", component: Add },
      { path: "/reports-list", component: Report },
      { path: "/order-list", component: Order },
    ]
  },

];

const router = new VueRouter({
  routes
});




// 挂载路由导航守卫
/**
 * to: 将要访问的路径
 * from: 代表从哪个路径跳转而来
 * next: 是一个函数，表示放行
 */
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  let token = window.sessionStorage.getItem('token')
  // token为空，则直接跳转到login页
  if (!token) {
    return next('/login')
  }
  // 如果有token则已经登录了，这里直接放行
  next()
})

export default router;
