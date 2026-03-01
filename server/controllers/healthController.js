const { sequelize } = require('../config/database');
const os = require('os');

exports.getSystemHealth = async (req, res) => {
    try {
        // Check DB connection
        let dbStatus = 'disconnected';
        try {
            await sequelize.authenticate();
            dbStatus = 'connected';
        } catch (e) {
            dbStatus = 'error';
        }

        const health = {
            status: dbStatus === 'connected' ? 'ok' : 'degraded',
            uptime: process.uptime(),
            timestamp: new Date(),
            services: {
                database: dbStatus,
                server: 'running'
            },
            memory: process.memoryUsage(),
            system: {
                loadAvg: os.loadavg(),
                freeMem: os.freemem(),
                totalMem: os.totalmem()
            }
        };
        res.json(health);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};