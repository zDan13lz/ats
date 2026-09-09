import { C } from "../styles/tokens";

function Tag({ children, color, bg }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 9px", borderRadius: 6,
      fontSize: 11, fontWeight: 600, color, background: bg, margin: "2px 3px 2px 0",
    }}>{children}</span>
  );
}

export default function KeywordTags({ matched, missing, partial }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>
          Matched
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {matched?.map((m, i) => (
            <Tag key={i} color={C.green} bg={C.greenDim}>
              {(typeof m === "object" && m.weight === "high") ? "★ " : ""}
              {typeof m === "string" ? m : m.term}
            </Tag>
          ))}
        </div>
      </div>

      <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>
          Missing
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {missing?.map((m, i) => (
            <Tag key={i} color={C.red} bg={C.redDim}>
              {(typeof m === "object" && m.weight === "high") ? "⚠ " : ""}
              {typeof m === "string" ? m : m.term}
            </Tag>
          ))}
        </div>
        {missing?.filter((m) => typeof m === "object" && m.fix).map((m, i) => (
          <div key={`f${i}`} style={{ fontSize: 11, color: C.t3, padding: "4px 0 2px", marginTop: 4 }}>
            <span style={{ color: C.amber }}>→</span> <strong style={{ color: C.t2 }}>{m.term}:</strong> {m.fix}
          </div>
        ))}
      </div>

      {partial?.length > 0 && (
        <div style={{ gridColumn: "1/-1", background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>
            Partial Matches — Bridge These
          </div>
          {partial.map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
              background: C.s2, borderRadius: 6, marginBottom: 4, fontSize: 12,
            }}>
              <span style={{ color: C.amber, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{p.has}</span>
              <span style={{ color: C.t4 }}>→</span>
              <span style={{ color: C.green, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{p.needs}</span>
              {p.tip && <span style={{ color: C.t3, marginLeft: "auto", fontSize: 11 }}>{p.tip}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}