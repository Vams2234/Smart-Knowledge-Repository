const Activity = require('../models/Activity');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

class AnalyticsService {
    async logEvent(data) {
        return await Activity.create({
            userId: data.userId,
            eventType: data.eventType,
            description: data.description || `${data.action || ''} ${data.label || ''}`.trim(),
            metadata: data
        });
    }

    async getDashboardStats() {
        const totalSearches = await Activity.count({ where: { eventType: 'search' } });
        const activeUsers = await Activity.count({ distinct: true, col: 'userId' });
        
        return {
            totalSearches,
            activeUsers,
            avgResponseTime: 150, // Placeholder/Mock
            avgConfidence: 0.88   // Placeholder/Mock
        };
    }

    async getSearchTrends() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const activities = await Activity.findAll({
            where: {
                eventType: 'search',
                createdAt: { [Op.gte]: sevenDaysAgo }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', '*'), 'count']
            ],
            group: ['date'],
            order: [['date', 'ASC']]
        });
        
        return activities.map(a => ({
            date: a.get('date'),
            count: a.get('count')
        }));
    }

    async getUserActivity(userId) {
        return await Activity.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 10
        });
    }
}

module.exports = new AnalyticsService();