// ============================================================
// ChatSidebar — shows list of saved resume chats + new chat btn
// ============================================================
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API = "http://localhost:5008/api";

export default function ChatSidebar({ activeChatId, onSelectChat, onNewChat }) {
  const { user, token, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const fetchChats = async () => {
    try {
      const { data } = await axios.get(`${API}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(data.chats || []);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    // Refresh every 30s to pick up title updates
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Allow parent to trigger refresh
  useEffect(() => {
    if (activeChatId) fetchChats();
  }, [activeChatId]);

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) onNewChat();
    } catch {
      // silently ignore
    }
  };

  const userInitials = (user?.name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (collapsed) {
    return (
      <div className="sidebar-collapsed" onClick={() => setCollapsed(false)} title="Expand sidebar">
        <span className="sidebar-collapsed-icon">☰</span>
      </div>
    );
  }

  return (
    <div className="chat-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">✨</span>
          <span className="sidebar-brand-name">ResumeAI</span>
        </div>
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(true)} title="Collapse">◀</button>
      </div>

      {/* New Chat Button */}
      <button className="new-chat-btn" onClick={onNewChat}>
        <span>＋</span> New Resume
      </button>

      {/* Chat List */}
      <div className="sidebar-chat-list">
        {loading ? (
          <div className="sidebar-loading">
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
          </div>
        ) : chats.length === 0 ? (
          <div className="sidebar-empty">
            <div style={{ fontSize: 28, opacity: 0.4 }}>📄</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
              No saved resumes yet
            </div>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              className={`sidebar-chat-item ${activeChatId === chat._id ? "active" : ""}`}
              onClick={() => onSelectChat(chat._id)}
            >
              <div className="chat-item-icon">
                {chat.isComplete ? "✅" : "📝"}
              </div>
              <div className="chat-item-body">
                <div className="chat-item-title">{chat.title || "New Resume"}</div>
                <div className="chat-item-meta">
                  <span className={`chat-item-status ${chat.isComplete ? "complete" : "draft"}`}>
                    {chat.isComplete ? "Complete" : chat.phase || "Draft"}
                  </span>
                  <span className="chat-item-date">{formatDate(chat.updatedAt)}</span>
                </div>
              </div>
              <button
                className="chat-item-delete"
                onClick={(e) => handleDelete(e, chat._id)}
                title="Delete"
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>

      {/* User footer */}
      <div className="sidebar-user">
        <div className="user-avatar">{userInitials}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-email">{user?.email}</div>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign out">⏏</button>
      </div>

      <style>{`
        .chat-sidebar {
          width: 260px; min-width: 260px; height: 100vh;
          background: var(--bg-secondary); border-right: 1px solid var(--border-glass);
          display: flex; flex-direction: column; flex-shrink: 0;
        }
        .sidebar-collapsed {
          width: 44px; min-width: 44px; height: 100vh;
          background: var(--bg-secondary); border-right: 1px solid var(--border-glass);
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: 18px; cursor: pointer;
        }
        .sidebar-collapsed-icon { font-size: 18px; color: var(--text-secondary); }
        .sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 16px 14px; flex-shrink: 0;
        }
        .sidebar-brand { display: flex; align-items: center; gap: 8px; }
        .sidebar-brand-icon { font-size: 18px; }
        .sidebar-brand-name { font-size: 15px; font-weight: 700; color: var(--text-primary); }
        .sidebar-collapse-btn {
          background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; padding: 4px;
          transition: color 0.2s;
        }
        .sidebar-collapse-btn:hover { color: var(--text-secondary); }
        .new-chat-btn {
          margin: 0 12px 12px; padding: 10px 14px;
          background: linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.12));
          border: 1px solid var(--border-accent); border-radius: 10px;
          color: var(--accent-cyan); font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; flex-shrink: 0;
        }
        .new-chat-btn:hover { background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2)); }
        .sidebar-chat-list { flex: 1; overflow-y: auto; padding: 4px 8px; display: flex; flex-direction: column; gap: 3px; }
        .sidebar-loading, .sidebar-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 16px; }
        .sidebar-chat-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 10px;
          border-radius: 10px; cursor: pointer; transition: all 0.15s; position: relative;
          border: 1px solid transparent;
        }
        .sidebar-chat-item:hover { background: var(--bg-glass); }
        .sidebar-chat-item.active { background: rgba(0,212,255,0.06); border-color: rgba(0,212,255,0.2); }
        .chat-item-icon { font-size: 16px; flex-shrink: 0; }
        .chat-item-body { flex: 1; min-width: 0; }
        .chat-item-title { font-size: 13px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chat-item-meta { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
        .chat-item-status { font-size: 10px; padding: 1px 7px; border-radius: 10px; font-weight: 600; }
        .chat-item-status.complete { background: rgba(16,185,129,0.15); color: #10b981; }
        .chat-item-status.draft { background: rgba(251,191,36,0.12); color: #fbbf24; }
        .chat-item-date { font-size: 10px; color: var(--text-muted); }
        .chat-item-delete {
          background: none; border: none; font-size: 13px; cursor: pointer; opacity: 0;
          transition: opacity 0.15s; padding: 4px; flex-shrink: 0;
        }
        .sidebar-chat-item:hover .chat-item-delete { opacity: 0.6; }
        .chat-item-delete:hover { opacity: 1 !important; }
        .sidebar-user {
          display: flex; align-items: center; gap: 10px; padding: 14px 12px;
          border-top: 1px solid var(--border-glass); flex-shrink: 0;
        }
        .user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .user-info { flex: 1; min-width: 0; }
        .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-email { font-size: 10px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .logout-btn {
          background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px;
          padding: 4px; transition: color 0.2s; flex-shrink: 0;
        }
        .logout-btn:hover { color: #f87171; }
      `}</style>
    </div>
  );
}
