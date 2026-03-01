const axios = require('axios');
const cheerio = require('cheerio');
const Document = require('../models/Document');
const vectorService = require('./vectorService');

class WebScraperService {
    async scrape(url, userId = null) {
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);
            
            // Clean up unwanted elements
            $('script, style, nav, footer, header, iframe, noscript, svg').remove();

            const title = $('title').text().trim() || url;
            // Get text from body, collapse whitespace
            const content = $('body').text().replace(/\s+/g, ' ').trim();

            if (content.length < 50) {
                throw new Error('Content too short or empty');
            }

            const doc = await Document.create({
                title: title,
                content: content,
                fileType: 'web/html',
                url: url,
                metadata: {
                    source: 'web',
                    originalUrl: url,
                    scrapedAt: new Date()
                },
                userId: userId
            });

            await vectorService.addDocument(doc.id, content, { 
                title: doc.title, 
                type: 'web-page' 
            });

            return doc;
        } catch (error) {
            throw new Error(`Scraping failed: ${error.message}`);
        }
    }
}

module.exports = new WebScraperService();