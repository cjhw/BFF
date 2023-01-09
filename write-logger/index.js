const amqplib = require('amqplib')
const fs = require('fs-extra')

;(async function () {
  // 连接mq服务器
  const mqClient = await amqplib.connect('amqp://localhost')
  // 创建一个通道
  const logger = await mqClient.createChannel()
  // 创建一个名称为logger的队列，如果已经存在，不会重复创建
  await logger.assertQueue('logger')
  logger.consume('logger', async (event) => {
    // const message = JSON.parse(event.content.toString())
    await fs.appendFile('./logger.txt', event.content.toString() + '\n')
  })
})()
