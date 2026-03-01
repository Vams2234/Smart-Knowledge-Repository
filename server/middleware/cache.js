const { redisClient } = require('../config/redis');

// 4.3 Implement sophisticated caching layers
const cacheMiddleware = (duration = 3600) => {
    return async (req, res, next) => {
        // Skip if Redis is not open
        if (!redisClient.isOpen) return next();

        const key = `__express__${req.originalUrl || req.url}`;

        try {
            const cachedBody = await redisClient.get(key);
            if (cachedBody) {
                return res.json(JSON.parse(cachedBody));
            } else {
                res.sendResponse = res.json;
                res.json = (body) => {
                    redisClient.setEx(key, duration, JSON.stringify(body));
                    res.sendResponse(body);
                };
                next();
            }
        } catch (error) {
            console.error("Cache Error:", error);
            next();
        }
    };
};

module.exports = cacheMiddleware;