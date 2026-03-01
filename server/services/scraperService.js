const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require('axios');

class ScraperService {
    constructor() {
        this.browser = null;
    }

    async initializeBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }

    async scrape(url, strategy = 'fast') {
        console.log(`🕷️ Scraping ${url} using ${strategy} strategy...`);
        
        try {
            if (strategy === 'fast') {
                return await this.scrapeWithCheerio(url);
            } else if (strategy === 'deep') {
                return await this.scrapeWithPuppeteer(url);
            }
        } catch (error) {
            console.error(`Scraping failed for ${url}:`, error.message);
            // Fallback strategy
            if (strategy === 'fast') {
                console.log("🔄 Falling back to Puppeteer...");
                return await this.scrapeWithPuppeteer(url);
            }
            throw error;
        }
    }

    async scrapeWithCheerio(url) {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'SmartKnowledgeBot/1.0' }
        });
        const $ = cheerio.load(data);
        return this.extractData($);
    }

    async scrapeWithPuppeteer(url) {
        await this.initializeBrowser();
        const page = await this.browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        const content = await page.content();
        const $ = cheerio.load(content);
        
        const data = this.extractData($);
        await page.close();
        return data;
    }

    extractData($) {
        // Intelligent extraction logic
        const title = $('title').text().trim();
        const headings = $('h1, h2, h3').map((i, el) => $(el).text().trim()).get();
        const paragraphs = $('p').map((i, el) => $(el).text().trim()).get();
        
        // Basic Profile Detection Heuristics
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
        const textContent = $('body').text();
        const emails = textContent.match(emailRegex) || [];

        return {
            title,
            headings,
            content: paragraphs.join('\n'),
            emails: [...new Set(emails)], // Deduplicate
            rawHtml: $.html() // Optional: store for debugging
        };
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

module.exports = new ScraperService();