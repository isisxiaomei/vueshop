// 项目开发阶段用到的babel依赖
// transform-remove-console： 只在prod模式时移除console
const prodPlugins = []

if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: [
    [
      "component",
      {
        libraryName: "element-ui",
        styleLibraryName: "theme-chalk"
      }
    ],
    ...prodPlugins,
    '@babel/plugin-syntax-dynamic-import',
  ]
};
