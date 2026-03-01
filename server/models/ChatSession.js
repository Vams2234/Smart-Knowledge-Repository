const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatSession = sequelize.define('ChatSession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true // Allow anonymous chats if needed
    },
    title: {
        type: DataTypes.STRING,
        defaultValue: 'New Chat'
    },
    messages: {
        type: DataTypes.JSON, // Store array of {role, content}
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = ChatSession;