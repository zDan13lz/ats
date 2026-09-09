// ══════════════════════════════════════
// Deliverable.jsx — Autopilot results display
// Sections: score, resume, cover letter, interview,
//           company, jobs, salary
// PDF export on resume and cover letter
// ══════════════════════════════════════

import { C, sc, scBg, scLbl } from "../styles/tokens";
import { downloadPdf } from "../utils/api";
import ScoreRing from "./ScoreRing";

// ── Reusable section wrapper ──
function Section({ title, children }) {
  return (
    <div style={{
      background: C.s1, border: "1px solid " + C.border,
      borderRadius: 10, padding: 18, marginBottom: 12,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
        color: C.t3, marginBottom: 12,
      }}>{title}</div>
      {children}
    </div>
  );
}

// ── Action button styles ──
var btnOutline = {
  padding: "8px 16px", borderRadius: 8, border: "1px solid " + C.border,
  background: C.s1, color: C.t2, fontSize: 12, fontWeight: 600, cursor: "pointer",
};
var btnPrimary = {
  padding: "8px 16px", borderRadius: 8, border: "none",
  background: C.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
};

export default function Deliverable({ data }) {
  if (!data) return null;

  var { initial_scan, rescan, rewritten_resume, cover_letter, interview_prep, company_research, salary_research } = data;

  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
        color: C.t3, marginBottom: 14,
      }}>Deliverables</div>

      {/* ── ATS Score ── */}
      {initial_scan && (
        <Section title="ATS Score">
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <ScoreRing score={initial_scan.score} size={110} />
              <div style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>Original</div>
            </div>
            {rescan && (
              <>
                <div style={{ fontSize: 24, color: C.t3 }}>→</div>
                <div style={{ textAlign: "center" }}>
                  <ScoreRing score={rescan.score} size={110} />
                  <div style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>Optimized</div>
                </div>
                <div style={{
                  fontSize: 28, fontWeight: 800, marginLeft: 8,
                  color: rescan.score > initial_scan.score ? C.green : C.red,
                }}>
                  {rescan.score > initial_scan.score ? "+" : ""}{rescan.score - initial_scan.score} pts
                </div>
              </>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.t2, marginTop: 12, lineHeight: 1.6 }}>
            {(rescan || initial_scan).verdict}
          </div>
        </Section>
      )}

      {/* ── Optimized Resume + PDF Export ── */}
      {rewritten_resume && (
        <Section title="Optimized Resume">
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>
              {rewritten_resume.bullets_modified} bullets modified
            </span>
            <span style={{ color: C.t4, margin: "0 8px" }}>·</span>
            <span style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>
              {rewritten_resume.keywords_added?.length || 0} keywords added
            </span>
          </div>
          {rewritten_resume.changes_made?.map(function (ch, i) {
            return (
              <div key={i} style={{ fontSize: 11, color: C.t2, padding: "4px 0", display: "flex", gap: 6 }}>
                <span style={{ color: C.green }}>✓</span> {ch}
              </div>
            );
          })}
          <pre style={{
            fontSize: 11, lineHeight: 1.6, color: C.t2, whiteSpace: "pre-wrap",
            padding: 14, background: C.s2, borderRadius: 8, marginTop: 10,
            maxHeight: 300, overflow: "auto", fontFamily: "'JetBrains Mono',monospace",
          }}>{rewritten_resume.rewritten_resume}</pre>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={function () {
              navigator.clipboard.writeText(rewritten_resume.rewritten_resume);
            }} style={btnOutline}>Copy Text</button>
            <button onClick={function () {
              downloadPdf(rewritten_resume.rewritten_resume, "Optimized Resume", "resume");
            }} style={btnPrimary}>Download PDF</button>
          </div>
        </Section>
      )}

      {/* ── Cover Letter + PDF Export ── */}
      {cover_letter && (
        <Section title="Cover Letter">
          <pre style={{
            fontSize: 12, lineHeight: 1.7, color: C.t1, whiteSpace: "pre-wrap",
            padding: 14, background: C.s2, borderRadius: 8,
            fontFamily: "'Inter',sans-serif",
          }}>{cover_letter.cover_letter}</pre>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={function () {
              navigator.clipboard.writeText(cover_letter.cover_letter);
            }} style={btnOutline}>Copy Text</button>
            <button onClick={function () {
              downloadPdf(cover_letter.cover_letter, "Cover Letter", "cover-letter");
            }} style={btnPrimary}>Download PDF</button>
          </div>
        </Section>
      )}

      {/* ── Interview Prep ── */}
      {interview_prep && (
        <Section title="Interview Preparation">
          {["behavioral", "technical", "situational"].map(function (cat) {
            if (!interview_prep[cat]?.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: C.accent,
                  textTransform: "capitalize", marginBottom: 8,
                }}>{cat} Questions</div>
                {interview_prep[cat].map(function (q, i) {
                  return (
                    <div key={i} style={{
                      padding: "10px 12px", background: C.s2, borderRadius: 8,
                      marginBottom: 6, border: "1px solid " + C.border,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{q.question}</div>
                      <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.6 }}>{q.suggested_answer}</div>
                      {q.tip && <div style={{ fontSize: 10, color: C.amber, marginTop: 6 }}>💡 {q.tip}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {interview_prep.questions_to_ask?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 8 }}>Questions to Ask Them</div>
              {interview_prep.questions_to_ask.map(function (q, i) {
                return (
                  <div key={i} style={{ fontSize: 12, color: C.t2, padding: "4px 0", display: "flex", gap: 6 }}>
                    <span style={{ color: C.green }}>→</span> {q}
                  </div>
                );
              })}
            </div>
          )}
          {interview_prep.red_flags?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.red, marginBottom: 8 }}>Watch Out For</div>
              {interview_prep.red_flags.map(function (r, i) {
                return (
                  <div key={i} style={{ fontSize: 12, color: C.t2, padding: "4px 0", display: "flex", gap: 6 }}>
                    <span style={{ color: C.red }}>⚠</span> {r}
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      )}

      {/* ── Company Research ── */}
      {company_research && (
        <Section title={"Company Brief — " + company_research.company}>
          <div style={{ fontSize: 12, color: C.t1, lineHeight: 1.6, marginBottom: 10 }}>{company_research.overview}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {company_research.industry && (
              <div style={{ fontSize: 11, color: C.t3 }}>Industry: <span style={{ color: C.t1 }}>{company_research.industry}</span></div>
            )}
            {company_research.size && (
              <div style={{ fontSize: 11, color: C.t3 }}>Size: <span style={{ color: C.t1 }}>{company_research.size}</span></div>
            )}
            {company_research.headquarters && (
              <div style={{ fontSize: 11, color: C.t3 }}>HQ: <span style={{ color: C.t1 }}>{company_research.headquarters}</span></div>
            )}
          </div>
          {company_research.interview_tips?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 6 }}>Interview Tips</div>
              {company_research.interview_tips.map(function (t, i) {
                return <div key={i} style={{ fontSize: 11, color: C.t2, padding: "3px 0" }}>→ {t}</div>;
              })}
            </div>
          )}
        </Section>
      )}

      {/* ── Job Search Results ── */}
      {data.job_search && (
        <Section title="Job Openings Found">
          <div style={{ fontSize: 12, color: C.t2, marginBottom: 12, lineHeight: 1.6 }}>
            {data.job_search.search_summary}
          </div>
          {data.job_search.jobs?.map(function (job, i) {
            return (
              <div key={i} style={{
                padding: "12px 14px", background: C.s2, borderRadius: 8,
                marginBottom: 6, border: "1px solid " + C.border,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{job.title}</div>
                    <div style={{ fontSize: 12, color: C.t2, marginTop: 2 }}>{job.company} · {job.location}</div>
                  </div>
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" style={{
                      padding: "4px 12px", borderRadius: 6, border: "1px solid " + C.border,
                      background: C.s1, color: C.accent, fontSize: 11, fontWeight: 600,
                      textDecoration: "none", flexShrink: 0,
                    }}>View</a>
                  )}
                </div>
                <div style={{ fontSize: 11, color: C.t3, marginTop: 6 }}>{job.match_reason || job.why_apply}</div>
              </div>
            );
          })}
          {data.job_search.suggested_search_terms?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 6 }}>Search Terms to Try</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {data.job_search.suggested_search_terms.map(function (t, i) {
                  return (
                    <span key={i} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11,
                      background: C.accentDim, color: C.accent, fontWeight: 500,
                      border: "1px solid " + C.accent + "20",
                    }}>{t}</span>
                  );
                })}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ── Salary Research ── */}
      {salary_research && (
        <Section title="Salary Range">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.t3 }}>Low</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.red }}>
                ${salary_research.salary_low?.toLocaleString()}
              </div>
            </div>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "linear-gradient(90deg, " + C.red + ", " + C.amber + ", " + C.green + ")" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.t3 }}>Mid</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.amber }}>
                ${salary_research.salary_mid?.toLocaleString()}
              </div>
            </div>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "linear-gradient(90deg, " + C.amber + ", " + C.green + ")" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.t3 }}>High</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>
                ${salary_research.salary_high?.toLocaleString()}
              </div>
            </div>
          </div>
          {salary_research.negotiation_tips?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 6 }}>Negotiation Tips</div>
              {salary_research.negotiation_tips.map(function (t, i) {
                return <div key={i} style={{ fontSize: 11, color: C.t2, padding: "3px 0" }}>→ {t}</div>;
              })}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}