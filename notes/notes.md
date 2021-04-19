# 项目搭建

使用脚手架创建项目

![](./img/1.png)

安装element-ui

![](./img/2.png)

安装axios

![](./img/3.png)

安装less

```js
npm install less less-loader --save-dev
```

# 登录模块

登录时server和client不存在跨域问题情况：采用cookie和session记录状态；反之如果存在跨域，需要使用token方式维持状态？？？

- token原理分析

![](./img/4.png)

- 阿里第三方密码icon使用

- 将登录成功之后的token,保存在客户端的sessionStorage中，token 只在当前网站打开期间生效，所以保存在 sessionStorage而不是localStorage

- 使用`路由导航守卫`控制访问权限。比如如果用户没有登录，但是直接通过URL访问特定页面，需要重新导航到登录页面

- 用户退出功能实现：先销毁token就行了，接着跳转到登录页

- 授权API访问：其他接口请求时，必须在请求头中使用 'Authorization' 字段，并且使得该字段等于token值


# 首页页面布局

- 菜单列表联动处理




# 用户管理模块

- 前端实现分页
- 增加关键字查询后端查询逻辑


# 侧边栏模块

- 外部icon导入
- menu菜单栏右边border对不齐，找对应的`el-menu`类名，给其手动设置 `border-right: none`


# elementUI知识点记录

- elemenUI标签就是类名；比如`el-table-column` 直接使用`.el-table-column`

- 行内样式问题：暂时没发现行内样式生效

- style的scope问题导致的手动设置样式不生效，因为scope会默认给当前组件的每个元素增加一个类似于data-v-xxx的唯一标识，表示当前组件的样式只在当前组件生效，也正是因为如此，手动设置的样式需要找到匹配的元素，但是有了data-v-xxx这个标识导致匹配不到；进而手动设置的样式不生效，但是去除scope属性，直接设置样式又会导致全局样式污染；所以我们可以在使用elementUI的组件时，手动再其外部再包装一层div。

```css
/* 示例： */
.detail {
    .el-input__inner {
        height: 48px;
    }
}
/* 直接写style注意不要加scoped，然后用一个组件最外层的class包裹住，就不会改到所有的组件的样式了。 */
```




# axios

封装axios，包含请求拦截器对每个请求加`Authorization`进行授权访问

post请求还需要给参数进行编码

# 项目设计把控

路由层面





