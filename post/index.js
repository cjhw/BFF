const {
  server: { RpcServer }, // 创建rpc服务器的
  registry: { ZookeeperRegistry }, // 创建注册中心的
} = require('sofa-rpc-node')

const mysql = require('mysql2/promise')

const logger = console

// 创建注册中心
const registry = new ZookeeperRegistry({
  logger,
  // zookeeper的地址
  address: '127.0.0.1:2181',
})

// 创建RPC服务器实例
// 客户端连接服务器可以用zookeeper，也可以直接连rpcServer
const server = new RpcServer({
  logger,
  registry,
  port: 20000,
})

;(async function () {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'bff',
  })

  // 添加服务接口
  server.addService(
    { interfaceName: 'com.cai.post' }, // 域名反转+领域模型的名字
    {
      async getPostCount(userId) {
        const sql = `SELECT count(*) as postCount from post WHERE user_id=${userId} limit 1`
        const [rows] = await connection.execute(sql)
        return rows[0].postCount
      },
    }
  )

  // 启动RPC服务
  await server.start()
  // 将服务注册到zookeeper上
  await server.publish()
  console.log('文章微服务启动')
})()
