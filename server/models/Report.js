const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    reporterId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    targetId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    targetType: {
        type: DataTypes.STRING, // 'Document', 'Profile'
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending' // 'pending', 'resolved', 'dismissed'
    }
}, {
    timestamps: true
});

module.exports = Report;