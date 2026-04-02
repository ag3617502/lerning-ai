// ============================================================
// PDF GENERATOR — Puppeteer renders HTML template to PDF
// ============================================================
import puppeteer from "puppeteer";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a PDF from an HTML resume template filled with user data.
 * @param {string} templateId - e.g. "fresher_tech_1"
 * @param {object} resumeData - all collected resume fields
 * @returns {string} base64 encoded PDF
 */
export async function generatePDF(templateId, resumeData) {
  // Load the HTML template
  const templatePath = path.join(__dirname, "..", "templates", `${templateId}.html`);
  let html = await readFile(templatePath, "utf-8");

  // ── Replace placeholders ────────────────────────────────
  html = html
    .replace(/{{NAME}}/g, resumeData.name || "Your Name")
    .replace(/{{EMAIL}}/g, resumeData.email || "email@example.com")
    .replace(/{{PHONE}}/g, resumeData.phone || "+91 00000 00000")
    .replace(/{{LOCATION}}/g, resumeData.location || "City, Country")
    .replace(/{{CAREER}}/g, resumeData.career || "Professional")
    .replace(/{{SUMMARY}}/g, resumeData.summary || "")
    .replace(/{{TARGET_ROLE}}/g, resumeData.targetRole || resumeData.career || "Professional");

  // Skills / Tech Stack
  const skillsHtml = (resumeData.techStack || [])
    .map((s) => `<span class="skill-tag">${s}</span>`)
    .join("");
  html = html.replace(/{{SKILLS}}/g, skillsHtml || "<span class='skill-tag'>N/A</span>");

  // Experience
  const expHtml = (resumeData.experience || [])
    .map(
      (e) => `
      <div class="exp-item">
        <div class="exp-header">
          <strong>${e.role || "Role"}</strong>
          <span class="exp-company">${e.company || "Company"}</span>
          <span class="exp-duration">${e.duration || ""}</span>
        </div>
        <p class="exp-desc">${e.description || ""}</p>
      </div>`
    )
    .join("");
  html = html.replace(/{{EXPERIENCE}}/g, expHtml || "<p>No experience listed</p>");

  // Education
  const eduHtml = (resumeData.education || [])
    .map(
      (e) => `
      <div class="edu-item">
        <strong>${e.degree || "Degree"}</strong>
        ${e.institution ? `<span> — ${e.institution}</span>` : ""}
        ${e.year ? `<span class="edu-year">${e.year}</span>` : ""}
      </div>`
    )
    .join("");
  html = html.replace(/{{EDUCATION}}/g, eduHtml || "<p>Education details</p>");

  // AI Suggested bullets
  const bulletsHtml = (resumeData.suggestedBullets || [])
    .map((b) => `<li>${b}</li>`)
    .join("");
  html = html.replace(/{{SUGGESTED_BULLETS}}/g, bulletsHtml ? `<ul>${bulletsHtml}</ul>` : "");

  // ── Launch Puppeteer ────────────────────────────────────
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });

  await browser.close();

  // Return as base64 string for socket transmission
  return Buffer.from(pdfBuffer).toString("base64");
}
