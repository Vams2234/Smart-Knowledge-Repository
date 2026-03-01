const vectorService = require('../services/vectorService');
const Profile = require('../models/Profile');
const Document = require('../models/Document');
const SearchQuery = require('../models/SearchQuery');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');

exports.advancedSearch = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: 'Query is required' });

        // Log search if user is authenticated (manually check token since route is public)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
                await SearchQuery.create({
                    query,
                    userId: decoded.id
                });
            } catch (e) { /* Ignore invalid token for logging */ }
        }

        // Vector Search
        // Assuming vectorService.search returns array of { id, score, metadata }
        const vectorResults = await vectorService.search(query, 10);
        
        // Hydrate results with DB data
        const results = await Promise.all(vectorResults.map(async (result) => {
            if (result.metadata.type === 'profile') {
                const profile = await Profile.findByPk(result.id);
                return profile ? { ...profile.toJSON(), type: 'Profile', score: result.score } : null;
            } else {
                const doc = await Document.findByPk(result.id);
                return doc ? { ...doc.toJSON(), type: 'Document', score: result.score } : null;
            }
        }));

        // Filter out nulls (deleted items)
        res.json({ results: results.filter(r => r !== null) });
    } catch (error) {
        console.error('Advanced search error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getTrendingSearches = async (req, res) => {
    try {
        const trending = await SearchQuery.findAll({
            attributes: [
                'query',
                [sequelize.fn('COUNT', sequelize.col('query')), 'count']
            ],
            group: ['query'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 5
        });
        res.json(trending.map(t => t.query));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRecentSearches = async (req, res) => {
    try {
        const rawHistory = await SearchQuery.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 20,
            attributes: ['query']
        });
        
        const uniqueQueries = [...new Set(rawHistory.map(h => h.query))].slice(0, 5);
        res.json(uniqueQueries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};