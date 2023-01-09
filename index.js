const Koa = require('koa')
const router = require('koa-router')()
const logger = require('koa-logger')
const rpcMiddleware = require('./middleware/rpc')
const app = new Koa()

app.use(logger())
app.use(
  rpcMiddleware({
    interfaceNames: ['com.cai.post', 'com.cai.user'],
  })
)

router.get('/', async (ctx) => {
  const userId = ctx.query.userId
  const {
    rpcConsumers: { user, post },
  } = ctx

  const [userInfo, postCount] = await Promise.all([
    user.invoke('getUserInfo', [userId]),
    post.invoke('getPostCount', [userId]),
  ])

  // 数据裁剪，将不需要的信息裁剪掉
  delete userInfo.password
  // 数据脱敏
  userInfo.phone = userInfo.phone.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2')
  userInfo.avatar = `http://img.cai.com/${userInfo.avatar}`
  ctx.body = {
    userInfo,
    postCount,
  }
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(3000, () => {
  console.log('bff server is running at 3000')
})
