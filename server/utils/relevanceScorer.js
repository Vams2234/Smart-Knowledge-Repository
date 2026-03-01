class RelevanceScorer {
    // 4.1 Search result ranking models
    calculateScore(profile, query) {
        let score = 0;
        const q = query.toLowerCase();

        // Exact Name Match (Highest Priority)
        if (profile.name.toLowerCase() === q) score += 100;
        else if (profile.name.toLowerCase().includes(q)) score += 50;

        // Role Match
        if (profile.role.toLowerCase().includes(q)) score += 30;

        // Expertise Match
        if (profile.expertise && profile.expertise.some(e => e.toLowerCase().includes(q))) {
            score += 20;
        }

        // Bio Context Match
        if (profile.bio.toLowerCase().includes(q)) score += 10;

        // Recency Boost (4.3 Optimization)
        const daysSinceUpdate = (Date.now() - new Date(profile.updatedAt).getTime()) / (1000 * 3600 * 24);
        score += Math.max(0, 10 - daysSinceUpdate); // Boost recently updated profiles

        return score;
    }
}

module.exports = new RelevanceScorer();