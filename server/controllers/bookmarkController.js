const Bookmark = require('../models/Bookmark');

exports.toggleBookmark = async (req, res) => {
    try {
        const { userId, itemId, type, metadata } = req.body;
        
        const existing = await Bookmark.findOne({ where: { userId, itemId } });
        
        if (existing) {
            await existing.destroy();
            return res.json({ bookmarked: false });
        } else {
            await Bookmark.create({ userId, itemId, type, metadata });
            return res.json({ bookmarked: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.findAll({ 
            where: { userId: req.params.userId },
            attributes: ['itemId']
        });
        res.json(bookmarks.map(b => b.itemId));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBookmarkedItems = async (req, res) => {
    try {
        const bookmarks = await Bookmark.findAll({ 
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']]
        });
        
        const items = bookmarks.map(b => ({
            id: b.itemId,
            type: b.type,
            ...b.metadata
        }));
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};