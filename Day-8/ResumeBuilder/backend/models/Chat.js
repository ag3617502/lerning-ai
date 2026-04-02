// ============================================================
// CHAT MODEL — persistent resume chat sessions per user
// ============================================================
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title:  { type: String, default: "New Resume" }, // auto-set from candidate name
    phase:  {
      type: String,
      default: "greeting",
      enum: ["greeting","personal","career","experience","tech_stack","education","role_specific","show_templates","complete"],
    },
    step: { type: Number, default: 0 },

    conversationHistory: [
      {
        role:      { type: String, enum: ["user", "assistant"] },
        content:   String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    resumeData: {
      name:             String,
      email:            String,
      phone:            String,
      location:         String,
      summary:          String,
      career:           String,
      level:            String, // "fresher" | "experienced"
      isTech:           Boolean,
      targetRole:       String,
      techStack:        [String],
      experience: [
        { company: String, role: String, duration: String, description: String },
      ],
      education: [
        { degree: String, institution: String, year: String },
      ],
      suggestedBullets: [String],
      selectedTemplate: String,
    },

    documentText: String,
    isComplete:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-update title when name is set
chatSchema.methods.refreshTitle = function () {
  const name = this.resumeData?.name;
  const role = this.resumeData?.targetRole;
  if (name) {
    this.title = role ? `${name} — ${role}` : `${name}'s Resume`;
  }
};

const Chat = mongoose.model("ResumeChat", chatSchema);
export default Chat;
