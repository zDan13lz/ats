// ══════════════════════════════════════
// Nav.jsx — Top navigation bar
// Props: scanCount, user, onLogout
// Shows user name and logout button
// ══════════════════════════════════════

import { NavLink } from "react-router-dom";
import { C } from "../styles/tokens";

var links = [
  { to: "/", label: "Scanner", icon: "⊕" },
  { to: "/agent", label: "Agent", icon: "◆" },
  { to: "/resume", label: "Resume", icon: "◎" },
  { to: "/history", label: "History", icon: "☰" },
];

export default function Nav({ scanCount, user, onLogout }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 24px", borderBottom: "1px solid " + C.border, background: C.s1,
    }}>
      {/* ── Logo ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, background: C.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: "#fff",
        }}>A</div>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3, color: C.t1 }}>ATS System</span>
      </div>

      {/* ── Nav links ── */}
      <div style={{ display: "flex", gap: 2, background: C.s2, borderRadius: 8, padding: 2 }}>
        {links.map(function (link) {
          return (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} style={function (props) {
              return {
                padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                textDecoration: "none", transition: "all 0.15s",
                background: props.isActive ? C.accent : "transparent",
                color: props.isActive ? "#fff" : C.t3,
              };
            }}>
              <span style={{ fontSize: 11 }}>{link.icon}</span> {link.label}
              {link.label === "History" && scanCount > 0 && (
                <span style={{
                  fontSize: 10, background: "rgba(0,0,0,0.1)",
                  padding: "1px 6px", borderRadius: 10, marginLeft: 2,
                }}>{scanCount}</span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* ── User + logout ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && (
          <>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: C.accentDim,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: C.accent,
                border: "1px solid " + C.accent + "20",
              }}>{user.name.charAt(0)}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.t2 }}>{user.name}</span>
            </div>
            <button onClick={onLogout} style={{
              padding: "5px 12px", borderRadius: 6, border: "1px solid " + C.border,
              background: "transparent", color: C.t3, fontSize: 11,
              fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={function (e) { e.target.style.borderColor = C.red; e.target.style.color = C.red; }}
              onMouseLeave={function (e) { e.target.style.borderColor = C.border; e.target.style.color = C.t3; }}
            >Sign Out</button>
          </>
        )}
      </div>
    </div>
  );
}