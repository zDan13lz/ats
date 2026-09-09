import { C, sc } from "../styles/tokens";

export default function FormatCheck({ result }) {
  if (!result) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3 }}>
          ATS Format Analysis
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: sc(result.score) }}>{result.score}</span>
          <span style={{ fontSize: 11, color: C.t3 }}>/ 100</span>
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.t3, marginBottom: 12 }}>
        {result.passCount} of {result.total} checks passed
      </div>
      {result.checks.map((ch, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
          background: ch.pass ? C.greenDim : C.redDim, borderRadius: 8, marginBottom: 4,
        }}>
          <span style={{ color: ch.pass ? C.green : C.red, fontSize: 13, flexShrink: 0, marginTop: 1 }}>
            {ch.pass ? "✓" : "✕"}
          </span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{ch.name}</div>
            <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{ch.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}