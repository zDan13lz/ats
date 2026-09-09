import { useState } from "react";
import { C } from "../styles/tokens";

export default function RewriteCard({ rw }) {
  const [open, setOpen] = useState(false);

  return (
    <div onClick={() => setOpen(!open)} style={{
      background: C.s1, border: `1px solid ${open ? C.accent + "44" : C.border}`,
      borderRadius: 10, padding: 18, cursor: "pointer", transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: open ? 14 : 0 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>
          {rw.original?.slice(0, 70)}{rw.original?.length > 70 ? "…" : ""}
        </span>
        <span style={{
          color: C.t3, fontSize: 16, transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "rotate(0)",
        }}>⌄</span>
      </div>

      {open && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.red, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Original</div>
            <div style={{
              fontSize: 12, lineHeight: 1.6, padding: 12, background: C.redDim,
              borderRadius: 8, fontFamily: "'JetBrains Mono',monospace",
            }}>{rw.original}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Optimized</div>
            <div style={{
              fontSize: 12, lineHeight: 1.6, padding: 12, background: C.greenDim,
              borderRadius: 8, fontFamily: "'JetBrains Mono',monospace",
            }}>{rw.rewrite}</div>
          </div>
          {rw.added?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: C.t3, fontWeight: 600, alignSelf: "center", marginRight: 4 }}>ADDED:</span>
              {rw.added.map((kw, j) => (
                <span key={j} style={{
                  display: "inline-block", padding: "3px 9px", borderRadius: 6,
                  fontSize: 11, fontWeight: 600, color: C.green, background: C.greenDim,
                }}>{kw}</span>
              ))}
            </div>
          )}
          <div style={{ fontSize: 11, color: C.t3 }}>💡 {rw.why}</div>
        </div>
      )}
    </div>
  );
}