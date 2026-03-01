const vectorService = require('../services/vectorService');
const Document = require('../models/Document');
const Profile = require('../models/Profile');
const llmService = require('../services/llmService');
const ChatSession = require('../models/ChatSession');

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        // 1. Search for relevant context
        const contextResults = await vectorService.search(message, 3);
        
        // 2. Format context
        const context = contextResults.map(r => r.pageContent || r.metadata.text || 'No content').join('\n\n');

        // 3. Generate Response
        let aiResponse;
        if (process.env.GOOGLE_API_KEY) {
            // Use Real AI if API key is configured
            aiResponse = await llmService.generateResponse(context, message);
        } else {
            // Fallback to simulation
            aiResponse = `I found some information relevant to your query.\n\n`;
            
            if (contextResults.length > 0) {
                aiResponse += `Based on the knowledge base:\n`;
                contextResults.forEach(r => {
                    aiResponse += `- ${r.metadata.title} (${r.metadata.type})\n`;
                });
                aiResponse += `\nContext summary: ${context.substring(0, 200)}...`;
            } else {
                aiResponse = "I couldn't find any specific documents or profiles matching your query in the knowledge base.";
            }
        }

        // Find or create active session
        let session = await ChatSession.findOne({ 
            where: { userId, isActive: true } 
        });

        if (!session) {
            session = await ChatSession.create({
                userId,
                messages: []
            });
        }

        // Append new messages
        const newMessages = [
            ...session.messages,
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: aiResponse, timestamp: new Date() }
        ];

        // Update session
        session.messages = newMessages;
        session.changed('messages', true); // Force update for JSON field
        await session.save();

        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const session = await ChatSession.findOne({ 
            where: { userId, isActive: true } 
        });
        res.json(session ? session.messages : []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.clearHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        await ChatSession.update(
            { isActive: false },
            { where: { userId, isActive: true } }
        );
        res.json({ message: 'History cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};