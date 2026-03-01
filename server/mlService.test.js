const mlService = require('../../services/mlService');

describe('ML Service', () => {
    test('should classify intent correctly', () => {
        const intent = mlService.classifyIntent('find someone who knows react');
        expect(intent).toBe('search');
    });

    test('should analyze content quality', () => {
        const shortText = "hi";
        const analysis = mlService.analyzeContentQuality(shortText);
        expect(analysis.score).toBeLessThan(1.0);
        expect(analysis.suggestions.length).toBeGreaterThan(0);
    });

    test('should generate tags from text', () => {
        const text = "We need a Senior Developer with Python experience";
        const tags = mlService.generateTags(text);
        expect(tags).toContain('Developer');
        expect(tags).toContain('Python');
    });
});