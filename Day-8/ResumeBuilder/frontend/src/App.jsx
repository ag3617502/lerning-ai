// ============================================================
// App.jsx — Root component with auth guard + chat sidebar
// ============================================================
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ResumeProvider, useResume } from "./context/ResumeContext";
import { useResumeChat } from "./hooks/useResumeChat";
import ChatWindow from "./components/Chat/ChatWindow";
import ChatInput from "./components/Chat/ChatInput";
import TemplateGallery from "./components/Templates/TemplateGallery";
import ResumePreview from "./components/Preview/ResumePreview";
import FileUpload from "./components/Upload/FileUpload";
import LoginPage from "./components/Auth/LoginPage";
import ChatSidebar from "./components/Sidebar/ChatSidebar";
import socket, { reconnectWithToken } from "./socket";

// ── Inner app (needs access to context) ─────────────────────
function AppInner() {
  const { user, token } = useAuth();
  const {
    rightPanel, setRightPanel,
    showUpload, setShowUpload,
    phaseIndex, PHASES,
    setMessages, setTemplates, setSelectedTemplateId,
    setResumeData, setPhase,
    setSuggestions, setAiSuggestions,
  } = useResume();

  const { sendMessage, selectTemplate, requestPdf } = useResumeChat();
  const [activeChatId, setActiveChatId] = useState(null);

  // Reconnect socket with token when user logs in
  useEffect(() => {
    if (token) reconnectWithToken();
  }, [token]);

  // Start a fresh new chat
  const startNewChat = () => {
    setMessages([]);
    setTemplates([]);
    setSelectedTemplateId(null);
    setResumeData(null);
    setPhase("greeting");
    setRightPanel("empty");
    setSuggestions({ items: [], label: "" });
    setAiSuggestions(null);
    setActiveChatId(null);
    // Emit init_chat with no chatId → server creates a new one
    socket.emit("init_chat", {});
  };

  // Load an existing chat from sidebar
  const loadExistingChat = (chatId) => {
    setActiveChatId(chatId);
    setMessages([]);
    setTemplates([]);
    setSelectedTemplateId(null);
    setResumeData(null);
    setRightPanel("empty");
    setSuggestions({ items: [], label: "" });
    setAiSuggestions(null);
    // Server will emit `chat_restored` with the saved state
    socket.emit("init_chat", { chatId });
  };

  // Once socket is connected, start a new chat automatically
  useEffect(() => {
    if (!token) return;

    const onConnect = () => {
      if (!activeChatId) {
        socket.emit("init_chat", {});
      }
    };

    socket.on("connect", onConnect);
    // If already connected
    if (socket.connected && !activeChatId) {
      socket.emit("init_chat", {});
    }

    // Track new chatId assigned by server
    socket.on("chat_created", ({ chatId }) => {
      setActiveChatId(chatId);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("chat_created");
    };
  }, [token]);

  const handleChipClick = (text) => sendMessage(text);

  const handleTemplateSelect = (id) => selectTemplate(id);

  return (
    <div className="app-root-layout">
      {/* ── Sidebar ──────────────────────────────────────── */}
      <ChatSidebar
        activeChatId={activeChatId}
        onSelectChat={loadExistingChat}
        onNewChat={startNewChat}
      />

      {/* ── Main Area ─────────────────────────────────────── */}
      <div className="app-layout" style={{ flex: 1 }}>
        {/* ── LEFT: Chat Panel ─────────────────────────── */}
        <div className="panel panel-left">
          <div className="app-header">
            <div className="header-logo">✨</div>
            <div>
              <div className="header-title">AI Resume Builder</div>
              <div className="header-sub">Chat-powered · Real-time streaming</div>
            </div>
            <div className="header-badge">LIVE</div>
          </div>

          {/* Progress bar */}
          <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
            <div className="progress-steps">
              {PHASES.map((p, i) => (
                <div
                  key={p}
                  className={`progress-step ${i < phaseIndex ? "done" : i === phaseIndex ? "current" : ""}`}
                />
              ))}
            </div>
          </div>

          <ChatWindow onChipClick={handleChipClick} />
          <ChatInput
            onSend={sendMessage}
            onUploadClick={() => setShowUpload(true)}
            disabled={false}
          />
        </div>

        {/* ── RIGHT: Template / Preview Panel ──────────── */}
        <div className="panel panel-right">
          <div className="panel-right-header">
            {rightPanel === "empty" && <>Resume Templates <span>complete the chat to unlock</span></>}
            {rightPanel === "templates" && <>Choose Your Template</>}
            {rightPanel === "preview" && <>Your Resume Preview</>}
          </div>
          {rightPanel === "empty" && (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-title">Your resume will appear here</div>
              <div className="empty-state-sub">
                Complete the AI interview on the left to unlock personalised resume templates.
              </div>
            </div>
          )}
          {rightPanel === "templates" && <TemplateGallery onSelect={handleTemplateSelect} />}
          {rightPanel === "preview" && (
            <ResumePreview onBack={() => setRightPanel("templates")} onDownload={requestPdf} />
          )}
        </div>
      </div>

      {showUpload && <FileUpload onClose={() => setShowUpload(false)} />}
    </div>
  );
}

// ── Auth Gate ────────────────────────────────────────────────
function AuthGate() {
  const { user, loading, token } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg-primary)" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <ResumeProvider>
      <AppInner />
    </ResumeProvider>
  );
}

// ── Root ─────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

