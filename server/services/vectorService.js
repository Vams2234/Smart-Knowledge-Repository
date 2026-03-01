class VectorService {
    constructor() {
        // In-memory store for demonstration. 
        // In production, connect to Pinecone, Weaviate, or pgvector.
        this.store = [];
    }

    async addDocument(id, text, metadata) {
        // In a real app: const embedding = await openai.createEmbedding(text);
        // Here we just store the text for keyword matching simulation.
        const existingIndex = this.store.findIndex(item => item.id === id);
        const doc = { 
            id, 
            text: text ? text.toLowerCase() : '', 
            metadata 
        };
        
        if (existingIndex >= 0) {
            this.store[existingIndex] = doc;
        } else {
            this.store.push(doc);
        }
    }

    async search(query, limit = 5) {
        // Simulated semantic search using keyword matching and scoring
        const q = query.toLowerCase();
        const results = this.store
            .map(doc => {
                let score = 0;
                if (doc.text.includes(q)) score += 0.5;
                const words = q.split(' ').filter(w => w.length > 2);
                words.forEach(w => {
                    if (doc.text.includes(w)) score += 0.1;
                });
                return { ...doc, score };
            })
            .filter(doc => doc.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
            
        return results;
    }
}

module.exports = new VectorService();