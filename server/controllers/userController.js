const User = require('../models/User');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const Activity = require('../models/Activity');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.exportUserData = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findByPk(userId, { 
            attributes: { exclude: ['password'] } 
        });
        
        const comments = await Comment.findAll({ where: { userId } });
        const bookmarks = await Bookmark.findAll({ where: { userId } });
        const activity = await Activity.findAll({ where: { userId } });
        
        res.json({
            profile: user,
            comments,
            bookmarks,
            activity,
            exportDate: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPreferences = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: ['preferences'] });
        res.json(user.preferences || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        user.preferences = { ...user.preferences, ...req.body };
        await user.save();
        res.json(user.preferences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};