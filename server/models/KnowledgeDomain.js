const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KnowledgeDomain = sequelize.define('KnowledgeDomain', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    icon: {
        type: DataTypes.STRING
    },
    keywords: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    scopePatterns: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Array of objects with pattern and weight'
    },
    confidenceThreshold: {
        type: DataTypes.FLOAT,
        defaultValue: 0.7
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = KnowledgeDomain;