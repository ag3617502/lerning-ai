const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: "../../.env" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

const getEmbedding = async (text) => {
  try {
    const result = await model.embedContent({
      content: { parts: [{ text }] },
      outputDimensionality: 1536,
    });
    return result.embedding.values;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};

module.exports = { getEmbedding };
