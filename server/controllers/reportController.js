const Report = require('../models/Report');

exports.createReport = async (req, res) => {
    try {
        const { targetId, targetType, reason, description } = req.body;
        const reporterId = req.user.id;

        await Report.create({
            reporterId,
            targetId,
            targetType,
            reason,
            description
        });

        res.status(201).json({ message: 'Report submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.findAll({ order: [['createdAt', 'DESC']] });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByPk(req.params.id);
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        report.status = status;
        await report.save();
        res.json({ message: 'Report status updated', report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};