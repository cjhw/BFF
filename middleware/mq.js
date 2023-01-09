const amqplib = require('amqplib')

const mqMiddleware = (options = {}) => {
  return async function (ctx, next) {
    // 连接mq服务器
    const mqClient = await amqplib.connect(options.url || 'amqp://localhost')
    // 创建一个通道
    const logger = await mqClient.createChannel()
    // 创建一个名称为logger的队列，如果已经存在，不会重复创建
    await logger.assertQueue('logger')
    ctx.channels = {
      logger,
    }
    await next()
  }
}

module.exports = mqMiddleware
