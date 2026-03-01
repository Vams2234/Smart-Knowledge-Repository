const Profile = require('../models/Profile');
const { Op } = require('sequelize');

exports.getSimilarProfiles = async (profileId) => {
    try {
        const target = await Profile.findByPk(profileId);
        if (!target) return [];

        const targetSkills = Array.isArray(target.expertise) 
            ? target.expertise 
            : (target.expertise || '').split(',').map(s => s.trim());
            
        const targetDept = target.department;

        const allProfiles = await Profile.findAll({
            where: {
                id: { [Op.ne]: profileId }
            }
        });

        const scored = allProfiles.map(p => {
            let score = 0;
            // Department match
            if (p.department && targetDept && p.department === targetDept) score += 2;
            
            // Skill overlap
            const pSkills = Array.isArray(p.expertise) ? p.expertise : (p.expertise || '').split(',');
            const overlap = pSkills.filter(s => targetSkills.some(ts => ts.toLowerCase() === (s || '').trim().toLowerCase())).length;
            score += overlap * 1.5;

            return { profile: p, score };
        });

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.profile);
    } catch (error) {
        console.error('ML Service Error:', error);
        return [];
    }
};