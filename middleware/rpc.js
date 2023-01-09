const {
  client: { RpcClient },
  registry: { ZookeeperRegistry },
} = require('sofa-rpc-node')
const logger = console

const rpcMiddleware = (options = {}) => {
  return async function (ctx, next) {
    const registry = new ZookeeperRegistry({
      logger,
      address: '127.0.0.1:2181',
    })

    // RPC客户端
    const client = new RpcClient({
      logger,
      registry,
    })

    const interfaceNames = options.interfaceNames || []
    const rpcConsumers = {}
    for (let i = 0; i < interfaceNames.length; i++) {
      const interfaceName = interfaceNames[i]
      // 创建一个消费者
      const consumer = client.createConsumer({ interfaceName })
      // 等待服务就绪
      await consumer.ready()
      rpcConsumers[interfaceName.split('.').pop()] = consumer
    }

    ctx.rpcConsumers = rpcConsumers
    await next()
  }
}

module.exports = rpcMiddleware
