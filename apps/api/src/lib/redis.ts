import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

redis.on('connect', () => {
  console.log('✅ Redis bağlandı')
})

redis.on('error', (err) => {
  console.error('❌ Redis hatası:', err)
})

export default redis