// ============================================================
// TemplateCard — Single template card in the gallery
// ============================================================
export default function TemplateCard({ template, selected, onSelect }) {
  const ICONS = {
    "fresher+tech":        "💻",
    "fresher+nontech":     "📄",
    "experienced+tech":    "🚀",
    "experienced+nontech": "👔",
    "universal":           "⭐",
  };

  const GRADIENTS = {
    "fresher+tech":        "linear-gradient(135deg,#0f172a,#1e3a5f)",
    "fresher+nontech":     "linear-gradient(135deg,#78350f,#d97706)",
    "experienced+tech":    "linear-gradient(135deg,#1e1b4b,#4338ca)",
    "experienced+nontech": "linear-gradient(135deg,#1a1a1a,#4b1c1c)",
    "universal":           "linear-gradient(135deg,#1f2937,#374151)",
  };

  return (
    <div
      className={`template-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(template.id)}
      title={template.desc}
    >
      {selected && <div className="selected-check">✓</div>}
      <div
        className="template-card-thumb"
        style={{ background: GRADIENTS[template.category] || "#1a1a2e" }}
      >
        <span style={{ position: "relative", zIndex: 1, fontSize: 40 }}>
          {ICONS[template.category] || "📄"}
        </span>
        {/* Mini layout lines to hint at resume structure */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.25,
          display: "flex", flexDirection: "column", gap: 6, padding: "16px 20px", justifyContent: "flex-end"
        }}>
          {[100, 80, 60, 90, 70].map((w, i) => (
            <div key={i} style={{ height: 4, width: `${w}%`, background: "#fff", borderRadius: 2 }} />
          ))}
        </div>
      </div>
      <div className="template-card-body">
        <div className="template-card-name">{template.label}</div>
        <div className="template-card-desc">{template.desc}</div>
        <div className="template-card-category">{template.category}</div>
      </div>
    </div>
  );
}
