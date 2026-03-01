const natural = require('natural');

class KnowledgeExtractor {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
    }

    extract(text) {
        if (!text) return {};
        
        return {
            emails: this.extractEmails(text),
            dates: this.extractDates(text),
            keywords: this.extractKeywords(text),
            summary: this.generateSummary(text)
        };
    }

    extractEmails(text) {
        const regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
        return [...new Set(text.match(regex) || [])];
    }

    extractDates(text) {
        // Matches YYYY-MM-DD or MM/DD/YYYY
        const regex = /\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g;
        return [...new Set(text.match(regex) || [])];
    }

    extractKeywords(text) {
        const tokens = this.tokenizer.tokenize(text);
        // Filter out short words and common stop words (simplified)
        return [...new Set(tokens.filter(t => t.length > 5))].slice(0, 10);
    }

    generateSummary(text) {
        // Naive summary: First 2 sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        return sentences.slice(0, 2).join(' ');
    }
}

module.exports = new KnowledgeExtractor();