import { useState, useEffect } from "react";
import { C, sc } from "../styles/tokens";

export default function CategoryBar({ label, value }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(value), 100); }, [value]);

  return (
    <div style={{
      background: C.s2, borderRadius: 8, padding: "12px 10px",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: C.t3, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: sc(value) }}>{value}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: C.border, width: "100%" }}>
        <div style={{
          height: "100%", borderRadius: 2, background: sc(value),
          width: `${w}%`, transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}