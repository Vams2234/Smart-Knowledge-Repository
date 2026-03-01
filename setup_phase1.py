import os
import json

def create_file(path, content=""):
    """Creates a file with the given content, ensuring the directory exists."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Created: {path}")

def main():
    print("🚀 Starting Phase 1: Project Setup & Architecture...")

    # --- Client Setup ---
    client_dirs = [
        "client/src/components/Knowledge/ProfileBrowser",
        "client/src/components/Knowledge/SearchInterface",
        "client/src/components/Knowledge/ScopeIndicator",
        "client/src/components/Knowledge/KnowledgeGraph",
        "client/src/components/Chat/IntelligentChat",
        "client/src/components/Chat/ContextAware",
        "client/src/components/Chat/ScopeDetection",
        "client/src/components/Admin/DataManagement",
        "client/src/components/Admin/ScrapingControl",
        "client/src/components/Admin/Analytics",
        "client/src/components/Common",
        "client/src/services",
        "client/src/hooks",
        "client/src/context",
        "client/src/utils",
        "client/src/pages",
        "client/public",
    ]
    
    for d in client_dirs:
        os.makedirs(d, exist_ok=True)

    # Client package.json
    create_file("client/package.json", json.dumps({
        "name": "client",
        "version": "0.1.0",
        "private": True,
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-scripts": "5.0.1",
            "axios": "^1.6.0",
            "react-router-dom": "^6.20.0"
        },
        "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build"
        }
    }, indent=2))
    
    # Client Placeholders
    client_files = [
        "client/src/services/knowledgeService.js",
        "client/src/services/scopeDetectionService.js",
        "client/src/services/searchService.js",
        "client/src/hooks/useKnowledgeSearch.js",
        "client/src/hooks/useScopeDetection.js",
        "client/src/hooks/useIntelligentChat.js",
        "client/src/utils/scopeDetector.js",
        "client/src/utils/searchRanking.js",
        "client/src/utils/knowledgeGraph.js",
    ]
    for f in client_files:
        create_file(f, "// TODO: Implement service logic")

    # --- Server Setup ---
    server_dirs = [
        "server/config",
        "server/controllers",
        "server/models",
        "server/services",
        "server/utils",
        "server/middleware",
    ]
    for d in server_dirs:
        os.makedirs(d, exist_ok=True)

    # Server package.json
    create_file("server/package.json", json.dumps({
        "name": "server",
        "version": "1.0.0",
        "main": "server.js",
        "dependencies": {
            "express": "^4.18.2",
            "mongoose": "^8.0.0",
            "cors": "^2.8.5",
            "dotenv": "^16.3.1",
            "axios": "^1.6.0"
        },
        "scripts": {
            "start": "node server.js",
            "dev": "nodemon server.js"
        }
    }, indent=2))

    # Server Placeholders
    server_files = [
        "server/controllers/knowledgeController.js",
        "server/controllers/scopeController.js",
        "server/controllers/chatController.js",
        "server/controllers/searchController.js",
        "server/models/Profile.js",
        "server/models/KnowledgeDomain.js",
        "server/models/SearchQuery.js",
        "server/models/ChatSession.js",
        "server/services/scraperService.js",
        "server/services/knowledgeExtractor.js",
        "server/services/scopeDetector.js",
        "server/services/intelligentSearch.js",
        "server/services/llmService.js",
        "server/services/vectorService.js",
        "server/utils/dataExtractor.js",
        "server/utils/relevanceScorer.js",
        "server/utils/scopeAnalyzer.js",
        "server/utils/knowledgeProcessor.js",
    ]
    for f in server_files:
        create_file(f, "// TODO: Implement controller/model logic")

    # Basic Server Entry Point
    create_file("server/server.js", """const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Smart Knowledge Repository API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
""")

    print("\n✨ Project structure created successfully!")

if __name__ == "__main__":
    main()