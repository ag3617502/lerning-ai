import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";
import Chat from "../models/Chat.js";
import { getRoleSuggestions } from "./embeddings.js";

dotenv.config();

// ── LLM Instance (Groq — same model as Day-7) ───────────────
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEYS,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

const outputParser = new StringOutputParser();

// ── Template definitions ─────────────────────────────────────
export const TEMPLATES = [
  { id: "fresher_tech_1",       label: "Tech Starter",       category: "fresher+tech",       color: "#00d4ff", desc: "Clean minimal layout with prominent skills grid — perfect for CS/IT freshers" },
  { id: "fresher_tech_2",       label: "Modern Dev",         category: "fresher+tech",       color: "#7c3aed", desc: "Dark header with vibrant accent, great for web/app developers" },
  { id: "fresher_nontech_1",    label: "Fresh Classic",      category: "fresher+nontech",    color: "#f59e0b", desc: "Warm professional layout focused on education & soft skills" },
  { id: "fresher_nontech_2",    label: "Creative Entry",     category: "fresher+nontech",    color: "#10b981", desc: "Two-column sidebar layout ideal for commerce/arts freshers" },
  { id: "experienced_tech_1",   label: "Senior Dev",         category: "experienced+tech",   color: "#3b82f6", desc: "Timeline experience layout with GitHub-style skill badges" },
  { id: "experienced_tech_2",   label: "Tech Lead",          category: "experienced+tech",   color: "#1e1b4b", desc: "Executive dark theme with full-width project showcase" },
  { id: "experienced_nontech_1","label": "Professional Plus", category: "experienced+nontech",color: "#dc2626", desc: "Achievement-focused, ATS-friendly with clean section breaks" },
  { id: "experienced_nontech_2","label": "Executive",         category: "experienced+nontech",color: "#92400e", desc: "Elegant navy two-page layout ideal for managers & executives" },
  { id: "universal_minimal",    label: "Minimal Ace",        category: "universal",          color: "#374151", desc: "Ultra-clean single-column — excellent ATS pass-through rate" },
  { id: "universal_creative",   label: "Creative Pro",       category: "universal",          color: "#be185d", desc: "Bold typography with infographic-style skills — stands out visually" },
];

// ── Conversation phases helper messages ─────────────────────
const PHASE_QUESTIONS = {
  greeting: `Hi there! 👋 I'm your AI Resume Assistant. I can help you build a professional, job-ready resume step by step.\n\nTo create a complete resume, I will need the following details:\n• Personal Info (Name, Email, Phone, Location)\n• Educational Background\n• Work Experience (Company, Role, Duration)\n• Tech Stack/Skills & Target Job Role\n\n💡 **Pro Tip:** You can click the 📎 **Upload** icon below at any time to upload your existing resume (PDF, DOCX, or TXT). I'll analyze it and automatically extract all this information! If anything is missing, I'll just ask you for it.\n\nIf you prefer to start manually right now — are you a **fresher** (fresh graduate / 0-2 years experience) or an **experienced** professional?`,

  career: (name) =>
    `Great to meet you, ${name || ""}! 🎓\n\nWhat is your **career field or stream**? For example:\n- Software Engineering / Computer Science\n- Marketing / Business\n- Finance / Accounting\n- Design / Arts\n- Healthcare / Medical\n- Any other field!`,

  personal_name: `Let's fill in your personal details.\n\n📝 What is your **full name**?`,
  personal_email: (name) => `Nice to meet you, **${name}**! 📧 What is your **email address**?`,
  personal_phone: `📱 What is your **phone number**?`,
  personal_location: `📍 What is your **city and country** (e.g. Mumbai, India)?`,

  experience_start: `💼 Let's add your work experience.\n\nWhat was your **most recent company name**?`,
  experience_role: `What was your **job title / role** at that company?`,
  experience_duration: `How long did you work there? (e.g. "Jan 2022 – Dec 2023" or "2 years")`,
  experience_desc: `Briefly describe your **key responsibilities or achievements** there.`,
  experience_more: `Would you like to add **another work experience**? (yes / no)`,

  tech_stack: `🛠️ What is your **tech stack / skills**?\n\nList them separated by commas (e.g. React, Node.js, Python, MongoDB, AWS)`,

  education: `🎓 What is your **highest qualification**? (e.g. B.Tech Computer Science, XYZ University, 2024)`,

  role_specific: `🎯 Almost done! Do you want to **tailor this resume for a specific job role**?\n\nIf yes, type the role (e.g. "Frontend Developer", "Data Analyst", "Product Manager").\nIf no, just say **"no"** and I'll use general formatting.`,

  show_templates: `🎨 Excellent! I have everything I need. Here are your **personalised resume templates** — pick one that you like and I'll populate it with your data!`,
};

// ── Main socket handler ──────────────────────────────────────
export async function handleSocketConnection(socket, io, chatId) {
  // Ensure we don't bind duplicate listeners if the frontend accidentally initializes multiple times
  socket.removeAllListeners("user_message");
  socket.removeAllListeners("template_selected");
  socket.removeAllListeners("generate_pdf");
  socket.removeAllListeners("document_parsed");

  // Load existing chat OR create a new one
  let chat;
  if (chatId) {
    chat = await Chat.findOne({ _id: chatId, userId: socket.userId });
    if (!chat) {
      socket.emit("error", { message: "Chat not found" });
      return;
    }
    // Replay conversation history to the new socket
    if (chat.conversationHistory.length > 0) {
      socket.emit("chat_restored", {
        messages: chat.conversationHistory,
        resumeData: chat.resumeData,
        phase: chat.phase,
        templates: getRelevantTemplates(chat.resumeData),
        selectedTemplate: chat.resumeData?.selectedTemplate,
      });
      return; // don't re-greet
    }
  } else {
    // New chat
    chat = await Chat.create({ userId: socket.userId, title: "New Resume" });
    // Notify frontend of the new chatId so it can update the URL/sidebar
    socket.emit("chat_created", { chatId: chat._id.toString() });
  }

  socket._currentChat = chat;

  // Send greeting immediately for new chats
  chat.phase = "greeting";
  await streamAIMessage(socket, chat, PHASE_QUESTIONS.greeting);
  await chat.save();

  // ── Incoming user message event ──────────────────────────
  socket.on("user_message", async (data) => {
    try {
      const userText = data.text?.trim();
      if (!userText) return;

      // Re-fetch chat to get latest state
      chat = await Chat.findById(chat._id);
      if (!chat) return;
      socket._currentChat = chat;

      chat.conversationHistory.push({ role: "user", content: userText });

      await processPhase(socket, chat, userText);

      await chat.save();
    } catch (err) {
      console.error("Socket message error:", err);
      socket.emit("error", { message: "Something went wrong. Please try again." });
    }
  });

  // ── Template selection event ─────────────────────────────
  socket.on("template_selected", async (data) => {
    try {
      chat = await Chat.findById(chat._id);
      if (!chat) return;
      socket._currentChat = chat;

      chat.resumeData.selectedTemplate = data.templateId;
      chat.isComplete = true;
      chat.refreshTitle();
      await chat.save();

      socket.emit("resume_ready", {
        templateId: data.templateId,
        resumeData: chat.resumeData,
      });

      await streamAIMessage(
        socket,
        chat,
        `✅ I've populated **${getTemplateName(data.templateId)}** with your details!\n\nYou can preview it on the right. Click **"Download PDF"** when you're happy with it. 🎉`
      );
    } catch (err) {
      console.error("Template selection error:", err);
    }
  });

  // ── PDF generation request ───────────────────────────────
  socket.on("generate_pdf", async () => {
    try {
      chat = await Chat.findById(chat._id);
      if (!chat) return;
      socket.emit("pdf_generating", { message: "Generating your PDF resume…" });

      const { generatePDF } = await import("./pdfGenerator.js");
      const pdfBase64 = await generatePDF(
        chat.resumeData.selectedTemplate || "universal_minimal",
        chat.resumeData
      );

      socket.emit("pdf_ready", { pdf: pdfBase64 });
    } catch (err) {
      console.error("PDF error:", err);
      socket.emit("error", { message: "PDF generation failed. Please try again." });
    }
  });

  // ── Document upload parsed event ─────────────────────────
  socket.on("document_parsed", async (data) => {
    try {
      chat = await Chat.findById(chat._id);
      if (!chat) return;
      socket._currentChat = chat;

      chat.documentText = data.text;
      const extracted = await extractDataFromDocument(data.text);
      Object.assign(chat.resumeData, extracted);
      
      const { name, email, phone, location } = chat.resumeData;
      if (!name || !email || !phone || !location) {
        chat.phase = "personal";
        chat.step = !name ? 0 : !email ? 1 : !phone ? 2 : 3;
        await streamAIMessage(
          socket,
          chat,
          `📄 I've extracted details from your document, but some essential info is missing!\n\nLet's fill in the gaps.`
        );
        // The frontend will now wait for user input on the missing field!
      } else {
        chat.phase = "role_specific";
        await streamAIMessage(
          socket,
          chat,
          `📄 I've analysed your document and extracted all your details!\n\n` +
            `**Name:** ${chat.resumeData.name}\n` +
            `**Email:** ${chat.resumeData.email}\n` +
            `**Skills:** ${chat.resumeData.techStack?.join(", ") || "Not found"}\n\n` +
            PHASE_QUESTIONS.role_specific
        );
        await emitSuggestions(socket, extracted);
      }
      
      await chat.save();
    } catch (err) {
      console.error("Document parse error:", err);
    }
  });
}

// ── Phase processor (state machine) ─────────────────────────
async function processPhase(socket, chat, userText) {
  const { phase, step, resumeData } = chat;

  switch (phase) {
    // ── GREETING: detect fresher/experienced ──────────────
    case "greeting": {
      const lower = userText.toLowerCase();
      const isFresher =
        lower.includes("fresher") || lower.includes("fresh") || lower.includes("graduate") || lower.includes("junior");
      chat.resumeData.level = isFresher ? "fresher" : "experienced";

      // If user typed a lot, extract any personal details gracefully using the LLM
      if (userText.length > 25) {
        socket.emit("ai_typing", { typing: true });
        const extracted = await extractDataFromDocument(userText);
        Object.assign(chat.resumeData, extracted);
        // Ensure the 'fresher' level detection isn't accidentally overridden by the generic parser
        chat.resumeData.level = isFresher ? "fresher" : "experienced";
      }

      chat.phase = "personal";
      const { name, email, phone, location } = chat.resumeData;
      
      let msgPrefix = `Got it! You're ${isFresher ? "a **fresher**" : "an **experienced professional**"} 🎯\n\n`;
      if (userText.length > 25 && (name || email || phone)) {
          msgPrefix += `Thanks for providing some of your details upfront! Let's fill in the gaps.\n\n`;
      } else {
          msgPrefix += `Let's fill in your personal details.\n\n`;
      }

      // Jump dynamically to the first MISSING field
      if (!name) {
        chat.step = 0;
        await streamAIMessage(socket, chat, msgPrefix + `📝 What is your **full name**?`);
      } else if (!email) {
        chat.step = 1;
        await streamAIMessage(socket, chat, msgPrefix + PHASE_QUESTIONS.personal_email(name));
      } else if (!phone) {
        chat.step = 2;
        await streamAIMessage(socket, chat, msgPrefix + PHASE_QUESTIONS.personal_phone);
      } else if (!location) {
        chat.step = 3;
        await streamAIMessage(socket, chat, msgPrefix + PHASE_QUESTIONS.personal_location);
      } else {
        chat.step = 0;
        chat.phase = "career";
        await streamAIMessage(socket, chat, msgPrefix + PHASE_QUESTIONS.career(name));
        socket.emit("suggestions", {
          items: ["Software Engineering", "Data Science", "Marketing", "Finance", "Design", "Healthcare"],
          label: "Career fields",
        });
      }
      break;
    }

    // ── PERSONAL: collect name → email → phone → location ─
    case "personal": {
      // 1) Evaluate the answer for the CURRENT step being asked
      if (userText) {
        if (chat.step === 0) {
          if (userText.length < 2) { await streamAIMessage(socket, chat, `Please provide a valid full name to continue. 📝`); break; }
          chat.resumeData.name = userText;
        } else if (chat.step === 1) {
          if (!userText.includes("@")) { await streamAIMessage(socket, chat, `That doesn't look like a valid email. Please provide your email address to continue. 📧`); break; }
          chat.resumeData.email = userText;
        } else if (chat.step === 2) {
          if (userText.length < 5) { await streamAIMessage(socket, chat, `Please provide a valid phone number to continue. 📱`); break; }
          chat.resumeData.phone = userText;
        } else if (chat.step === 3) {
          if (userText.length < 2) { await streamAIMessage(socket, chat, `Please provide your city and country to continue. 📍`); break; }
          chat.resumeData.location = userText;
        }
      }

      // 2) Determine the NEXT required missing field, or move on to Career
      if (!chat.resumeData.name) {
        chat.step = 0;
        await streamAIMessage(socket, chat, PHASE_QUESTIONS.personal_name);
      } else if (!chat.resumeData.email) {
        chat.step = 1;
        await streamAIMessage(socket, chat, PHASE_QUESTIONS.personal_email(chat.resumeData.name));
      } else if (!chat.resumeData.phone) {
        chat.step = 2;
        await streamAIMessage(socket, chat, PHASE_QUESTIONS.personal_phone);
      } else if (!chat.resumeData.location) {
        chat.step = 3;
        await streamAIMessage(socket, chat, PHASE_QUESTIONS.personal_location);
      } else {
        chat.step = 0;
        chat.phase = "career";
        await streamAIMessage(socket, chat, PHASE_QUESTIONS.career(chat.resumeData.name));
        socket.emit("suggestions", {
          items: ["Software Engineering", "Data Science", "Marketing", "Finance", "Design", "Healthcare"],
          label: "Career fields",
        });
      }
      break;
    }

    // ── CAREER: identify field + tech/non-tech ────────────
    case "career": {
      chat.resumeData.career = userText;
      const techKeywords = [
        "software", "computer", "tech", "engineering", "data", "ai", "ml",
        "developer", "programmer", "it", "cyber", "cloud", "devops", "web",
      ];
      chat.resumeData.isTech = techKeywords.some((k) =>
        userText.toLowerCase().includes(k)
      );

      if (chat.resumeData.level === "experienced") {
        chat.phase = "experience";
        chat.step = 0;
        await streamAIMessage(socket, chat, `Great! Let's add your work experience.\n\n` + PHASE_QUESTIONS.experience_start);
      } else if (chat.resumeData.isTech) {
        chat.phase = "tech_stack";
        await streamAIMessage(socket, chat, PHASE_QUESTIONS.tech_stack);
        socket.emit("suggestions", {
          items: ["React, Node.js, MongoDB", "Python, Django, PostgreSQL", "Java, Spring Boot, MySQL", "Flutter, Dart, Firebase"],
          label: "Common tech stacks",
        });
      } else {
        chat.phase = "education";
        await streamAIMessage(socket, chat, PHASE_QUESTIONS.education);
      }
      break;
    }

    // ── EXPERIENCE: multi-step, supports multiple entries ──
    case "experience": {
      const exLen = chat.resumeData.experience?.length || 0;

      switch (chat.step) {
        case 0: // company
          chat.resumeData.experience = chat.resumeData.experience || [];
          chat.resumeData.experience.push({ company: userText });
          chat.step = 1;
          await streamAIMessage(socket, chat, PHASE_QUESTIONS.experience_role);
          break;

        case 1: // role
          chat.resumeData.experience[exLen - 1].role = userText;
          chat.step = 2;
          await streamAIMessage(socket, chat, PHASE_QUESTIONS.experience_duration);
          break;

        case 2: // duration
          chat.resumeData.experience[exLen - 1].duration = userText;
          chat.step = 3;
          await streamAIMessage(socket, chat, PHASE_QUESTIONS.experience_desc);
          break;

        case 3: // description
          chat.resumeData.experience[exLen - 1].description = userText;
          chat.step = 4;
          await streamAIMessage(socket, chat, PHASE_QUESTIONS.experience_more);
          socket.emit("suggestions", { items: ["Yes, add more", "No, continue"], label: "" });
          break;

        case 4: // more?
          if (userText.toLowerCase().startsWith("y")) {
            chat.step = 0;
            await streamAIMessage(socket, chat, PHASE_QUESTIONS.experience_start);
          } else {
            if (chat.resumeData.isTech) {
              chat.phase = "tech_stack";
              await streamAIMessage(socket, chat, PHASE_QUESTIONS.tech_stack);
              socket.emit("suggestions", {
                items: ["React, Node.js, MongoDB", "Python, TensorFlow, Pandas", "Java, Spring, AWS"],
                label: "Common tech stacks",
              });
            } else {
              chat.phase = "education";
              await streamAIMessage(socket, chat, PHASE_QUESTIONS.education);
            }
          }
          break;
      }
      break;
    }

    // ── TECH STACK ────────────────────────────────────────
    case "tech_stack": {
      chat.resumeData.techStack = userText.split(",").map((s) => s.trim()).filter(Boolean);
      chat.phase = "education";
      await streamAIMessage(socket, chat, PHASE_QUESTIONS.education);
      break;
    }

    // ── EDUCATION ─────────────────────────────────────────
    case "education": {
      chat.resumeData.education = [{ degree: userText, institution: "", year: "" }];
      chat.phase = "role_specific";
      await streamAIMessage(socket, chat, PHASE_QUESTIONS.role_specific);
      socket.emit("suggestions", {
        items: ["Frontend Developer", "Data Analyst", "Product Manager", "No thanks, skip", "DevOps Engineer", "Marketing Manager"],
        label: "Popular target roles",
      });
      break;
    }

    // ── ROLE SPECIFIC ─────────────────────────────────────
    case "role_specific": {
      const lower = userText.toLowerCase();
      if (!lower.includes("no") && !lower.includes("skip") && !lower.includes("general")) {
        chat.resumeData.targetRole = userText;

        await streamAIMessage(socket, chat, `🔍 Analysing the best resume bullets for **${userText}**…`);
        const [summary, bullets] = await Promise.all([
          generateProfessionalSummary(chat.resumeData),
          getRoleSuggestions(userText, chat.resumeData.techStack || []),
        ]);
        chat.resumeData.summary = summary;
        chat.resumeData.suggestedBullets = bullets;

        socket.emit("ai_suggestions", {
          title: `💡 AI-Powered Suggestions for "${userText}"`,
          bullets,
          summary,
        });
      } else {
        const summary = await generateProfessionalSummary(chat.resumeData);
        chat.resumeData.summary = summary;
      }

      const filteredTemplates = getRelevantTemplates(chat.resumeData);

      chat.phase = "show_templates";
      await streamAIMessage(socket, chat, PHASE_QUESTIONS.show_templates);
      socket.emit("show_templates", { templates: filteredTemplates });
      break;
    }

    default:
      break;
  }
}

// ── Stream AI message over socket ───────────────────────────
async function streamAIMessage(socket, chat, text) {
  socket.emit("ai_typing", { typing: true });

  // Simulate streaming by chunking the static text (word by word)
  // For truly dynamic AI responses we use .stream() below
  const words = text.split(" ");
  socket.emit("stream_start", {});
  for (const word of words) {
    socket.emit("stream_token", { token: word + " " });
    await delay(18); // ~55 words/sec feels natural
  }
  socket.emit("stream_end", {});
  socket.emit("ai_typing", { typing: false });

  if (chat && chat.conversationHistory) {
    chat.conversationHistory.push({ role: "assistant", content: text });
  }

  return text;
}

// ── Real LLM streaming for AI-generated content ─────────────
async function streamLLMResponse(socket, prompt) {
  const chain = PromptTemplate.fromTemplate(prompt).pipe(llm).pipe(outputParser);
  socket.emit("stream_start", {});
  socket.emit("ai_typing", { typing: true });

  const stream = await PromptTemplate.fromTemplate(prompt)
    .pipe(llm)
    .stream({});

  let full = "";
  for await (const chunk of stream) {
    const token = chunk.content || "";
    full += token;
    socket.emit("stream_token", { token });
  }
  socket.emit("stream_end", {});
  socket.emit("ai_typing", { typing: false });
  return full;
}

// ── Generate professional summary via Groq ───────────────────
async function generateProfessionalSummary(resumeData) {
  try {
    const prompt = PromptTemplate.fromTemplate(
      `You are an expert resume writer. Write a concise 2-3 sentence professional summary for a resume.
      
      Candidate info:
      - Name: {name}
      - Level: {level}
      - Career field: {career}
      - Skills: {skills}
      - Target role: {targetRole}
      - Experience: {experience}
      
      Write ONLY the summary paragraph, no extra text. Make it ATS-friendly, impactful, and professional.`
    );

    const chain = prompt.pipe(llm).pipe(outputParser);
    const summary = await chain.invoke({
      name: resumeData.name || "Candidate",
      level: resumeData.level || "fresher",
      career: resumeData.career || "Technology",
      skills: resumeData.techStack?.join(", ") || "various domains",
      targetRole: resumeData.targetRole || "relevant position",
      experience:
        resumeData.experience?.map((e) => `${e.role} at ${e.company}`).join(", ") ||
        "fresher",
    });
    return summary;
  } catch {
    return `Dynamic ${resumeData.level === "fresher" ? "entry-level" : "experienced"} professional in ${resumeData.career || "the industry"}, seeking to leverage skills in ${resumeData.techStack?.slice(0, 3).join(", ") || "relevant technologies"}.`;
  }
}

// ── Extract data from uploaded document via Groq ────────────
async function extractDataFromDocument(text) {
  try {
    const prompt = PromptTemplate.fromTemplate(
      `Extract resume information from the following document text and return ONLY valid JSON (no markdown, no explanation):
      
      Document:
      {text}
      
      Return JSON with these exact keys (use empty string if not found):
      {{
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "career": "",
        "level": "fresher or experienced",
        "isTech": true or false,
        "techStack": [],
        "experience": [{{"company":"","role":"","duration":"","description":""}}],
        "education": [{{"degree":"","institution":"","year":""}}]
      }}`
    );

    const chain = prompt.pipe(llm).pipe(outputParser);
    const raw = await chain.invoke({ text: text.substring(0, 3000) });
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return {};
  }
}

// ── Filter templates by user profile ────────────────────────
function getRelevantTemplates(resumeData) {
  const { level, isTech } = resumeData;
  return TEMPLATES.filter((t) => {
    if (t.category === "universal") return true;
    if (level === "fresher" && t.category.startsWith("fresher")) return true;
    if (level === "experienced" && t.category.startsWith("experienced")) return true;
    return false;
  });
}

// ── Emit smart suggestions to frontend ──────────────────────
async function emitSuggestions(socket, resumeData) {
  const items = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Product Manager",
  ];
  socket.emit("suggestions", { items, label: "Suggested target roles" });
}

function getTemplateName(id) {
  return TEMPLATES.find((t) => t.id === id)?.label || id;
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
