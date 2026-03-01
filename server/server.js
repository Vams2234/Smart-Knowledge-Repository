const express = require('express');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { connectDB, sequelize } = require('./config/database');
const { connectRedis } = require('./config/redis');
const analyticsController = require('./controllers/analyticsController');
const knowledgeController = require('./controllers/knowledgeController');
const chatController = require('./controllers/chatController');
const documentController = require('./controllers/documentController');
const bookmarkController = require('./controllers/bookmarkController');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const feedbackController = require('./controllers/feedbackController');
const searchController = require('./controllers/searchController');
const scopeController = require('./controllers/scopeController');
const healthController = require('./controllers/healthController');
const settingController = require('./controllers/settingController');
const notificationController = require('./controllers/notificationController');
const commentController = require('./controllers/commentController');
const reportController = require('./controllers/reportController');
const supportController = require('./controllers/supportController');
const domainController = require('./controllers/domainController');
const leaderboardController = require('./controllers/leaderboardController');
const { protect } = require('./middleware/auth');
const vectorService = require('./services/vectorService');
const Profile = require('./models/Profile');
const Document = require('./models/Document');
const Setting = require('./models/Setting');
const Activity = require('./models/Activity');
const Bookmark = require('./models/Bookmark');
const Notification = require('./models/Notification');
const Comment = require('./models/Comment');
const Report = require('./models/Report');
const SupportTicket = require('./models/SupportTicket');
const ChatSession = require('./models/ChatSession');
const User = require('./models/User');
const SearchQuery = require('./models/SearchQuery');

dotenv.config();

// Connect to MySQL
connectDB();
connectRedis();

// Define Associations
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });
Document.hasMany(Comment, { foreignKey: 'documentId' });
Comment.belongsTo(Document, { foreignKey: 'documentId' });
User.hasMany(Document, { foreignKey: 'userId' });
Document.belongsTo(User, { foreignKey: 'userId' });

// Sync Database Schema to match models
sequelize.sync({ alter: true })
    .then(async () => {
        console.log('Database schema updated');
        
        // Initialize Vector Store with existing data
        try {
            const profiles = await Profile.findAll();
            for (const p of profiles) {
                const text = `${p.name} - ${p.role}. ${p.bio || ''} Skills: ${p.expertise ? p.expertise.join(', ') : ''}`;
                await vectorService.addDocument(p.id, text, { title: p.name, type: 'profile' });
            }
            const documents = await Document.findAll();
            for (const d of documents) {
                await vectorService.addDocument(d.id, d.content, { title: d.title, type: 'document' });
            }
            console.log(`✅ Vector Store initialized with ${profiles.length} profiles and ${documents.length} documents`);
        } catch (err) {
            console.error('❌ Vector Store initialization failed:', err);
        }
    })
    .catch(err => console.error('Database sync error:', err));

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configure Multer for uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', protect, authController.getMe);
app.post('/api/auth/forgotpassword', authController.forgotPassword);
app.put('/api/auth/resetpassword/:resettoken', authController.resetPassword);
app.put('/api/auth/password', protect, authController.updatePassword);

// User Management Routes
app.get('/api/users', protect, userController.getAllUsers);
app.delete('/api/users/:id', protect, userController.deleteUser);
app.get('/api/users/preferences', protect, userController.getPreferences);
app.put('/api/users/preferences', protect, userController.updatePreferences);
app.get('/api/users/export', protect, userController.exportUserData);

// Knowledge & Chat Routes
app.get('/api/search', knowledgeController.search);
app.get('/api/search/advanced', searchController.advancedSearch);
app.get('/api/search/history', protect, searchController.getRecentSearches);
app.get('/api/search/trending', searchController.getTrendingSearches);
app.post('/api/scope/check', scopeController.checkScope);
app.get('/api/profiles/:id', knowledgeController.getProfile);
app.get('/api/profiles/me/details', protect, knowledgeController.getMyProfile);
app.get('/api/profiles/:id/similar', knowledgeController.getSimilarProfiles);
app.get('/api/graph/data', protect, knowledgeController.getGraphData);
app.get('/api/leaderboard', protect, leaderboardController.getLeaderboard);
app.put('/api/profiles/:id', protect, upload.single('avatar'), knowledgeController.updateProfile);
app.delete('/api/profiles/:id', knowledgeController.deleteProfile);
app.post('/api/chat', protect, chatController.chat);
app.get('/api/chat/history', protect, chatController.getHistory);
app.delete('/api/chat/history', protect, chatController.clearHistory);
app.post('/api/documents/upload', protect, upload.single('file'), documentController.upload);
app.post('/api/documents/scrape', protect, documentController.scrapeUrl);
app.get('/api/documents', protect, documentController.getAllDocuments);
app.delete('/api/documents/:id', protect, documentController.deleteDocument);
app.get('/api/documents/:id/download', protect, documentController.downloadDocument);
app.post('/api/bookmarks', bookmarkController.toggleBookmark);
app.get('/api/bookmarks/:userId', bookmarkController.getUserBookmarks);
app.get('/api/bookmarks/:userId/items', bookmarkController.getBookmarkedItems);
app.post('/api/documents/:id/comments', protect, commentController.addComment);
app.get('/api/documents/:id/comments', protect, commentController.getComments);
app.delete('/api/comments/:id', protect, commentController.deleteComment);

// Report Routes
app.post('/api/reports', protect, reportController.createReport);
app.get('/api/reports', protect, reportController.getAllReports);
app.put('/api/reports/:id', protect, reportController.updateReportStatus);

// Support Routes
app.post('/api/support', protect, supportController.createTicket);
app.get('/api/support/me', protect, supportController.getMyTickets);
app.get('/api/support', protect, supportController.getAllTickets); // Admin
app.put('/api/support/:id', protect, supportController.updateTicket); // Admin

// Domain Routes
app.post('/api/domains', protect, domainController.createDomain);
app.get('/api/domains', protect, domainController.getAllDomains);
app.delete('/api/domains/:id', protect, domainController.deleteDomain);

// Feedback Routes
app.post('/api/feedback', protect, feedbackController.submitFeedback);
app.get('/api/feedback', protect, feedbackController.getAllFeedback);

// Analytics & Monitoring Routes
app.post('/api/analytics/event', analyticsController.logEvent);
app.get('/api/analytics/dashboard', analyticsController.getDashboardData);
app.get('/api/analytics/activity', protect, analyticsController.getUserActivity);

// System Health
app.get('/api/health', protect, healthController.getSystemHealth);

// Settings Routes
app.get('/api/settings', protect, settingController.getSettings);
app.post('/api/settings', protect, settingController.updateSetting);

// Notification Routes
app.get('/api/notifications', protect, notificationController.getNotifications);
app.put('/api/notifications/:id/read', protect, notificationController.markAsRead);
app.put('/api/notifications/read-all', protect, notificationController.markAllAsRead);

// Basic Health Check
app.get('/', (req, res) => {
    res.send('Smart Knowledge Repository API (MySQL) is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
