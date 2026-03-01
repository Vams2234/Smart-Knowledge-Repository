const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bookmark = sequelize.define('Bookmark', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    itemId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING, // 'Profile' or 'Document'
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSON // Store snapshot of name, role, etc.
    }
}, {
    timestamps: true,
    indexes: [
        { unique: true, fields: ['userId', 'itemId'] }
    ]
});

module.exports = Bookmark;