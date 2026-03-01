const Comment = require('../models/Comment');
const User = require('../models/User');

exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { id: documentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.create({
            userId,
            documentId,
            content
        });

        // Fetch user details to return with comment
        const user = await User.findByPk(userId, { attributes: ['username', 'avatar'] });
        
        res.status(201).json({
            ...comment.toJSON(),
            User: user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { id: documentId } = req.params;
        const comments = await Comment.findAll({
            where: { documentId },
            include: [{
                model: User,
                attributes: ['username', 'avatar']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await comment.destroy();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};