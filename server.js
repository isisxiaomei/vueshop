
let express = require('express')
// 创建web服务器
const app = express()

// 托管静态资源目录为dist
app.use(express.static('./dist'))

app.listen(80, () => {
  console.log('server is runing...');
})

