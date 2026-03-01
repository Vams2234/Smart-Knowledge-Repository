const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (notification && notification.userId === req.user.id) {
            notification.isRead = true;
            await notification.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.update({ isRead: true }, {
            where: { userId: req.user.id, isRead: false }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Internal helper to create notifications
exports.createNotification = async (userId, message, type = 'info', link = null) => {
    try {
        await Notification.create({ userId, message, type, link });
    } catch (error) {
        console.error('Notification creation failed:', error);
    }
};