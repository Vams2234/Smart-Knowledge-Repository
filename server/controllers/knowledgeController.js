const User = require('../models/User');
const Profile = require('../models/Profile');
const { Op } = require('sequelize');
const mlService = require('../services/mlService');

exports.search = async (req, res) => {
    try {
        const { query, department, role } = req.query;
        
        let whereClause = {};

        if (query) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${query}%` } },
                { bio: { [Op.like]: `%${query}%` } },
                // Note: Searching JSON fields in MySQL/Sequelize can be complex, 
                // simplified here to basic text search if possible or ignored for MVP
            ];
        }

        if (department) {
            whereClause.department = department;
        }

        if (role) {
            whereClause.role = role;
        }

        const profiles = await Profile.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'email', 'role', 'department', 'bio', 'expertise', 'avatar', 'createdAt']
        });

        // Map users to the format expected by frontend
        const results = profiles.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department,
            bio: u.bio,
            expertise: u.expertise || [],
            avatar: u.avatar,
            type: 'Profile'
        }));

        res.json({ results });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findByPk(req.params.id, {
            attributes: { exclude: [] }
        });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        
        // Format for frontend
        const result = {
            ...profile.toJSON(),
            name: profile.name
        };
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json({ ...user.toJSON(), name: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        // Try finding User first
        let entity = await User.findByPk(req.params.id);
        let isUser = true;

        if (!entity) {
            entity = await Profile.findByPk(req.params.id);
            isUser = false;
        }

        if (!entity) return res.status(404).json({ error: 'Profile not found' });

        // Authorization check
        if (isUser) {
            if (req.user.id !== entity.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized' });
            }
        } else {
            // Only admin can edit seeded Profiles
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized' });
            }
        }

        const updates = { ...req.body };
        
        // Handle file upload
        if (req.file) {
            updates.avatar = `/uploads/${req.file.filename}`;
        }

        // Parse expertise if it comes as a string (from FormData)
        if (typeof updates.expertise === 'string') {
            try {
                updates.expertise = JSON.parse(updates.expertise);
            } catch (e) { /* ignore */ }
        }

        await entity.update(updates);
        
        const response = isUser 
            ? { ...entity.toJSON(), name: entity.username }
            : entity.toJSON();
            
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSimilarProfiles = async (req, res) => {
    try {
        const similar = await mlService.getSimilarProfiles(req.params.id);
        res.json(similar);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Try Profile
        const profile = await Profile.findByPk(id);
        if (profile) {
            if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
            await profile.destroy();
            return res.json({ message: 'Profile deleted' });
        }

        // Try User
        const user = await User.findByPk(id);
        if (user) {
            if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ error: 'Not authorized' });
            await user.destroy();
            return res.json({ message: 'User deleted' });
        }

        res.status(404).json({ error: 'Profile not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getGraphData = async (req, res) => {
    try {
        const profiles = await Profile.findAll({
            attributes: ['id', 'name', 'role', 'department', 'expertise', 'avatar']
        });

        const nodes = [];
        const links = [];
        const addedNodes = new Set();

        profiles.forEach(profile => {
            // Add User Node
            if (!addedNodes.has(profile.id)) {
                nodes.push({
                    id: profile.id,
                    name: profile.name,
                    val: 20, // Node size
                    group: 'user',
                    role: profile.role,
                    department: profile.department,
                    img: profile.avatar
                });
                addedNodes.add(profile.id);
            }

            // Parse Expertise
            let skills = profile.expertise;
            if (typeof skills === 'string') {
                try {
                    skills = JSON.parse(skills);
                } catch (e) {
                    skills = skills.split(',').map(s => s.trim());
                }
            }
            
            if (Array.isArray(skills)) {
                skills.forEach(skill => {
                    if (!skill) return;
                    const skillId = `skill-${skill.toLowerCase()}`;
                    
                    // Add Skill Node
                    if (!addedNodes.has(skillId)) {
                        nodes.push({
                            id: skillId,
                            name: skill,
                            val: 10,
                            group: 'skill'
                        });
                        addedNodes.add(skillId);
                    }

                    // Link User to Skill
                    links.push({
                        source: profile.id,
                        target: skillId
                    });
                });
            }
        });

        res.json({ nodes, links });
    } catch (error) {
        console.error("Graph data error:", error);
        res.status(500).json({ error: error.message });
    }
};