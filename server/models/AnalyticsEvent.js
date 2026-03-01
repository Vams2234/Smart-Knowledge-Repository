const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AnalyticsEvent = sequelize.define('AnalyticsEvent', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    eventType: {
        type: DataTypes.STRING, // 'view_profile', 'click_result', 'feedback', 'error'
        allowNull: false
    },
    category: {
        type: DataTypes.STRING // 'search', 'chat', 'system'
    },
    action: {
        type: DataTypes.STRING
    },
    label: {
        type: DataTypes.STRING
    },
    value: {
        type: DataTypes.INTEGER
    },
    metadata: {
        type: DataTypes.JSON
    },
    userId: {
        type: DataTypes.STRING
    },
    sessionId: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['eventType'] },
        { fields: ['createdAt'] }
    ]
});

module.exports = AnalyticsEvent;