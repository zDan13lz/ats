import { C } from "../styles/tokens";

const toolMeta = {
  scan_resume: { icon: "📊", label: "ATS Scan", color: C.accent },
  rewrite_resume: { icon: "✏️", label: "Resume Rewrite", color: C.amber },
  generate_cover_letter: { icon: "📝", label: "Cover Letter", color: C.green },
  generate_interview_prep: { icon: "🎯", label: "Interview Prep", color: "#7C5CFC" },
  research_company: { icon: "🏢", label: "Company Research", color: "#D64D8A" },
  research_salary: { icon: "💰", label: "Salary Research", color: "#0D9668" },
  scrape_job_url: { icon: "🔗", label: "URL Scraper", color: "#3B82F6" },
  ask_user: { icon: "💬", label: "Asking You", color: C.accent },
  find_jobs: { icon: "🔍", label: "Job Search", color: "#E67E22" },
};

export default function ToolBadge({ tool }) {
  const meta = toolMeta[tool] || { icon: "⚙️", label: tool, color: C.t2 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
      color: meta.color, background: meta.color + "12",
      border: `1px solid ${meta.color}20`,
    }}>
      <span style={{ fontSize: 12 }}>{meta.icon}</span>
      {meta.label}
    </span>
  );
}