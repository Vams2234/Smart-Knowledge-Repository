const User = require('../models/User');
const Setting = require('../models/Setting');
const notificationController = require('./notificationController');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_123', {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        
        // Normalize email
        email = email.toLowerCase().trim();
        
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = await User.create({ username, email, password });

        // Send Welcome Notification
        await notificationController.createNotification(
            user.id, 
            'Welcome to Smart Knowledge Repository! Complete your profile to get started.', 
            'success', 
            '/profile'
        );

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    let { email } = req.body;
    email = email.toLowerCase().trim();
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Hash token and save to DB
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // In production, send email here. For dev, return the token/URL.
        const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;

        res.status(200).json({ success: true, data: 'Email sent (Simulated)', resetUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken,
                resetPasswordExpire: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();

        res.status(200).json({ success: true, data: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();
        
        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            // Check Maintenance Mode
            const maintenance = await Setting.findByPk('maintenance_mode');
            if (maintenance && maintenance.value === 'true' && user.role !== 'admin') {
                return res.status(503).json({ error: 'System is currently in maintenance mode. Please try again later.' });
            }

            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: generateToken(user.id)
            });
        } else {
            console.log(`Login failed for email: ${email}. User found: ${!!user}`);
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }

        user.password = newPassword; // Hook will hash it
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};