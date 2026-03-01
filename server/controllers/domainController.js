const KnowledgeDomain = require('../models/KnowledgeDomain');

exports.createDomain = async (req, res) => {
    try {
        const { name, description, icon, keywords } = req.body;
        const domain = await KnowledgeDomain.create({
            name,
            description,
            icon,
            keywords: keywords || []
        });
        res.status(201).json(domain);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllDomains = async (req, res) => {
    try {
        const domains = await KnowledgeDomain.findAll({ order: [['name', 'ASC']] });
        res.json(domains);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteDomain = async (req, res) => {
    try {
        await KnowledgeDomain.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Domain deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};