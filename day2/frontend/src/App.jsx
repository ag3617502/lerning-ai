import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link, Navigate } from 'react-router-dom'
import './App.css'

/**
 * Authentication Component - Handles both Login and Signup.
 * This is the first thing a user sees if they aren't logged in.
 */
function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      // Sending credentials to our new modular backend auth routes
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // If successful, save user info and token to local storage
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        {error && <div className="error-msg">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              minLength="6"
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Sidebar Component with User Context.
 * Shows conversations and a logout button.
 */
function Sidebar({ conversations, currentId, onNewChat, onLogout, userEmail }) {
  return (
    <aside className="sidebar">
      <button className="new-chat-btn" onClick={onNewChat}>+ New Chat</button>
      <div className="conversation-list">
        {conversations.map(conv => (
          <Link 
            key={conv.id} 
            to={`/chat/${conv.id}`}
            className={`conversation-item ${currentId === conv.id ? 'active' : ''}`}
          >
            {conv.snippet}
          </Link>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="user-info">{userEmail}</div>
        <div>Total chats: {conversations.length}</div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}

/**
 * Main Chat View.
 * All API calls now include the JWT Bearer token for authentication.
 */
function ChatView({ user, fetchConversations, messages, setMessages, input, setInput, loading, setLoading, hasMore, setHasMore, offset, setOffset }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isCreatingChat = useRef(false);

  useEffect(() => {
    if (id) {
      if (isCreatingChat.current) {
        isCreatingChat.current = false;
        return;
      }
      loadConversation(id);
    } else {
      setMessages([]);
      setOffset(0);
      setHasMore(false);
    }
  }, [id]);

  useEffect(() => {
    if (offset === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadConversation = async (convId) => {
    setMessages([]);
    setOffset(0);
    try {
      // Adding Authorization header with JWT token
      const res = await fetch(`http://localhost:5000/api/chat/conversations/${convId}/messages?limit=20&offset=0`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      setMessages(data.messages || []);
      setHasMore(data.hasMore);
      setOffset(20);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const loadMoreMessages = async () => {
    if (!id || !hasMore) return;
    try {
      const res = await fetch(`http://localhost:5000/api/chat/conversations/${id}/messages?limit=20&offset=${offset}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      const scrollHeight = chatContainerRef.current.scrollHeight;
      setMessages(prev => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
      setOffset(prev => prev + 20);
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - scrollHeight;
        }
      }, 0);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // API call with authenticated context
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ message: currentInput, conversationId: id }),
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const newId = res.headers.get('X-Conversation-Id');
      if (newId) {
        isCreatingChat.current = true;
        navigate(`/chat/${newId}`, { replace: true });
        fetchConversations();
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMsg]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        assistantMsg.content += chunk;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { ...assistantMsg };
          return newMsgs;
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to connect' }]);
    } finally {
      setLoading(false);
      fetchConversations();
    }
  };

  return (
    <main className="main-chat">
      <header className="chat-header">
        <h1>AI Personal Assistant</h1>
      </header>

      <div className="chat-messages" ref={chatContainerRef}>
        {hasMore && (
          <button className="load-more-btn" onClick={loadMoreMessages}>
            Load Previous Messages
          </button>
        )}
        {messages.length === 0 && !loading && (
          <div className="welcome-msg">Hello! How can I help you today?</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <form onSubmit={handleSubmit} className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            rows="1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
            {loading ? '...' : '→'}
          </button>
        </form>
        {loading && <div className="typing-indicator">AI is thinking...</div>}
      </div>
    </main>
  );
}

/**
 * Main Application Logic.
 * Manages user session and global chat state.
 */
function AppContent() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  
  const { id } = useParams();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const fetchConversations = async () => {
    if (!user) return;
    try {
      // Authenticated request to list conversations
      const res = await fetch('http://localhost:5000/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  // If not logged in, show the Auth screen
  if (!user) {
    return <Auth setUser={setUser} />;
  }

  const chatProps = {
    user,
    fetchConversations,
    messages, setMessages,
    input, setInput,
    loading, setLoading,
    hasMore, setHasMore,
    offset, setOffset
  };

  return (
    <div className="app-container">
      <Sidebar 
        conversations={conversations} 
        currentId={id} 
        onNewChat={() => navigate('/')} 
        onLogout={handleLogout}
        userEmail={user.email}
      />
      <Routes>
        <Route path="/" element={<ChatView {...chatProps} />} />
        <Route path="/chat/:id" element={<ChatView {...chatProps} />} />
        {/* Redirect any other route back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;


