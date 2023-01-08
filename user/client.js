const {
  client: { RpcClient },
  registry: { ZookeeperRegistry },
} = require('sofa-rpc-node')

let logger = console

const registry = new ZookeeperRegistry({
  logger,
  address: '127.0.0.1:2181',
})

;(async function () {
  // RPC客户端
  const client = new RpcClient({
    logger,
    registry,
  })

  // 创建一个消费者
  const consumer = client.createConsumer({ interfaceName: 'com.cai.user' })
  // 等待服务就绪
  await consumer.ready()
  const result = await consumer.invoke('getUserInfo', [1])
  console.log(result)
  process.exit(0)
})()
