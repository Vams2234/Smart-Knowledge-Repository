const Joi = require('joi');
const Profile = require('../models/Profile');
const mlService = require('./mlService');

class DataPipeline {
    constructor() {
        // 4.2 Data Validation Schema
        this.profileSchema = Joi.object({
            name: Joi.string().required().min(2),
            role: Joi.string().required(),
            email: Joi.string().email(),
            bio: Joi.string().allow(''),
            expertise: Joi.array().items(Joi.string())
        }).unknown(true);
    }

    // 4.2 ETL Process
    async processIngestion(rawData) {
        console.log("⚙️ Starting ETL Pipeline...");
        
        // 1. Extraction (Assumed done by ScraperService)
        
        // 2. Transformation & Cleaning
        const cleanedData = this.cleanData(rawData);
        
        // 3. Validation
        const { error, value } = this.profileSchema.validate(cleanedData);
        if (error) {
            console.error("❌ Data Validation Failed:", error.message);
            throw new Error(`Validation Error: ${error.message}`);
        }

        // 4. Enrichment (Auto-tagging & ML)
        const enrichedData = await this.enrichData(value);

        // 5. Loading (Upsert to DB)
        return await this.loadData(enrichedData);
    }

    cleanData(data) {
        return {
            ...data,
            name: data.name?.trim(),
            role: data.role?.trim(),
            bio: data.bio?.replace(/\s+/g, ' ').trim(), // Remove extra whitespace
            updatedAt: new Date()
        };
    }

    async enrichData(data) {
        // 4.1 Automatic Tag Generation
        if (!data.expertise || data.expertise.length === 0) {
            data.expertise = mlService.generateTags(data.bio || "");
        }

        // 4.2 Data Quality Score
        const qualityAnalysis = mlService.analyzeContentQuality(data.bio || "");
        data.metadata = {
            ...data.metadata,
            qualityScore: qualityAnalysis.score,
            improvementSuggestions: qualityAnalysis.suggestions
        };

        return data;
    }

    async loadData(data) {
        // 4.2 Data Versioning & Upsert
        const [profile, created] = await Profile.findOrCreate({
            where: { name: data.name }, // Simple dedup by name for now
            defaults: data
        });

        if (!created) {
            // Update existing
            await profile.update(data);
            console.log(`🔄 Updated profile: ${profile.name}`);
        } else {
            console.log(`✅ Created profile: ${profile.name}`);
        }
        
        return profile;
    }
}

module.exports = new DataPipeline();