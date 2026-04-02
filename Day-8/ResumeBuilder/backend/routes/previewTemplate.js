// ============================================================
// PREVIEW TEMPLATE ROUTE
// POST /api/preview-template?id=fresher_tech_1
// Returns populated HTML for iframe preview
// ============================================================
import express from "express";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post("/", async (req, res) => {
  const { id } = req.query;
  const resumeData = req.body;

  if (!id) return res.status(400).send("Template ID required");

  try {
    const templatePath = path.join(__dirname, "..", "templates", `${id}.html`);
    let html = await readFile(templatePath, "utf-8");

    // Populate placeholders
    html = html
      .replace(/{{NAME}}/g, resumeData.name || "Your Name")
      .replace(/{{EMAIL}}/g, resumeData.email || "email@example.com")
      .replace(/{{PHONE}}/g, resumeData.phone || "+91 00000 00000")
      .replace(/{{LOCATION}}/g, resumeData.location || "City, Country")
      .replace(/{{CAREER}}/g, resumeData.career || "Professional")
      .replace(/{{SUMMARY}}/g, resumeData.summary || "")
      .replace(/{{TARGET_ROLE}}/g, resumeData.targetRole || resumeData.career || "Professional");

    const skillsHtml = (resumeData.techStack || [])
      .map((s) => `<span class="skill-tag">${s}</span>`).join("");
    html = html.replace(/{{SKILLS}}/g, skillsHtml || "<span class='skill-tag'>N/A</span>");

    const expHtml = (resumeData.experience || [])
      .map((e) => `
        <div class="exp-item">
          <div class="exp-header">
            <strong>${e.role || "Role"}</strong>
            <span class="exp-company">${e.company || "Company"}</span>
            <span class="exp-duration">${e.duration || ""}</span>
          </div>
          <p class="exp-desc">${e.description || ""}</p>
        </div>`).join("");
    html = html.replace(/{{EXPERIENCE}}/g, expHtml || "<p>No experience listed</p>");

    const eduHtml = (resumeData.education || [])
      .map((e) => `
        <div class="edu-item">
          <strong>${e.degree || "Degree"}</strong>
          ${e.institution ? `<span> — ${e.institution}</span>` : ""}
          ${e.year ? `<span class="edu-year">${e.year}</span>` : ""}
        </div>`).join("");
    html = html.replace(/{{EDUCATION}}/g, eduHtml || "<p>Education details</p>");

    const bulletsHtml = (resumeData.suggestedBullets || [])
      .map((b) => `<li>${b}</li>`).join("");
    html = html.replace(/{{SUGGESTED_BULLETS}}/g, bulletsHtml ? `<ul class="bullets-list">${bulletsHtml}</ul>` : "");

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    res.status(500).send(`<p>Error: ${err.message}</p>`);
  }
});

export default router;
