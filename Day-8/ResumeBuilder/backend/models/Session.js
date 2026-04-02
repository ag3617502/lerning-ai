// ============================================================
// MONGOOSE SESSION MODEL
// Stores per-socket conversation state and collected resume data
// ============================================================
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    socketId: { type: String, required: true, index: true },
    phase: {
      type: String,
      default: "greeting",
      enum: [
        "greeting",
        "career",
        "personal",
        "experience",
        "tech_stack",
        "education",
        "role_specific",
        "show_templates",
        "complete",
      ],
    },
    conversationHistory: [
      {
        role: { type: String, enum: ["user", "assistant"] },
        content: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    resumeData: {
      name: String,
      email: String,
      phone: String,
      location: String,
      summary: String,
      career: String,          // e.g. "Software Engineering"
      level: String,           // "fresher" | "experienced"
      isTech: Boolean,
      targetRole: String,
      techStack: [String],
      experience: [
        {
          company: String,
          role: String,
          duration: String,
          description: String,
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          year: String,
        },
      ],
      suggestedBullets: [String],
      selectedTemplate: String,
    },
    documentText: String,      // raw text from uploaded doc
    step: { type: Number, default: 0 }, // sub-step within a phase
  },
  { timestamps: true }
);

const Session = mongoose.model("ResumeSession", sessionSchema);
export default Session;
