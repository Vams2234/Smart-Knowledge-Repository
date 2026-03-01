const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SearchQuery = sequelize.define('SearchQuery', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    query: {
        type: DataTypes.STRING,
        allowNull: false
    },
    intent: {
        type: DataTypes.STRING
    },
    confidence: {
        type: DataTypes.FLOAT
    },
    processingTime: {
        type: DataTypes.INTEGER // in ms
    },
    resultsCount: {
        type: DataTypes.INTEGER
    },
    userId: {
        type: DataTypes.UUID
    },
    sessionId: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true
});

module.exports = SearchQuery;