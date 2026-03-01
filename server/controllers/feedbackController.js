const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
    try {
        const { type, targetId, rating, comment } = req.body;
        const userId = req.user ? req.user.id : null;

        await Feedback.create({
            userId,
            type,
            targetId,
            rating,
            comment
        });

        res.json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};