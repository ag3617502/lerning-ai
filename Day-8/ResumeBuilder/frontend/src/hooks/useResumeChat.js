import { useEffect, useRef } from "react";
import socket from "../socket";
import { useResume } from "../context/ResumeContext";

export function useResumeChat() {
  const {
    addMessage, updateLastAIMessage, finaliseLastAIMessage,
    setIsTyping, setSuggestions, setAiSuggestions,
    setTemplates, setSelectedTemplateId, setResumeData, setMessages,
    setRightPanel, setIsPdfGenerating, setPdfBase64,
    setPhase,
  } = useResume();

  const streamBuffer = useRef(""); // accumulates tokens for current AI message
  const isStreaming   = useRef(false);

  useEffect(() => {
    // ── chat_restored: replay a saved session ─────────────
    socket.on("chat_restored", (data) => {
      // Bulk-load conversation history as message bubbles
      const restoredMessages = (data.messages || []).map((m, i) => ({
        id: i + "_r" + Date.now(),
        role: m.role === "assistant" ? "ai" : "user",
        text: m.content,
        streaming: false,
      }));
      setMessages(restoredMessages);
      if (data.resumeData) setResumeData(data.resumeData);
      if (data.phase) setPhase(data.phase);
      if (data.templates?.length) {
        setTemplates(data.templates);
        setRightPanel("templates");
      }
      const selTemplate = data.resumeData?.selectedTemplate || data.selectedTemplate;
      if (selTemplate) {
        setSelectedTemplateId(selTemplate);
        setRightPanel("preview");
      }
    });

    // ── stream_start: create empty AI bubble ──────────────
    socket.on("stream_start", () => {
      streamBuffer.current = "";
      isStreaming.current  = true;
      addMessage("ai", ""); // placeholder bubble
    });

    // ── stream_token: append to last AI bubble ────────────
    socket.on("stream_token", ({ token }) => {
      if (!isStreaming.current) return;
      streamBuffer.current += token;
      updateLastAIMessage(streamBuffer.current);
    });

    // ── stream_end: finalise bubble ───────────────────────
    socket.on("stream_end", () => {
      isStreaming.current = false;
      finaliseLastAIMessage();
    });

    // ── typing indicator ──────────────────────────────────
    socket.on("ai_typing", ({ typing }) => setIsTyping(typing));

    // ── suggestion chips ──────────────────────────────────
    socket.on("suggestions", (data) => setSuggestions(data));

    // ── AI-generated suggestions panel ───────────────────
    socket.on("ai_suggestions", (data) => setAiSuggestions(data));

    // ── template gallery ──────────────────────────────────
    socket.on("show_templates", ({ templates }) => {
      setTemplates(templates);
      setRightPanel("templates");
    });

    // ── resume populated (after template chosen) ──────────
    socket.on("resume_ready", ({ resumeData }) => {
      setResumeData(resumeData);
      setRightPanel("preview");
    });

    // ── PDF generation ────────────────────────────────────
    socket.on("pdf_generating", () => setIsPdfGenerating(true));
    socket.on("pdf_ready", ({ pdf }) => {
      setIsPdfGenerating(false);
      setPdfBase64(pdf);
      // Auto-trigger download
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdf}`;
      link.download = "My_Resume.pdf";
      link.click();
    });

    // ── document parsed ───────────────────────────────────
    socket.on("document_parsed_ack", () => {
      setPhase("role_specific");
    });

    // ── error ─────────────────────────────────────────────
    socket.on("error", ({ message }) => {
      addMessage("ai", `⚠️ ${message}`);
    });

    return () => {
      socket.off("chat_restored");
      socket.off("stream_start");
      socket.off("stream_token");
      socket.off("stream_end");
      socket.off("ai_typing");
      socket.off("suggestions");
      socket.off("ai_suggestions");
      socket.off("show_templates");
      socket.off("resume_ready");
      socket.off("pdf_generating");
      socket.off("pdf_ready");
      socket.off("document_parsed_ack");
      socket.off("error");
    };
  }, []);

  // ── Send user message ─────────────────────────────────────
  const sendMessage = (text) => {
    if (!text.trim()) return;
    addMessage("user", text);
    socket.emit("user_message", { text });
  };

  // ── Select template ───────────────────────────────────────
  const selectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    socket.emit("template_selected", { templateId });
  };

  // ── Request PDF ───────────────────────────────────────────
  const requestPdf = () => {
    socket.emit("generate_pdf");
  };

  // ── Send document text after upload ──────────────────────
  const sendDocumentText = (text) => {
    socket.emit("document_parsed", { text });
  };

  return { sendMessage, selectTemplate, requestPdf, sendDocumentText };
}
