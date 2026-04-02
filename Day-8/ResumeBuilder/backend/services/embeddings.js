// ============================================================
// EMBEDDINGS SERVICE — ChromaDB (same setup as Day-7)
// Stores resume tips & role-specific bullet points
// ============================================================
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import { ChromaClient } from "chromadb";
import dotenv from "dotenv";

dotenv.config();

// ── Gemini Embeddings (same as Day-7) ────────────────────────
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

const COLLECTION_NAME = "resume_knowledge_v1";

// ── Curated resume knowledge base ───────────────────────────
const KNOWLEDGE_DOCS = [
  // Frontend
  new Document({ pageContent: "Developed responsive React applications using hooks and context API, improving user engagement by 35%", metadata: { role: "frontend developer", type: "bullet" } }),
  new Document({ pageContent: "Built reusable component libraries with Storybook, reducing development time by 40%", metadata: { role: "frontend developer", type: "bullet" } }),
  new Document({ pageContent: "Optimised web performance achieving 90+ Lighthouse scores through code splitting and lazy loading", metadata: { role: "frontend developer", type: "bullet" } }),
  new Document({ pageContent: "Implemented pixel-perfect UI designs from Figma mockups across mobile and desktop viewports", metadata: { role: "frontend developer", type: "bullet" } }),

  // Backend
  new Document({ pageContent: "Designed and implemented RESTful APIs handling 10,000+ daily requests with 99.9% uptime", metadata: { role: "backend developer", type: "bullet" } }),
  new Document({ pageContent: "Architected microservices infrastructure using Docker and Kubernetes reducing deployment time by 60%", metadata: { role: "backend developer", type: "bullet" } }),
  new Document({ pageContent: "Optimised SQL and NoSQL database queries reducing average response time from 2s to 200ms", metadata: { role: "backend developer", type: "bullet" } }),
  new Document({ pageContent: "Implemented JWT authentication and role-based access control for enterprise SaaS platform", metadata: { role: "backend developer", type: "bullet" } }),

  // Full Stack
  new Document({ pageContent: "End-to-end development of SaaS platform serving 5000+ users using React, Node.js, and PostgreSQL", metadata: { role: "full stack developer", type: "bullet" } }),
  new Document({ pageContent: "Integrated third-party payment gateways (Stripe, Razorpay) processing $50K+ monthly transactions", metadata: { role: "full stack developer", type: "bullet" } }),
  new Document({ pageContent: "Led agile sprint planning and conducted code reviews for a cross-functional team of 6 engineers", metadata: { role: "full stack developer", type: "bullet" } }),

  // Data Analyst
  new Document({ pageContent: "Analysed customer behaviour datasets of 1M+ records using Python (Pandas, NumPy) to identify churn patterns", metadata: { role: "data analyst", type: "bullet" } }),
  new Document({ pageContent: "Created interactive Power BI dashboards providing real-time KPI visibility to C-suite executives", metadata: { role: "data analyst", type: "bullet" } }),
  new Document({ pageContent: "Built predictive models using Scikit-learn achieving 87% accuracy in sales forecasting", metadata: { role: "data analyst", type: "bullet" } }),
  new Document({ pageContent: "Automated weekly reporting pipeline using Python scripts saving 8 hours of manual work per week", metadata: { role: "data analyst", type: "bullet" } }),

  // Product Manager
  new Document({ pageContent: "Defined product roadmap and managed backlog for mobile app with 100K+ downloads, increasing DAU by 25%", metadata: { role: "product manager", type: "bullet" } }),
  new Document({ pageContent: "Conducted 50+ user interviews and A/B tests to validate product hypotheses and feature prioritisation", metadata: { role: "product manager", type: "bullet" } }),
  new Document({ pageContent: "Collaborated with engineering and design teams to ship 3 major features on time and within budget", metadata: { role: "product manager", type: "bullet" } }),

  // DevOps
  new Document({ pageContent: "Designed CI/CD pipelines using GitHub Actions and Jenkins reducing release cycle from 2 weeks to 2 days", metadata: { role: "devops engineer", type: "bullet" } }),
  new Document({ pageContent: "Managed AWS infrastructure (EC2, RDS, S3, Lambda) with 99.95% availability SLA", metadata: { role: "devops engineer", type: "bullet" } }),
  new Document({ pageContent: "Implemented centralised logging with ELK stack providing real-time monitoring and alerting", metadata: { role: "devops engineer", type: "bullet" } }),

  // Marketing Manager
  new Document({ pageContent: "Led digital marketing campaigns generating 300% ROI across Google Ads, Facebook, and email channels", metadata: { role: "marketing manager", type: "bullet" } }),
  new Document({ pageContent: "Grew organic traffic by 150% in 6 months through SEO strategy, content marketing, and link building", metadata: { role: "marketing manager", type: "bullet" } }),
  new Document({ pageContent: "Managed $200K annual marketing budget and a team of 4 content creators and designers", metadata: { role: "marketing manager", type: "bullet" } }),

  // General tips
  new Document({ pageContent: "Use strong action verbs: Led, Developed, Optimised, Implemented, Designed, Built, Achieved, Delivered", metadata: { role: "general", type: "tip" } }),
  new Document({ pageContent: "Quantify achievements wherever possible: percentages, dollar amounts, time saved, user numbers", metadata: { role: "general", type: "tip" } }),
  new Document({ pageContent: "Keep resume to 1 page for freshers, maximum 2 pages for experienced professionals", metadata: { role: "general", type: "tip" } }),
  new Document({ pageContent: "Use ATS-friendly formatting: simple fonts, standard section headers, no tables or graphics in the main body", metadata: { role: "general", type: "tip" } }),
];

let vectorStore = null;
let isSeeded = false;

// ── Initialise ChromaDB knowledge base ──────────────────────
export async function initChromaKnowledgeBase() {
  try {
    const chromaClient = new ChromaClient({
      // Provide cloud instance details from .env
      tenant: process.env.CHROME_TENANT_ID,
      database: process.env.CHROME_DATABASE,
      auth: {
        provider: "token",
        credentials: process.env.CHROMA_API_KEY,
        tokenHeader: "x-chroma-token"
      }
    });

    vectorStore = await Chroma.fromDocuments(KNOWLEDGE_DOCS, embeddings, {
      collectionName: COLLECTION_NAME,
      index: chromaClient
    });
    
    isSeeded = true;
    console.log(`✅ Chroma Cloud DB seeded with ${KNOWLEDGE_DOCS.length} resume knowledge docs`);
  } catch (err) {
    console.warn("⚠️  Chroma Cloud DB not available. Suggestions will use fallback.", err.message || err);
    isSeeded = false;
  }
}

// ── Get role-specific suggestions ───────────────────────────
export async function getRoleSuggestions(targetRole, techStack = []) {
  if (!isSeeded || !vectorStore) {
    return getFallbackSuggestions(targetRole);
  }

  try {
    const query = `Resume bullet points for ${targetRole} with skills ${techStack.join(", ")}`;
    const results = await vectorStore.similaritySearch(query, 5);
    return results.map((doc) => doc.pageContent);
  } catch {
    return getFallbackSuggestions(targetRole);
  }
}

// ── Fallback suggestions if ChromaDB is unavailable ─────────
function getFallbackSuggestions(role = "") {
  const lower = role.toLowerCase();
  if (lower.includes("frontend") || lower.includes("react")) {
    return [
      "Built responsive web UIs using React.js and Tailwind CSS",
      "Integrated REST APIs and managed state with Redux Toolkit",
      "Improved page load time by 40% through code splitting",
    ];
  }
  if (lower.includes("backend") || lower.includes("node")) {
    return [
      "Developed RESTful APIs with Node.js and Express, handling 10K+ requests/day",
      "Designed MongoDB schemas and optimised queries for high-traffic endpoints",
      "Implemented JWT-based authentication and role-based access control",
    ];
  }
  if (lower.includes("data") || lower.includes("analyst")) {
    return [
      "Analysed datasets of 500K+ records using Python (Pandas, Matplotlib)",
      "Built Power BI dashboards delivering daily sales insights to management",
      "Created regression models with 85% accuracy for demand forecasting",
    ];
  }
  return [
    "Delivered high-impact projects on time and within scope",
    "Collaborated cross-functionally to drive strategic initiatives",
    "Identified process inefficiencies, reducing operational costs by 20%",
  ];
}
