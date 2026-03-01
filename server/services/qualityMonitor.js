const { Op } = require('sequelize');
const Profile = require('../models/Profile');

class QualityMonitor {
    async getDataQualityMetrics() {
        const totalProfiles = await Profile.count();
        
        // Freshness: Updated in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const freshProfiles = await Profile.count({
            where: { updatedAt: { [Op.gte]: thirtyDaysAgo } }
        });

        // Completeness: Has Bio and Expertise
        // Note: JSON array check syntax depends on MySQL version, using simple null check here
        const completeProfiles = await Profile.count({
            where: {
                bio: { [Op.ne]: null },
                role: { [Op.ne]: null }
            }
        });

        return {
            totalProfiles,
            freshnessScore: totalProfiles ? ((freshProfiles / totalProfiles) * 100).toFixed(1) : 0,
            completenessScore: totalProfiles ? ((completeProfiles / totalProfiles) * 100).toFixed(1) : 0
        };
    }

    async getSystemHealth() {
        const memoryUsage = process.memoryUsage();
        return {
            status: 'healthy',
            uptime: process.uptime(),
            memory: {
                rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
            }
        };
    }
}

module.exports = new QualityMonitor();