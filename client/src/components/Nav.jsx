import { NavLink } from "react-router-dom";
import { C } from "../styles/tokens";

const links = [
  { to: "/", label: "Scanner", icon: "⊕" },
  { to: "/agent", label: "Agent", icon: "◆" },
  { to: "/resume", label: "Resume", icon: "◎" },
  { to: "/history", label: "History", icon: "☰" },
];

export default function Nav({ scanCount }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 24px", borderBottom: `1px solid ${C.border}`, background: C.s1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, background: C.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: "#fff",
        }}>A</div>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3, color: C.t1 }}>ATS System</span>
      </div>
      <div style={{ display: "flex", gap: 2, background: C.s2, borderRadius: 8, padding: 2 }}>
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === "/"} style={({ isActive }) => ({
            padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
            textDecoration: "none", transition: "all 0.15s",
            background: isActive ? C.accent : "transparent",
            color: isActive ? "#fff" : C.t3,
          })}>
            <span style={{ fontSize: 11 }}>{icon}</span> {label}
            {label === "History" && scanCount > 0 && (
              <span style={{
                fontSize: 10, background: "rgba(0,0,0,0.1)",
                padding: "1px 6px", borderRadius: 10, marginLeft: 2,
              }}>{scanCount}</span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}