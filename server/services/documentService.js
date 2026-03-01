const fs = require('fs');
const pdf = require('pdf-parse');
const Document = require('../models/Document');
const vectorService = require('./vectorService');

class DocumentService {
    async processUpload(file) {
        let content = '';
        
        if (file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(file.path);
            const data = await pdf(dataBuffer);
            content = data.text;
        } else {
            // Fallback for text files
            content = fs.readFileSync(file.path, 'utf8');
        }

        // Clean up temp file
        fs.unlinkSync(file.path);

        const doc = await Document.create({
            title: file.originalname,
            content: content,
            fileType: file.mimetype,
            url: `/uploads/${file.filename}`, // Mock URL
            metadata: {
                size: file.size,
                originalName: file.originalname
            }
        });

        // Index document in Vector Store for AI context
        await vectorService.addDocument(doc.id, content, { 
            title: doc.title, 
            type: 'document' 
        });

        return doc;
    }
}

module.exports = new DocumentService();