// ============================================================
// ResumePreview — iframe showing populated resume + download btn
// ============================================================
import { useState, useEffect } from "react";
import { useResume } from "../../context/ResumeContext";

export default function ResumePreview({ onBack, onDownload }) {
  const { resumeData, selectedTemplateId, isPdfGenerating } = useResume();
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resumeData || !selectedTemplateId) return;

    // Fetch the template HTML and populate client-side for preview
    fetch(`/api/preview-template?id=${selectedTemplateId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resumeData),
    })
      .then((r) => r.text())
      .then((html) => {
        setHtmlContent(html);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resumeData, selectedTemplateId]);

  return (
    <div className="resume-preview-wrap">
      <div className="preview-toolbar">
        <button className="back-btn" onClick={onBack}>← Back to Templates</button>
        <span className="preview-title">Resume Preview</span>
        <button
          className="download-btn"
          onClick={onDownload}
          disabled={isPdfGenerating}
        >
          {isPdfGenerating ? "⏳ Generating…" : "⬇ Download PDF"}
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
          <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Loading preview…</span>
        </div>
      ) : (
        <div className="resume-iframe-wrap">
          <iframe
            title="Resume Preview"
            className="resume-iframe"
            srcDoc={htmlContent}
            sandbox="allow-same-origin"
          />
        </div>
      )}

      {isPdfGenerating && (
        <div className="generating-overlay">
          <div className="spinner" />
          <span style={{ color: "var(--text-primary)", fontSize: 13 }}>Generating PDF…</span>
        </div>
      )}
    </div>
  );
}
