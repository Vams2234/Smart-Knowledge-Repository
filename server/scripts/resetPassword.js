const { sequelize } = require('../config/database');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables from the .env file in the server root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const resetPassword = async () => {
    try {
        // Connect to Database
        await sequelize.authenticate();
        console.log('✅ Connected to Database');

        const targetEmail = 'system@company.com';
        const newPassword = 'password123'; // The new password you want to set

        // Find the user
        const user = await User.findOne({ where: { email: targetEmail } });

        if (!user) {
            console.log(`❌ User with email ${targetEmail} not found.`);
        } else {
            // Manually hash the password to ensure consistency
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            user.password = hashedPassword;
            // Save with hooks: false to prevent double-hashing by the model
            await user.save({ hooks: false });
            console.log(`✅ Password for ${targetEmail} has been successfully reset to: ${newPassword}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
};

resetPassword();