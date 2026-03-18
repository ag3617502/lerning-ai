import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const result = await genAI.getGenerativeModel({ model: "gemini-pro" }); // placeholder
        // There isn't a direct listModels on genAI in the simplest version, 
        // but we can try to use the fetch API or just guess some common ones.
        // Actually, let's try 'text-embedding-004' vs 'embedding-001'.
        
        const models = ["text-embedding-004", "embedding-001", "models/text-embedding-004"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.embedContent("test");
                console.log(`Model ${m} is available.`);
            } catch (e) {
                console.log(`Model ${m} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
