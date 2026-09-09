import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, sc, scBg } from "../styles/tokens";
import CompareView from "../components/CompareView";

export default function History({ scans, deleteScan, setActiveResult }) {
  const [comparing, setComparing] = useState([]);
  const navigate = useNavigate();

  const toggleCompare = (id) => {
    if (comparing.includes(id)) setComparing(comparing.filter((x) => x !== id));
    else if (comparing.length < 2) setComparing([...comparing, id]);
  };

  const viewScan = (scan) => {
    setActiveResult(scan);
    navigate("/results");
  };

  const box = { background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", letterSpacing: -0.3 }}>Scan History</h2>
          <p style={{ color: C.t3, margin: 0, fontSize: 12 }}>
            {scans.length === 0 ? "No scans yet." : `${scans.length} scan${scans.length !== 1 ? "s" : ""} — compare scores across roles`}
          </p>
        </div>
        {comparing.length > 0 && (
          <button onClick={() => setComparing([])} style={{
            padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "transparent", color: C.t2, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>Clear</button>
        )}
      </div>

      {scans.length === 0 && (
        <div style={{ ...box, textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>No scans yet</div>
          <button onClick={() => navigate("/")} style={{
            padding: "10px 20px", borderRadius: 8, border: "none", background: C.accent,
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Go to Scanner</button>
        </div>
      )}

      {comparing.length === 2 && (
        <CompareView scanA={scans.find((s) => s.id === comparing[0])} scanB={scans.find((s) => s.id === comparing[1])} />
      )}

      {scans.map((s) => (
        <div key={s.id} style={{
          ...box, marginBottom: 8, display: "flex", alignItems: "center", gap: 14,
          borderColor: comparing.includes(s.id) ? C.accent + "66" : C.border,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: scBg(s.score),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 800, color: sc(s.score), flexShrink: 0,
          }}>{s.score}</div>
          <div style={{ flex: 1, cursor: "pointer" }} onClick={() => viewScan(s)}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.jobTitle}</div>
            <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>
              {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => toggleCompare(s.id)} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: comparing.includes(s.id) ? C.accentDim : "transparent",
              border: `1px solid ${comparing.includes(s.id) ? C.accent : C.border}`,
              color: comparing.includes(s.id) ? C.accent : C.t3,
            }}>{comparing.includes(s.id) ? "Selected" : "Compare"}</button>
            <button onClick={() => viewScan(s)} style={{
              padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: "transparent", color: C.t2, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>View</button>
            <button onClick={() => deleteScan(s.id)} style={{
              padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.red}33`,
              background: "transparent", color: C.red, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>✕</button>
          </div>
        </div>
      ))}
    </>
  );
}