const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Activity = sequelize.define('Activity', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    eventType: {
        type: DataTypes.STRING, // 'search', 'view', 'login', 'update'
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    },
    metadata: {
        type: DataTypes.JSON
    }
}, {
    timestamps: true
});

module.exports = Activity;