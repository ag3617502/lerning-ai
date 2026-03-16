const { Groq } = require('groq-sdk');

/**
 * AI Service handles all interactions with the Groq SDK.
 * This keeps our AI logic separate from our route handlers.
 */
class AIService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEYS, // Make sure this is set in your .env
    });
    this.model = 'llama-3.3-70b-versatile';
  }

  /**
   * Generates a streaming response from the AI model.
   * @param {Array} messages - The conversation history including the new user message.
   * @returns {Stream} - The Groq chat completion stream.
   */
  async getChatStream(messages) {
    try {
      return await this.groq.chat.completions.create({
        messages,
        model: this.model,
        stream: true,
      });
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get response from AI');
    }
  }
}

// Export a single instance to be used across the application
module.exports = new AIService();
