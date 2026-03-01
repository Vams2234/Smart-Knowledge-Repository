const analyticsService = require('../services/analyticsService');

exports.logEvent = async (req, res) => {
    try {
        await analyticsService.logEvent(req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const stats = await analyticsService.getDashboardStats();
        const trends = await analyticsService.getSearchTrends();
        
        res.json({ 
            stats,
            recentActivity: trends
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserActivity = async (req, res) => {
    try {
        const activities = await analyticsService.getUserActivity(req.user.id);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};