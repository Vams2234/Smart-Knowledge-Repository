const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    role: {
        type: DataTypes.STRING
    },
    department: {
        type: DataTypes.STRING
    },
    bio: {
        type: DataTypes.TEXT
    },
    expertise: {
        type: DataTypes.JSON
    },
    avatar: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true
});

module.exports = Profile;
