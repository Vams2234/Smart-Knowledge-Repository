const documentService = require('../services/documentService');
const webScraperService = require('../services/webScraperService');
const Document = require('../models/Document');
const path = require('path');

exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const document = await documentService.processUpload(req.file);
        
        if (req.user && document) {
            await Document.update({ userId: req.user.id }, { where: { id: document.id } });
        }

        res.json({ message: 'File uploaded successfully', file: document });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.scrapeUrl = async (req, res) => {
    try {
        const { url } = req.body;
        const doc = await webScraperService.scrape(url, req.user.id);
        res.json({ message: 'URL scraped and indexed successfully', document: doc });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.downloadDocument = async (req, res) => {
    try {
        const doc = await Document.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const filePath = path.join(__dirname, '..', doc.url);
        res.download(filePath, doc.originalName);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllDocuments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Document.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });
        
        res.json({
            documents: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalDocuments: count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        await Document.destroy({ where: { id } });
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};