const scopeDetector = require('../../services/scopeDetector');

describe('ScopeDetector Service', () => {
    test('should detect question intent', () => {
        const result = scopeDetector.analyze('who is the manager?');
        expect(result.intent).toBe('question');
    });

    test('should detect command intent', () => {
        const result = scopeDetector.analyze('find react developers');
        expect(result.intent).toBe('command');
    });

    test('should calculate high confidence for in-scope queries', () => {
        const result = scopeDetector.analyze('profile of software engineer with react skill');
        expect(result.confidence).toBeGreaterThan(0.3);
        expect(result.isScope).toBe(true);
    });

    test('should calculate low confidence for out-of-scope queries', () => {
        const result = scopeDetector.analyze('weather in london');
        expect(result.confidence).toBeLessThan(0.3);
    });
});