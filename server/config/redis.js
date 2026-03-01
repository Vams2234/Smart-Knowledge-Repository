const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 3) return false; // Stop retrying after 3 attempts
            return 1000;
        }
    }
});

redisClient.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') return; // Ignore connection refused errors
    console.log('❌ Redis Client Error', err);
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('✅ Redis Connected');
    } catch (error) {
        console.log('⚠️ Redis Connection Failed (Caching disabled)');
    }
};

// 4.3 Connection Pooling & Management
// Redis client handles connection pooling internally

module.exports = {
    redisClient,
    connectRedis
};