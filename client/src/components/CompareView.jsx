import ScoreRing from "./ScoreRing";
import { C, sc } from "../styles/tokens";

export default function CompareView({ scanA, scanB }) {
  if (!scanA || !scanB) return null;

  return (
    <div style={{
      background: C.s1, border: `1px solid ${C.accent}33`,
      borderRadius: 10, padding: 18, marginBottom: 16,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 14 }}>
        Score Comparison
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {[scanA, scanB].map((s) => (
          <div key={s.id} style={{ textAlign: "center" }}>
            <ScoreRing score={s.score} size={100} />
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8 }}>{s.jobTitle}</div>
            <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>
              {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            {s.results?.categories && (
              <div style={{ marginTop: 12, textAlign: "left" }}>
                {Object.entries(s.results.categories).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: C.t3 }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: sc(v) }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}