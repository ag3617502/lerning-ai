const Conversation = require('../models/Conversation');
const aiService = require('../services/aiService');

/**
 * @desc    Send a message and get AI response (streaming)
 * @route   POST /api/chat
 * @access  Private
 */
const chat = async (req, res) => {
  const { message, conversationId } = req.body;
  const userId = req.user._id;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let conversation;
    
    // If conversationId is provided, try to find the existing conversation
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: userId });
    }
    
    // If not found (or not provided), create a new one for this user
    if (!conversation) {
      conversation = new Conversation({ user: userId, messages: [] });
    }

    // Add user's message to the history
    conversation.messages.push({ role: 'user', content: message });
    await conversation.save();

    // Prepare context for the AI (previous messages)
    const previousMessages = conversation.messages.slice(-11, -1).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Set headers for SSE (Server-Sent Events) style streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // If it's a new conversation, send the ID back in a header
    if (!conversationId) {
      res.setHeader('X-Conversation-Id', conversation._id.toString());
    }

    // Get the stream from our AI service
    const stream = await aiService.getChatStream([
      ...previousMessages,
      { role: 'user', content: message }
    ]);

    let assistantResponse = '';
    
    // Read the stream and write it to the response in real-time
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        assistantResponse += content;
        res.write(content);
      }
    }

    // Once streaming is finished, save the assistant's response to the DB
    conversation.messages.push({ role: 'assistant', content: assistantResponse });
    conversation.lastUpdated = Date.now();
    await conversation.save();

    res.end(); // Close the connection
  } catch (error) {
    console.error('Chat Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (!res.writableEnded) {
        res.write('\n[Error: Stream interrupted]');
        res.end();
      }
    }
  }
};

/**
 * @desc    Get all conversations for the authenticated user
 * @route   GET /api/conversations
 * @access  Private
 */
const getConversations = async (req, res) => {
  try {
    // Only fetch conversations belonging to the logged-in user
    const conversations = await Conversation.find({ user: req.user._id })
      .select('_id lastUpdated messages')
      .sort({ lastUpdated: -1 });
    
    // Format them for the sidebar (snippets, etc)
    const formatted = conversations.map(conv => {
      const firstMsg = conv.messages[0]?.content || 'New Conversation';
      const snippet = firstMsg.split(' ').slice(0, 15).join(' ') + (firstMsg.split(' ').length > 15 ? '...' : '');
      
      return {
        id: conv._id,
        snippet: snippet,
        lastUpdated: conv.lastUpdated
      };
    });
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

/**
 * @desc    Get messages for a specific conversation
 * @route   GET /api/conversations/:id/messages
 * @access  Private
 */
const getMessages = async (req, res) => {
  const { id } = req.params;
  const { limit = 20, offset = 0 } = req.query;
  
  try {
    // Ensure the conversation belongs to the user
    const conversation = await Conversation.findOne({ _id: id, user: req.user._id });
    
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    
    const totalMessages = conversation.messages.length;
    const startIndex = Math.max(0, totalMessages - parseInt(offset) - parseInt(limit));
    const endIndex = Math.max(0, totalMessages - parseInt(offset));
    
    const messages = conversation.messages.slice(startIndex, endIndex);
    
    res.json({
      messages,
      hasMore: startIndex > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

module.exports = { chat, getConversations, getMessages };
