// ============================================================
// ChatWindow — Scrollable message list + suggestions + typing
// ============================================================
import { useEffect, useRef } from "react";
import { useResume } from "../../context/ResumeContext";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({ onChipClick }) {
  const { messages, isTyping, suggestions, aiSuggestions } = useResume();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <>
      {/* Messages */}
      <div className="chat-window">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} text={msg.text} streaming={msg.streaming} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* AI Suggestions Panel */}
      {aiSuggestions && (
        <div className="ai-suggestion-card">
          <div className="ai-suggestion-title">{aiSuggestions.title}</div>
          {aiSuggestions.summary && (
            <div className="ai-suggestion-summary">{aiSuggestions.summary}</div>
          )}
          <ul className="ai-suggestion-bullets">
            {aiSuggestions.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestion Chips */}
      {suggestions.items.length > 0 && (
        <div className="suggestions-area">
          {suggestions.label && (
            <div className="suggestions-label">{suggestions.label}</div>
          )}
          <div className="suggestion-chips">
            {suggestions.items.map((item) => (
              <button
                key={item}
                className="suggestion-chip"
                onClick={() => onChipClick(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
