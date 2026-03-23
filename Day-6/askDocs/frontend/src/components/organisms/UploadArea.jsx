import { useState } from "react";
import { UploadCloud, File, Loader2 } from "lucide-react";
import api from "../../services/api";

const UploadArea = ({ conversationId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !conversationId) return;
    
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("document", file);

    try {
      await api.post(`/documents/upload/${conversationId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onUploadSuccess(); // Inform parent to update conversation state to documentProcessed=true
    } catch (err) {
      setError(err.response?.data?.message || "Error uploading document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 bg-slate-50">
      <div className="w-full max-w-lg p-10 space-y-8 bg-white border border-slate-200 shadow-xl rounded-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Upload Document Context</h2>
          <p className="mt-2 text-slate-500">Upload a PDF to start chatting with its contents.</p>
        </div>

        <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl border-slate-300 bg-slate-50">
          <UploadCloud size={48} className="mb-4 text-slate-400" />
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
          />
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center justify-center w-full gap-2 px-6 py-3 text-white transition-all bg-blue-600 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50"
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <File size={20} />}
            <span>{uploading ? "Processing..." : "Process Document"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
