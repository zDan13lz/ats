import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, sc, scBg, scLbl } from "../styles/tokens";
import ScoreRing from "../components/ScoreRing";
import CategoryBar from "../components/CategoryBar";
import KeywordTags from "../components/KeywordTags";
import RewriteCard from "../components/RewriteCard";

export default function Results({ scan, prevScore }) {
  const [tab, setTab] = useState("keywords");
  const navigate = useNavigate();

  if (!scan) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>No results yet</div>
        <button onClick={() => navigate("/")} style={{
          padding: "10px 20px", borderRadius: 8, border: "none", background: C.accent,
          color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>Go to Scanner</button>
      </div>
    );
  }

  const r = scan.results;
  const delta = prevScore !== null ? r.score - prevScore : null;
  const box = { background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 };

  const tabs = [["keywords", "Keywords"], ["analysis", "Analysis"], ["rewrites", "Rewrites"], ["quickwins", "Quick Wins"]];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: C.t3, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Results</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 0", letterSpacing: -0.3 }}>{scan.jobTitle}</h2>
        </div>
        <button onClick={() => navigate("/")} style={{
          padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
          background: "transparent", color: C.t2, fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>Scan Another Job</button>
      </div>

      {/* Score Hero */}
      <div style={{ ...box, display: "flex", alignItems: "center", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
        <ScoreRing score={r.score} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <span style={{
            display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600,
            color: sc(r.score), background: scBg(r.score), marginBottom: 8,
          }}>{scLbl(r.score)}</span>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{r.verdict}</div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.t2 }}>
            <span><span style={{ color: C.green, fontWeight: 700 }}>{r.matched?.length || 0}</span> matched</span>
            <span><span style={{ color: C.red, fontWeight: 700 }}>{r.missing?.length || 0}</span> missing</span>
            <span><span style={{ color: C.amber, fontWeight: 700 }}>{r.partial?.length || 0}</span> partial</span>
          </div>
          {delta !== null && delta !== 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: C.t3 }}>
              vs last scan: <span style={{ color: delta > 0 ? C.green : C.red, fontWeight: 700 }}>{delta > 0 ? "+" : ""}{delta} pts</span>
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div style={{ ...box, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>Category Breakdown</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
          {r.categories && Object.entries(r.categories).map(([k, v]) => (
            <CategoryBar key={k} label={k} value={v} />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 14, background: C.s1, borderRadius: 8, padding: 2, width: "fit-content", border: `1px solid ${C.border}` }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
            background: tab === id ? C.accent : "transparent", color: tab === id ? "#fff" : C.t3, transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      {tab === "keywords" && <KeywordTags matched={r.matched} missing={r.missing} partial={r.partial} />}

      {tab === "analysis" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={box}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>Strengths</div>
            {r.strengths?.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "10px 12px", background: C.greenDim, borderRadius: 8, marginBottom: 6 }}>
                <span style={{ color: C.green, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 12, lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={box}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>Gaps</div>
            {r.gaps?.map((g, i) => {
              const sev = typeof g === "object" ? g.severity : "medium";
              return (
                <div key={i} style={{ padding: "10px 12px", background: sev === "high" ? C.redDim : C.amberDim, borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, lineHeight: 1.5, flex: 1 }}>{typeof g === "string" ? g : g.issue}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: sev === "high" ? C.red : C.amber, textTransform: "uppercase" }}>{sev}</span>
                  </div>
                  {typeof g === "object" && g.action && <div style={{ fontSize: 11, color: C.t2, marginTop: 6 }}>→ {g.action}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "rewrites" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {r.rewrites?.map((rw, i) => <RewriteCard key={i} rw={rw} />)}
        </div>
      )}

      {tab === "quickwins" && (
        <div style={box}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>Do These First</div>
          {r.quick_wins?.map((tip, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
              background: C.accentDim, borderRadius: 8, marginBottom: 6,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, background: C.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0,
              }}>{i + 1}</div>
              <span style={{ fontSize: 12.5, lineHeight: 1.6, paddingTop: 1 }}>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}