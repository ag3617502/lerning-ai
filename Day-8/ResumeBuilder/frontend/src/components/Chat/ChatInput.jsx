// ============================================================
// ChatInput — Textarea + Send + Upload buttons
// ============================================================
import { useState, useRef } from "react";
import { useResume } from "../../context/ResumeContext";

export default function ChatInput({ onSend, onUploadClick, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const { isTyping } = useResume();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isTyping) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto-grow textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div className="chat-input-area">
      <div className="chat-input-row">
        <button
          className="upload-btn"
          onClick={onUploadClick}
          title="Upload existing resume/CV"
          type="button"
        >
          📎
        </button>
        <textarea
          ref={textareaRef}
          className="chat-input"
          rows={1}
          placeholder={isTyping ? "AI is typing…" : "Type your reply… (Enter to send)"}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isTyping}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!text.trim() || disabled || isTyping}
          title="Send message"
          type="button"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
