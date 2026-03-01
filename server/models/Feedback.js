const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Feedback = sequelize.define('Feedback', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING, // 'search', 'general', 'document'
        defaultValue: 'general'
    },
    targetId: {
        type: DataTypes.UUID, // ID of the search result or item being rated
        allowNull: true
    },
    rating: {
        type: DataTypes.INTEGER, // 1-5
        allowNull: false
    },
    comment: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true
});

module.exports = Feedback;