// ============================================================
// DOWNLOAD ROUTE — serves generated PDF by sessionId
// ============================================================
import express from "express";
import Session from "../models/Session.js";
import { generatePDF } from "../services/pdfGenerator.js";

const router = express.Router();

router.get("/:socketId", async (req, res) => {
  try {
    const session = await Session.findOne({ socketId: req.params.socketId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const pdfBase64 = await generatePDF(
      session.resumeData.selectedTemplate || "universal_minimal",
      session.resumeData
    );

    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    const filename = `Resume_${(session.resumeData.name || "resume").replace(/\s+/g, "_")}.pdf`;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
