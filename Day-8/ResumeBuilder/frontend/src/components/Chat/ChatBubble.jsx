// ============================================================
// ChatBubble — Single message bubble (user or AI, with markdown)
// ============================================================
import React from "react";
import ReactMarkdown from "react-markdown";

export default function ChatBubble({ role, text, streaming }) {
  return (
    <div className={`message-row ${role}`}>
      {role === "ai" && (
        <div className="avatar-icon ai">🤖</div>
      )}
      <div className={`bubble ${role}`}>
        {role === "ai" ? (
          <>
            <ReactMarkdown>{text || " "}</ReactMarkdown>
            {streaming && <span className="blink-cursor">▌</span>}
          </>
        ) : (
          <span>{text}</span>
        )}
      </div>
      {role === "user" && (
        <div className="avatar-icon user">👤</div>
      )}
      <style>{`.blink-cursor { animation: blink 0.8s step-end infinite; color: #00d4ff; }
        @keyframes blink { 50% { opacity: 0; } }`}
      </style>
    </div>
  );
}
