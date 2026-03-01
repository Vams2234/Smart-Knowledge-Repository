const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT('long'), // Large text storage
        allowNull: false
    },
    fileType: {
        type: DataTypes.STRING
    },
    url: {
        type: DataTypes.STRING
    },
    metadata: {
        type: DataTypes.JSON
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Document;