// ============================================================
// TemplateGallery — Grid of template cards
// ============================================================
import { useResume } from "../../context/ResumeContext";
import TemplateCard from "./TemplateCard";

export default function TemplateGallery({ onSelect }) {
  const { templates, selectedTemplateId } = useResume();

  if (!templates.length) return null;

  return (
    <div className="right-panel-body">
      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
        ✨ These templates are personalised for your profile. Click one to preview and populate it with your data.
      </p>
      <div className="template-gallery">
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            selected={selectedTemplateId === t.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
