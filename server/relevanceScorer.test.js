const relevanceScorer = require('../../utils/relevanceScorer');

describe('RelevanceScorer Utility', () => {
    const mockProfile = {
        name: 'John Doe',
        role: 'Senior Software Engineer',
        expertise: ['React', 'Node.js'],
        bio: 'Experienced developer',
        updatedAt: new Date()
    };

    test('should give max score for exact name match', () => {
        const score = relevanceScorer.calculateScore(mockProfile, 'John Doe');
        expect(score).toBeGreaterThanOrEqual(100);
    });

    test('should give partial score for role match', () => {
        const score = relevanceScorer.calculateScore(mockProfile, 'Engineer');
        expect(score).toBeGreaterThan(0);
    });

    test('should score higher for relevant queries than irrelevant ones', () => {
        // Note: Recency boost applies to both, so we compare relative scores
        const matchScore = relevanceScorer.calculateScore(mockProfile, 'John');
        const noMatchScore = relevanceScorer.calculateScore(mockProfile, 'Chef');
        
        expect(matchScore).toBeGreaterThan(noMatchScore);
    });
});