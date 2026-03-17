import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Search, Loader2, MessageSquare, BookOpen, BrainCircuit } from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

function App() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputs, setInputs] = useState(['']);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/chats`);
      setChats(response.data);
      if (response.data.length > 0 && !activeChat) {
        setActiveChat(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setSidebarLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      setLoading(true);
      const title = prompt("Enter chat title:", "New AI Workspace") || "New Chat";
      const response = await axios.post(`${API_BASE}/chats`, { title });
      setChats([response.data, ...chats]);
      setActiveChat(response.data);
      setInputs(['']);
      setResult(null);
      setQuestion('');
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const addInput = () => {
    if (inputs.length < 10) setInputs([...inputs, '']);
  };

  const removeInput = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs.length ? newInputs : ['']);
  };

  const updateInput = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSync = async () => {
    const activeInputs = inputs.filter(i => i.trim());
    if (activeInputs.length === 0 || !activeChat) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/process`, {
        strings: activeInputs,
        chatId: activeChat._id
      });
      setActiveChat(response.data.chat);
      setChats(chats.map(c => c._id === activeChat._id ? response.data.chat : c));
      setInputs(['']);
      alert("Successfully synced with AI memory!");
    } catch (error) {
      console.error("Sync error:", error);
      alert("Error syncing phrases.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!question || !activeChat) return;
    
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(`${API_BASE}/search`, {
        query: question,
        chatId: activeChat._id
      });
      setResult(response.data.matches[0] || { empty: true });
    } catch (error) {
      console.error("Search error:", error);
      alert("Error finding match.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Workspaces</h2>
          <button className="btn btn-secondary" onClick={createNewChat} style={{ padding: '0.4rem' }}>
            <Plus size={18} />
          </button>
        </div>
        
        <div className="chat-list">
          {sidebarLoading ? (
            <div className="empty-state">Loading...</div>
          ) : chats.length === 0 ? (
            <div className="empty-state">No workspaces yet</div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat._id} 
                className={`chat-item ${activeChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => {
                  setActiveChat(chat);
                  setResult(null);
                  setQuestion('');
                }}
              >
                <MessageSquare size={16} /> {chat.title}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="main-content">
        <div className="chat-container">
          {activeChat ? (
            <div className="card">
              <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BrainCircuit size={32} color="#6366f1" />
                  <h1>{activeChat.title}</h1>
                </div>
                <p className="subtitle">Isolate data on a per-chat basis using semantic search.</p>
              </header>

              {/* Phrase Input Sync Section */}
              <section className="input-group">
                <label>Add New Phrases to Sync</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {inputs.map((input, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.75rem' }}>
                      <input
                        type="text"
                        placeholder={`Learn phrase...`}
                        value={input}
                        onChange={(e) => updateInput(index, e.target.value)}
                      />
                      <button className="btn btn-danger" onClick={() => removeInput(index)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={addInput} style={{ flex: 1 }}>
                      <Plus size={18} /> Add More
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleSync} 
                      disabled={loading || inputs.every(i => !i.trim())}
                      style={{ flex: 1.5, background: '#10b981' }}
                    >
                      {loading && !question ? <Loader2 className="animate-spin" size={18} /> : null}
                      Sync with Chat Memory
                    </button>
                  </div>
                </div>
              </section>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '2rem 0' }} />

              {/* Search Section */}
              <section className="input-group">
                <label>Semantic Search (Limited to this chat)</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Ask something based on synced phrases..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSearch}
                    disabled={loading || !question || activeChat.phrases.length === 0}
                    style={{ width: 'auto', padding: '0 2rem' }}
                  >
                    {loading && question ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                  </button>
                </div>
                {activeChat.phrases.length === 0 && (
                  <small style={{ color: '#f87171', display: 'block', marginTop: '0.5rem' }}>
                    * Add phrases above first to enable search for this workspace.
                  </small>
                )}
              </section>

              {result && (
                <div className="result-card">
                  {result.empty ? (
                    <p style={{ color: '#94a3b8' }}>No matches found in this chat's memory.</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span className="result-label" style={{ fontWeight: 'bold', color: '#6366f1' }}>Best Match Found</span>
                        <span style={{ color: '#10b981', fontSize: '0.8rem' }}>Confidence: {Math.round((1 - result.distance) * 100)}%</span>
                      </div>
                      <div className="result-text">{result.text}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card empty-state">
              <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>Select or create a workspace to get started</h3>
            </div>
          )}
        </div>
      </main>

      {/* Right Knowledge Panel */}
      <aside className="knowledge-panel">
        <span className="panel-title">
          <BookOpen size={14} style={{ marginRight: '5px' }} /> Context Memory
        </span>
        <div className="phrase-list">
          {activeChat?.phrases?.length > 0 ? (
            activeChat.phrases.map((phrase, i) => (
              <div key={i} className="phrase-tag">{phrase}</div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '1rem 0', fontSize: '0.8rem' }}>
              No phrases synced for this workspace yet.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default App;
