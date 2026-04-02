// ============================================================
// TypingIndicator — Animated dots shown while AI is generating
// ============================================================
export default function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="avatar-icon ai" style={{ width: 32, height: 32, fontSize: 14 }}>🤖</div>
      <div className="typing-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}
