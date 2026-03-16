const { getEmbedding } = require("../services/gemini.service");
const { dotProduct } = require("../utils/similarity");

const matchStrings = async (req, res) => {
  try {
    const { inputs, question } = req.body;

    if (!inputs || !Array.isArray(inputs) || !question) {
      return res.status(400).json({ error: "Invalid input. Provide an array of inputs and a question." });
    }

    // 1. Get embedding for the question
    const questionEmbedding = await getEmbedding(question);

    // 2. Get embeddings for all inputs
    const inputEmbeddings = await Promise.all(
      inputs.map(async (text) => {
        const embedding = await getEmbedding(text);
        return { text, embedding };
      })
    );

    // 3. Calculate similarity and sort
    const scoredInputs = inputEmbeddings.map((item) => {
      const score = dotProduct(questionEmbedding, item.embedding);
      return { text: item.text, score };
    });

    scoredInputs.sort((a, b) => b.score - a.score);

    res.json({
      bestMatch: scoredInputs[0].text,
      allMatches: scoredInputs,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { matchStrings };
