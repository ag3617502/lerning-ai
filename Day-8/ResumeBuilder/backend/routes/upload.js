// ============================================================
// UPLOAD ROUTE — multer + pdf-parse / mammoth
// POST /api/upload — parses uploaded resume document
// ============================================================
import express from "express";
import multer from "multer";
import path from "path";
import { readFile, unlink } from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Store uploads temporarily
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".docx", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, DOCX, and TXT files are allowed"));
  },
});

router.post("/", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    let text = "";

    if (ext === ".txt") {
      text = await readFile(filePath, "utf-8");
    } else if (ext === ".pdf") {
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
      const buffer = await readFile(filePath);
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (ext === ".docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.default.extractRawText({ path: filePath });
      text = result.value;
    }

    // Clean up temp file
    await unlink(filePath).catch(() => {});

    res.json({
      success: true,
      text: text.substring(0, 5000), // limit for LLM processing
      socketId: req.body.socketId,
    });
  } catch (err) {
    await unlink(filePath).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

export default router;
