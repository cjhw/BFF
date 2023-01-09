const Koa = require('koa')
const router = require('koa-router')()
const logger = require('koa-logger')
const rpcMiddleware = require('./middleware/rpc')
const cacheMiddleware = require('./middleware/cache')
const mqMiddleware = require('./middleware/mq')
const app = new Koa()

app.use(logger())
app.use(
  rpcMiddleware({
    interfaceNames: ['com.cai.post', 'com.cai.user'],
  })
)

app.use(cacheMiddleware())
app.use(mqMiddleware())

router.get('/', async (ctx) => {
  const userId = ctx.query.userId
  ctx.channels.logger.sendToQueue(
    'logger',
    Buffer.from(
      JSON.stringify({
        method: ctx.method,
        path: ctx.path,
        userId,
      })
    )
  )
  const cacheKey = `${ctx.method}-${ctx.path}-${userId}`
  let cacheData = await ctx.cache.get(cacheKey)
  console.log('cacheData', cacheData)
  if (cacheData) {
    ctx.body = cacheData
    return
  }
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

  cacheData = {
    userInfo,
    postCount,
  }

  await ctx.cache.set(cacheKey, cacheData)

  ctx.body = cacheData
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(3000, () => {
  console.log('bff server is running at 3000')
})
