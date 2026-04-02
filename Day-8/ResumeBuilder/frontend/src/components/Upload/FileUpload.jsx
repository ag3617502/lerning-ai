// ============================================================
// FileUpload — Drag-and-drop modal for uploading resume docs
// ============================================================
import { useState, useRef } from "react";
import axios from "axios";
import socket from "../../socket";

export default function FileUpload({ onClose }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".docx") && !file.name.endsWith(".txt")) {
      setStatus("❌ Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    setUploading(true);
    setStatus("📤 Uploading and analysing…");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("socketId", socket.id);

    try {
      const { data } = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        setStatus("✅ Document uploaded! AI is analysing it…");
        socket.emit("document_parsed", { text: data.text });
        setTimeout(onClose, 1500);
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (err) {
      setStatus("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="upload-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="upload-modal">
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>📄 Upload Existing Resume</h3>
        <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Upload a PDF, DOCX, or TXT file and the AI will extract your details automatically — no Q&amp;A needed!
        </p>

        <div
          className={`upload-drop-zone ${dragging ? "dragover" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="upload-icon">📂</div>
          <div className="upload-text">Drag & drop your resume here</div>
          <div className="upload-sub">or click to browse your files<br />(.PDF, .DOCX, .TXT · Max 5MB)</div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {status && (
          <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center" }}>
            {status}
          </div>
        )}

        <div className="upload-actions">
          <button className="upload-cancel-btn" onClick={onClose} disabled={uploading}>
            {uploading ? "Please wait…" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
