// ============================================================
// DAY-8: AI CHAT RESUME BUILDER — BACKEND SERVER
// Express + Socket.IO + LangChain (Groq) + ChromaDB + MongoDB
// ============================================================
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import uploadRouter from "./routes/upload.js";
import authRouter from "./routes/auth.js";
import chatsRouter from "./routes/chats.js";
import { handleSocketConnection } from "./services/resumeAI.js";
import { initChromaKnowledgeBase } from "./services/embeddings.js";
import downloadRouter from "./routes/download.js";
import previewTemplateRouter from "./routes/previewTemplate.js";
import { verifySocketToken } from "./middleware/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// ── Socket.IO setup ─────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/download", downloadRouter);
app.use("/api/preview-template", previewTemplateRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Resume Builder API is running" });
});

// ── Socket.IO — verify JWT on handshake ─────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));

  const decoded = verifySocketToken(token);
  if (!decoded) return next(new Error("Invalid token"));

  socket.userId = decoded.id;  // attach userId to socket
  next();
});

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id} (user: ${socket.userId})`);

  // Client sends chatId when starting/resuming a chat
  socket.on("init_chat", async ({ chatId }) => {
    await handleSocketConnection(socket, io, chatId);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ── MongoDB ──────────────────────────────────────────────────
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    await initChromaKnowledgeBase();
    console.log("✅ ChromaDB knowledge base ready");

    const PORT = process.env.PORT || 5008;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
}

startServer();
