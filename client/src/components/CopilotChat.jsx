// ══════════════════════════════════════
// CopilotChat.jsx — Full-screen chat interface
// Props: resumeText, jdText, conversation, onUpdateMessages
// Features: markdown rendering, streaming responses,
//           conversation persistence, suggestion chips
// ══════════════════════════════════════

import { useState, useRef, useEffect } from "react";
import { C } from "../styles/tokens";
import { streamChat } from "../utils/api";
import { renderMarkdown } from "../utils/markdown";

// ── Markdown styles for agent responses ──
var mdStyles = [
  ".md-bubble h2 { font-size: 17px; font-weight: 700; margin: 18px 0 8px; color: #1A1D26; }",
  ".md-bubble h2:first-child { margin-top: 0; }",
  ".md-bubble h3 { font-size: 15px; font-weight: 700; margin: 16px 0 6px; color: #1A1D26; }",
  ".md-bubble h4 { font-size: 14px; font-weight: 700; margin: 12px 0 4px; color: #1A1D26; }",
  ".md-bubble p { margin: 0 0 12px; line-height: 1.75; }",
  ".md-bubble p:last-child { margin-bottom: 0; }",
  ".md-bubble strong { font-weight: 700; color: #1A1D26; }",
  ".md-bubble em { font-style: italic; }",
  ".md-bubble .md-hr { border: none; border-top: 1px solid #E2E5EB; margin: 16px 0; }",
  ".md-bubble .md-code { background: #F1F3F7; border: 1px solid #E2E5EB; border-radius: 4px; padding: 2px 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px; }",
  ".md-bubble .md-link { color: #4F6EF7; text-decoration: none; font-weight: 500; border-bottom: 1px solid rgba(79,110,247,0.3); transition: border-color 0.15s; }",
  ".md-bubble .md-link:hover { border-color: #4F6EF7; }",
  ".md-bubble .md-ul, .md-bubble .md-ol-list { margin: 8px 0 12px; padding-left: 20px; }",
  ".md-bubble li { margin-bottom: 6px; line-height: 1.7; }",
  ".md-bubble li::marker { color: #4F6EF7; }",
].join("\n");

// ── Chat bubble component ──
function ChatBubble({ msg }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <div style={{
          maxWidth: 600, padding: "12px 18px", borderRadius: "18px 18px 4px 18px",
          fontSize: 14, lineHeight: 1.6, background: C.accent, color: "#fff",
        }}>{msg.text}</div>
      </div>
    );
  }

  if (msg.role === "error") {
    return (
      <div style={{ maxWidth: 720, marginBottom: 20 }}>
        <div style={{
          padding: "12px 18px", borderRadius: 12,
          fontSize: 13, background: C.redDim, color: C.red, border: "1px solid " + C.red + "20",
        }}>{msg.text}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 24, maxWidth: 720 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, background: C.accentDim,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, flexShrink: 0, marginTop: 2, border: "1px solid " + C.accent + "15",
        color: C.accent, fontWeight: 800,
      }}>A</div>
      <div
        className="md-bubble"
        style={{ flex: 1, fontSize: 14, color: C.t2, lineHeight: 1.75 }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
      />
    </div>
  );
}

// ── Main chat component ──
export default function CopilotChat({ resumeText, jdText, conversation, onUpdateMessages }) {
  var _msgs = useState(conversation?.messages || []);
  var messages = _msgs[0], setMessages = _msgs[1];
  var _input = useState("");
  var input = _input[0], setInput = _input[1];
  var _loading = useState(false);
  var loading = _loading[0], setLoading = _loading[1];
  var endRef = useRef();
  var inputRef = useRef();

  // Sync when switching conversations
  useEffect(function () {
    setMessages(conversation?.messages || []);
    setLoading(false);
  }, [conversation?.id]);

  // Persist messages to conversation store
  useEffect(function () {
    if (messages.length > 0) {
      var lastMsg = messages[messages.length - 1];
      if (!lastMsg.streaming) {
        onUpdateMessages(messages);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(function () {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(function () {
    inputRef.current?.focus();
  }, []);

  // ── Send message ──
  function send() {
    if (!input.trim() || loading) return;
    var userMsg = input.trim();
    setInput("");

    var newMessages = messages.concat([{ role: "user", text: userMsg }]);
    setMessages(newMessages);
    setLoading(true);

    var history = newMessages.map(function (m) {
      return { role: m.role === "user" ? "user" : "assistant", content: m.text };
    });

    streamChat(userMsg, resumeText, jdText, history, function (event) {
      if (event.type === "agent_message") {
        setMessages(function (prev) {
          var last = prev[prev.length - 1];
          if (last && last.role === "agent" && last.streaming) {
            var copy = prev.slice();
            copy[copy.length - 1] = { role: "agent", text: last.text + "\n\n" + event.message, streaming: true };
            return copy;
          }
          return prev.concat([{ role: "agent", text: event.message, streaming: true }]);
        });
      }
      if (event.type === "complete") {
        setMessages(function (prev) {
          var copy = prev.slice();
          if (copy.length > 0 && copy[copy.length - 1].role === "agent") {
            copy[copy.length - 1] = Object.assign({}, copy[copy.length - 1], { streaming: false });
          }
          return copy;
        });
        setLoading(false);
      }
      if (event.type === "error") {
        setMessages(function (prev) {
          return prev.concat([{ role: "error", text: event.message }]);
        });
        setLoading(false);
      }
    });
  }

  // ── Suggestion chips for empty state ──
  var suggestions = [
    "What jobs fit my experience?",
    "Find me open positions",
    "How can I strengthen my resume?",
    "What salary should I target?",
    "What are my biggest skill gaps?",
    "Prep me for a behavioral interview",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <style>{mdStyles}</style>

      {/* ── Messages area ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 0 100px" }}>

          {/* ── Empty state with suggestions ── */}
          {messages.length === 0 && (
            <div style={{ padding: "60px 0 40px" }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: C.accentDim,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px", border: "1px solid " + C.accent + "15",
                }}>
                  <span style={{ fontSize: 24, color: C.accent, fontWeight: 800 }}>A</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: C.t1, margin: "0 0 6px" }}>Career Agent</h2>
                <p style={{ fontSize: 14, color: C.t3, margin: 0 }}>Your resume is loaded. Ask me anything about your career.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, maxWidth: 560, margin: "0 auto" }}>
                {suggestions.map(function (s) {
                  return (
                    <button key={s} onClick={function () { setInput(s); setTimeout(function () { inputRef.current?.focus(); }, 50); }}
                      style={{
                        padding: "14px 14px", borderRadius: 10, border: "1px solid " + C.border,
                        background: C.s1, color: C.t2, fontSize: 12.5, fontWeight: 500,
                        cursor: "pointer", textAlign: "left", lineHeight: 1.5,
                        transition: "all 0.15s", boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                      }}
                      onMouseEnter={function (e) { e.target.style.borderColor = C.accent; e.target.style.boxShadow = "0 0 0 3px " + C.accentDim; }}
                      onMouseLeave={function (e) { e.target.style.borderColor = C.border; e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)"; }}
                    >{s}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Message list ── */}
          {messages.map(function (msg, i) { return <ChatBubble key={i} msg={msg} />; })}

          {/* ── Typing indicator ── */}
          {loading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, background: C.accentDim,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0, color: C.accent, fontWeight: 800,
                border: "1px solid " + C.accent + "15",
              }}>A</div>
              <div style={{ display: "flex", gap: 5, alignItems: "center", paddingTop: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.t4, animation: "dot1 1.4s infinite" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.t4, animation: "dot2 1.4s infinite" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.t4, animation: "dot3 1.4s infinite" }} />
              </div>
            </div>
          )}

          <div ref={endRef} />
          <style>{"@keyframes dot1{0%,80%,100%{opacity:.3}40%{opacity:1}} @keyframes dot2{0%,80%,100%{opacity:.3}50%{opacity:1}} @keyframes dot3{0%,80%,100%{opacity:.3}60%{opacity:1}}"}</style>
        </div>
      </div>

      {/* ── Input bar ── */}
      <div style={{ borderTop: "1px solid " + C.border, background: C.s1, padding: "16px 24px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 10 }}>
          <input ref={inputRef} value={input} onChange={function (e) { setInput(e.target.value); }}
            onKeyDown={function (e) { if (e.key === "Enter") send(); }}
            placeholder="Ask about jobs, salary, interview prep, resume improvements..."
            disabled={loading}
            style={{
              flex: 1, padding: "14px 20px", borderRadius: 12,
              background: C.bg, border: "1.5px solid " + C.border,
              color: C.t1, fontSize: 14, outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={function (e) { e.target.style.borderColor = C.accent; e.target.style.boxShadow = "0 0 0 3px " + C.accentDim; }}
            onBlur={function (e) { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
          />
          <button onClick={send} disabled={!input.trim() || loading} style={{
            padding: "14px 24px", borderRadius: 12, border: "none",
            background: (!input.trim() || loading) ? C.t4 : C.accent,
            color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
            transition: "background 0.15s",
          }}>Send</button>
        </div>
      </div>
    </div>
  );
}