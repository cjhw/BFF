const Redis = require('ioredis')
const LRUCache = require('lru-cache')

class CacheStore {
  constructor() {
    this.stores = []
  }

  add(store) {
    this.stores.push(store)
    return this
  }

  async set(key, value) {
    for (const store of this.stores) {
      await store.set(key, value)
    }
  }

  async get(key) {
    for (const store of this.stores) {
      const value = await store.get(key)
      if (value !== undefined) {
        return value
      }
    }
  }
}

class MemoryStore {
  constructor() {
    this.cache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60 * 24,
    })
  }

  async set(key, value) {
    this.cache.set(key, value)
  }

  async get(key) {
    return this.cache.get(key)
  }
}

class RedisStore {
  constructor(options = { host: 'localhost', port: '6379' }) {
    this.client = new Redis(options)
  }

  async set(key, value) {
    await this.client.set(key, JSON.stringify(value))
    await this.client.expires(key, 60)
  }

  async get(key) {
    const value = await this.client.get(key)
    return value ? JSON.parse(value) : undefined
  }
}

// 创建一个缓存实例
const cacheStore = new CacheStore()
// 添加缓存层
cacheStore.add(new MemoryStore())
cacheStore.add(new RedisStore(options))

const cacheMiddleware = (options) => {
  return async function (ctx, next) {
    ctx.cache = cacheStore
    await next()
  }
}

module.exports = cacheMiddleware
