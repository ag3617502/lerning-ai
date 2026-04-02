// ============================================================
// RESUME CONTEXT — Global state for the entire app
// ============================================================
import React, { createContext, useContext, useState } from "react";

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  // Chat messages: [{ id, role: 'user'|'ai', text, streaming? }]
  const [messages, setMessages] = useState([]);

  // Conversation phase tracking
  const [phase, setPhase] = useState("greeting"); // maps to server phases
  const [isTyping, setIsTyping] = useState(false);

  // Suggestion chips from server
  const [suggestions, setSuggestions] = useState({ items: [], label: "" });

  // AI-generated suggestions panel
  const [aiSuggestions, setAiSuggestions] = useState(null);

  // Template gallery
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Resume data (populated by server)
  const [resumeData, setResumeData] = useState(null);

  // Right panel mode: 'empty' | 'templates' | 'preview'
  const [rightPanel, setRightPanel] = useState("empty");

  // PDF state
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfBase64, setPdfBase64] = useState(null);

  // Upload modal
  const [showUpload, setShowUpload] = useState(false);

  // Progress steps (for the top bar)
  const PHASES = ["greeting", "personal", "career", "experience", "tech_stack", "education", "role_specific", "show_templates", "complete"];
  const phaseIndex = PHASES.indexOf(phase);

  const addMessage = (role, text, streaming = false) => {
    const id = Date.now() + Math.random();
    setMessages((prev) => [...prev, { id, role, text, streaming }]);
    return id;
  };
  const updateLastAIMessage = (newText) => {
    setMessages((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === "ai") {
          copy[i] = { ...copy[i], text: newText, streaming: true };
          break;
        }
      }
      return copy;
    });
  };

  const finaliseLastAIMessage = () => {
    setMessages((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === "ai") {
          copy[i] = { ...copy[i], streaming: false };
          break;
        }
      }
      return copy;
    });
  };

  return (
    <ResumeContext.Provider
      value={{
        messages, addMessage, updateLastAIMessage, finaliseLastAIMessage, setMessages,
        phase, setPhase,
        isTyping, setIsTyping,
        suggestions, setSuggestions,
        aiSuggestions, setAiSuggestions,
        templates, setTemplates,
        selectedTemplateId, setSelectedTemplateId,
        resumeData, setResumeData,
        rightPanel, setRightPanel,
        isPdfGenerating, setIsPdfGenerating,
        pdfBase64, setPdfBase64,
        showUpload, setShowUpload,
        phaseIndex, PHASES,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be inside ResumeProvider");
  return ctx;
}
