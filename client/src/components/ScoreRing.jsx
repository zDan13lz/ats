import { useState, useEffect } from "react";
import { sc, scLbl } from "../styles/tokens";

export default function ScoreRing({ score, size = 140 }) {
  const sw = 6;
  const r = (size - sw * 2) / 2 - 8;
  const circ = 2 * Math.PI * r;
  const [off, setOff] = useState(circ);
  const color = sc(score);

  useEffect(() => {
    const t = setTimeout(() => setOff(circ - (score / 100) * circ), 300);
    return () => clearTimeout(t);
  }, [score, circ]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw + 1}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 6px ${color}44)` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 38, fontWeight: 800, color, lineHeight: 1, letterSpacing: -1 }}>{score}</span>
        <span style={{
          fontSize: 9, color: "#4A5A78", marginTop: 4, letterSpacing: 2,
          textTransform: "uppercase", fontWeight: 700,
        }}>{scLbl(score)}</span>
      </div>
    </div>
  );
}