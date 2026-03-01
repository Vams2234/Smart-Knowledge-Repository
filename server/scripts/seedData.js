const { sequelize } = require('../config/database');
const Profile = require('../models/Profile');
const Document = require('../models/Document');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedData = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('✅ Connected to Database');

        // 1. Create Admin User if not exists
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const [admin] = await User.findOrCreate({
            where: { email: 'admin@company.com' },
            defaults: {
                username: 'Admin User',
                password: hashedPassword,
                role: 'admin',
                department: 'IT',
                bio: 'System Administrator',
                expertise: ['System Administration', 'Security']
            }
        });

        // 2. Create Profiles (Experts for Search)
        const profiles = [
            {
                name: "Sarah Wilson",
                email: "sarah@company.com",
                role: "Senior UX Designer",
                department: "Design",
                bio: "Passionate about creating intuitive user experiences. 10 years of experience in web and mobile design.",
                expertise: ["Figma", "User Research", "Prototyping", "UI Design"],
                avatar: ""
            },
            {
                name: "James Chen",
                email: "james@company.com",
                role: "Lead Developer",
                department: "Engineering",
                bio: "Full stack developer specializing in React and Node.js architectures.",
                expertise: ["React", "Node.js", "System Architecture", "Cloud Computing"],
                avatar: ""
            },
            {
                name: "Elena Rodriguez",
                email: "elena@company.com",
                role: "Product Manager",
                department: "Product",
                bio: "Driving product strategy and roadmap. Focused on customer-centric development.",
                expertise: ["Product Strategy", "Agile", "Data Analysis", "Stakeholder Management"],
                avatar: ""
            }
        ];

        for (const p of profiles) {
            await Profile.findOrCreate({
                where: { email: p.email },
                defaults: p
            });
        }
        console.log('✅ Profiles seeded');

        // 3. Create Documents
        const documents = [
            {
                title: "Q3 Product Roadmap",
                content: "This document outlines the strategic goals for Q3. Key focus areas include mobile app performance optimization, new user onboarding flow, and integration with third-party analytics tools. We aim to increase retention by 15%.",
                fileType: "application/pdf",
                originalName: "Q3_Roadmap.pdf",
                metadata: { size: 1024 * 500 }, // 500KB
                userId: admin.id
            },
            {
                title: "Engineering Onboarding Guide",
                content: "Welcome to the engineering team! This guide covers setting up your development environment, coding standards, git workflow, and deployment processes. Please read the section on security best practices carefully.",
                fileType: "text/markdown",
                originalName: "Onboarding.md",
                metadata: { size: 1024 * 10 }, // 10KB
                userId: admin.id
            },
            {
                title: "Design System Guidelines",
                content: "Our design system ensures consistency across all products. It includes color palettes, typography, spacing, and component usage. Use the provided Figma library for all new designs.",
                fileType: "application/pdf",
                originalName: "Design_System.pdf",
                metadata: { size: 1024 * 2500 }, // 2.5MB
                userId: admin.id
            }
        ];

        for (const d of documents) {
            await Document.findOrCreate({
                where: { title: d.title },
                defaults: d
            });
        }
        console.log('✅ Documents seeded');

        console.log('🎉 Seed data created successfully! Restart your server to index these items.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();