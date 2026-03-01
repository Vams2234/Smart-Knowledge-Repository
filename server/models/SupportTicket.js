const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SupportTicket = sequelize.define('SupportTicket', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'open' // 'open', 'in_progress', 'closed'
    },
    priority: {
        type: DataTypes.STRING,
        defaultValue: 'medium' // 'low', 'medium', 'high'
    }
}, {
    timestamps: true
});

module.exports = SupportTicket;