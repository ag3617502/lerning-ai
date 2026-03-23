import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/organisms/Sidebar";
import UploadArea from "../components/organisms/UploadArea";
import ChatArea from "../components/organisms/ChatArea";
import api from "../services/api";

const ChatPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/login");
    } else {
      fetchConversations();
    }
  }, [navigate]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get("/conversations");
      setConversations(data);
      if (data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0]);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate("/login");
    }
  };

  const handleNewChat = async () => {
    try {
      const chatName = `Chat ${conversations.length + 1}`;
      const { data } = await api.post("/conversations", { title: chatName });
      setConversations([data, ...conversations]);
      setCurrentConversation(data);
    } catch (err) {
      console.error("Failed to create chat", err);
    }
  };

  const handleUploadSuccess = () => {
    // Update local state to show ChatArea
    const updatedConv = { ...currentConversation, documentProcessed: true };
    setCurrentConversation(updatedConv);
    setConversations(conversations.map(c => c._id === updatedConv._id ? updatedConv : c));
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden font-sans">
      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={setCurrentConversation}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {!currentConversation ? (
          <div className="flex items-center justify-center h-full text-slate-500 bg-slate-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-300 mb-4">Context-Aware AI</h1>
              <p>Select a chat from the sidebar or start a new one.</p>
            </div>
          </div>
        ) : !currentConversation.documentProcessed ? (
          <UploadArea
            conversationId={currentConversation._id}
            onUploadSuccess={handleUploadSuccess}
          />
        ) : (
          <ChatArea conversationId={currentConversation._id} />
        )}
      </main>
    </div>
  );
};

export default ChatPage;
