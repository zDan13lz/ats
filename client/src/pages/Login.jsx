// ══════════════════════════════════════
// Login.jsx — Simple login page
// Two-user auth, no server required
// ══════════════════════════════════════

import { useState } from "react";
import { C } from "../styles/tokens";

export default function Login({ onLogin }) {
  var _user = useState("");
  var username = _user[0], setUsername = _user[1];
  var _pass = useState("");
  var password = _pass[0], setPassword = _pass[1];
  var _err = useState("");
  var error = _err[0], setError = _err[1];

  function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    var result = onLogin(username, password);
    if (!result.success) setError(result.error);
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{
        width: 380, background: C.s1, border: "1px solid " + C.border,
        borderRadius: 16, padding: "40px 32px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: C.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 20, fontWeight: 800, color: "#fff",
          }}>A</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.t1, margin: "0 0 4px" }}>ATS System</h1>
          <p style={{ fontSize: 13, color: C.t3, margin: 0 }}>Sign in to your account</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.t3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
            Username
          </label>
          <input value={username} onChange={function (e) { setUsername(e.target.value); setError(""); }}
            onKeyDown={function (e) { if (e.key === "Enter") handleSubmit(); }}
            placeholder="Enter username"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              background: C.s2, border: "1.5px solid " + C.border,
              color: C.t1, fontSize: 14, outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={function (e) { e.target.style.borderColor = C.accent; }}
            onBlur={function (e) { e.target.style.borderColor = C.border; }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.t3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
            Password
          </label>
          <input type="password" value={password} onChange={function (e) { setPassword(e.target.value); setError(""); }}
            onKeyDown={function (e) { if (e.key === "Enter") handleSubmit(); }}
            placeholder="Enter password"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              background: C.s2, border: "1.5px solid " + C.border,
              color: C.t1, fontSize: 14, outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={function (e) { e.target.style.borderColor = C.accent; }}
            onBlur={function (e) { e.target.style.borderColor = C.border; }}
          />
        </div>

        {error && (
          <div style={{
            padding: "10px 14px", background: C.redDim, borderRadius: 8,
            color: C.red, fontSize: 12, marginBottom: 16, textAlign: "center",
          }}>{error}</div>
        )}

        <button onClick={handleSubmit}
          disabled={!username.trim() || !password.trim()}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
            background: (!username.trim() || !password.trim()) ? C.t4 : C.accent,
            color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
            transition: "background 0.15s",
          }}>Sign In</button>
      </div>
    </div>
  );
}