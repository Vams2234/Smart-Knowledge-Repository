const { sequelize } = require('../config/database');
const Profile = require('../models/Profile');
const User = require('../models/User');
const SearchQuery = require('../models/SearchQuery');
const AnalyticsEvent = require('../models/AnalyticsEvent');

const seedData = [
    {
        name: "Sarah Chen",
        role: "Senior Frontend Engineer",
        department: "Engineering",
        bio: "Expert in React ecosystem and UI performance optimization. Leading the design system initiative.",
        expertise: ["React", "TypeScript", "Tailwind CSS", "Performance"],
        email: "sarah.chen@company.com"
    },
    {
        name: "Marcus Johnson",
        role: "Product Manager",
        department: "Product",
        bio: "Product lead for the Analytics dashboard. Focused on user retention and data visualization.",
        expertise: ["Product Strategy", "Agile", "Data Analysis", "SQL"],
        email: "marcus.j@company.com"
    },
    {
        name: "Emily Davis",
        role: "DevOps Engineer",
        department: "Infrastructure",
        bio: "Managing cloud infrastructure and CI/CD pipelines. Kubernetes certified administrator.",
        expertise: ["AWS", "Kubernetes", "Docker", "Terraform"],
        email: "emily.d@company.com"
    },
    {
        name: "James Wilson",
        role: "Backend Lead",
        department: "Engineering",
        bio: "Architecting scalable microservices. Passionate about Node.js and distributed systems.",
        expertise: ["Node.js", "Microservices", "Redis", "System Design"],
        email: "james.w@company.com"
    }
];

const seedDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Database');

        // Force sync to clear existing tables and recreate them
        await sequelize.sync({ force: true });
        console.log('✅ Database Synced');

        await Profile.bulkCreate(seedData);
        console.log('✅ Seed Data Inserted');

        // Create Admin User
        await User.create({
            username: 'admin',
            email: 'admin@company.com',
            password: 'password123',
            role: 'admin'
        });
        console.log('✅ Admin User Created (admin@company.com / password123)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedDatabase();