const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const mlService = require('./mlService');

class ScopeDetector {
    constructor() {
        this.inScopeKeywords = new Set([
            'profile', 'employee', 'staff', 'expert', 'skill', 'experience',
            'contact', 'email', 'department', 'role', 'manager', 'developer'
        ]);
        
        this.intentPatterns = {
            question: /^(who|what|where|when|how|why)/i,
            command: /^(find|search|get|show|list)/i
        };
        
        // Advanced Troubleshooting: A/B Testing Flag
        // Randomly assign strategy to sessions (simplified here as a property)
        this.strategy = Math.random() > 0.5 ? 'heuristic' : 'ml';
    }

    analyze(query) {
        const tokens = tokenizer.tokenize(query.toLowerCase());
        
        // A/B Testing: Choose detection algorithm
        const intent = this.strategy === 'ml' 
            ? mlService.classifyIntent(query) 
            : this.detectIntent(query);
            
        const scopeScore = this.calculateScopeScore(tokens);
        
        return {
            query,
            intent,
            isScope: scopeScore > 0.3,
            confidence: scopeScore,
            tokens,
            strategy: this.strategy
        };
    }

    detectIntent(query) {
        if (this.intentPatterns.question.test(query)) return 'question';
        if (this.intentPatterns.command.test(query)) return 'command';
        return 'search';
    }

    calculateScopeScore(tokens) {
        if (tokens.length === 0) return 0;
        
        let matchCount = 0;
        tokens.forEach(token => {
            // Check exact match
            if (this.inScopeKeywords.has(token)) matchCount += 1;
            
            // Check partial match (simple stemming)
            else if ([...this.inScopeKeywords].some(k => k.includes(token) || token.includes(k))) {
                matchCount += 0.5;
            }
        });

        return Math.min(matchCount / tokens.length * 2, 1); // Normalize
    }

    // Advanced Troubleshooting: User Feedback Integration
    async processFeedback(query, correctIntent) {
        // Continuous learning from interactions
        await mlService.retrain(query, correctIntent);
    }
}

module.exports = new ScopeDetector();