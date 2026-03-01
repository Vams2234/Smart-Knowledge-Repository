const { Op } = require('sequelize');
const Profile = require('../models/Profile');
const Document = require('../models/Document');

class IntelligentSearchService {
    async search(query, filters = {}) {
        const startTime = Date.now();
        
        // 1. Construct Where Clause
        const whereClause = {
            isActive: true
        };

        // 2. Apply Filters
        if (filters.department) whereClause.department = filters.department;
        if (filters.role) whereClause.role = { [Op.like]: `%${filters.role}%` };

        // Advanced Troubleshooting: Query Expansion
        const expandedQuery = this.expandQuery(query);

        // 3. Text Search Strategy
        const docWhere = {};

        if (query) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${query}%` } },
                { role: { [Op.like]: `%${expandedQuery}%` } }, // Use expanded for role/bio
                { bio: { [Op.like]: `%${expandedQuery}%` } },
            ];

            docWhere[Op.or] = [
                { title: { [Op.like]: `%${query}%` } },
                { content: { [Op.like]: `%${query}%` } }
            ];
        }

        // 4. Execute Query
        const [profiles, documents] = await Promise.all([
            Profile.findAll({
                where: whereClause,
                limit: 20,
                order: [['relevanceScore', 'DESC']]
            }),
            // Only search documents if no specific profile filters are applied
            (!filters.department && !filters.role) ? Document.findAll({
                where: docWhere,
                limit: 10
            }) : []
        ]);

        // Combine and map documents to match the frontend shape
        const results = [
            ...profiles.map(p => p.toJSON()),
            ...documents.map(d => ({
                ...d.toJSON(),
                name: d.title,
                role: 'Document',
                department: 'Knowledge Base',
                expertise: [d.fileType],
                relevanceScore: 50 // Default score for docs
            }))
        ];

        const processingTime = Date.now() - startTime;

        return {
            count: results.length,
            processingTime,
            results,
            metadata: {
                query,
                expandedQuery,
                filters
            }
        };
    }

    expandQuery(query) {
        if (!query) return '';
        const synonyms = {
            'react': 'reactjs frontend ui',
            'node': 'nodejs backend api',
            'manager': 'lead head director supervisor',
            'hr': 'human resources people ops',
            'dev': 'developer engineer programmer'
        };
        
        const lowerQ = query.toLowerCase();
        // Simple expansion: if query contains a key, append synonyms
        let expanded = lowerQ;
        Object.keys(synonyms).forEach(key => {
            if (lowerQ.includes(key)) {
                expanded += ` ${synonyms[key]}`;
            }
        });
        return expanded !== lowerQ ? expanded : query; // Return expanded or original
    }
}

module.exports = new IntelligentSearchService();