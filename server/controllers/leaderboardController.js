const User = require('../models/User');
const Document = require('../models/Document');
const Comment = require('../models/Comment');

exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'avatar', 'department', 'role'],
            include: [
                { model: Document, attributes: ['id'] },
                { model: Comment, attributes: ['id'] }
            ]
        });

        const leaderboard = users.map(user => {
            const docCount = user.Documents ? user.Documents.length : 0;
            const commentCount = user.Comments ? user.Comments.length : 0;
            
            // Scoring logic: 10 pts per doc, 2 pts per comment
            const score = (docCount * 10) + (commentCount * 2);

            return {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
                department: user.department,
                docCount,
                commentCount,
                score
            };
        });

        // Sort by score descending
        res.json(leaderboard.sort((a, b) => b.score - a.score).slice(0, 10));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};