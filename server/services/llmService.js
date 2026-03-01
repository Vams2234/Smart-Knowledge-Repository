const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");

class LLMService {
    constructor() {
        // Ensure GOOGLE_API_KEY is set in .env
        this.model = new ChatGoogleGenerativeAI({
            modelName: "gemini-2.5-flash",
            maxOutputTokens: 2048,
            apiKey: process.env.GOOGLE_API_KEY
        });
    }

    async generateResponse(context, query) {
        try {
            const promptTemplate = PromptTemplate.fromTemplate(`
                You are a helpful Knowledge Assistant for a company.
                Use the following context to answer the user's question.
                If the answer is not in the context, say you don't know but offer general advice.
                
                Context:
                {context}
                
                User Question:
                {query}
                
                Answer:
            `);

            const chain = promptTemplate.pipe(this.model);
            const response = await chain.invoke({
                context: context,
                query: query
            });

            return response.content;
        } catch (error) {
            console.error("LLM Generation Error:", error);
            return "I apologize, but I'm having trouble generating a response right now. Please try again later.";
        }
    }
}

module.exports = new LLMService();