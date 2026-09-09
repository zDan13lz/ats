// ══════════════════════════════════════
// Agent.jsx — Career Agent page
// Modes: Copilot (chat + sidebar), Autopilot (goal-based)
// Features: conversation history, clarification flow,
//           presets, custom goals, deliverables
// ══════════════════════════════════════

import { useState } from "react";
import { C } from "../styles/tokens";
import { useAgent } from "../hooks/useAgent";
import { useConversations } from "../hooks/useConversations";
import AgentStream from "../components/AgentStream";
import Deliverable from "../components/Deliverable";
import CopilotChat from "../components/CopilotChat";
import ConversationSidebar from "../components/ConversationSidebar";

export default function AgentPage({ resume }) {
  var _mode = useState("copilot");
  var mode = _mode[0], setMode = _mode[1];
  var _jd = useState("");
  var jdText = _jd[0], setJdText = _jd[1];
  var _goal = useState("");
  var goal = _goal[0], setGoal = _goal[1];
  var _clar = useState("");
  var clarAnswer = _clar[0], setClarAnswer = _clar[1];

  var agent = useAgent();
  var convos = useConversations();

  var resumeText = resume?.text || "";

  // ── Autopilot presets ──
  var presets = [
    { label: "Full Job Package", goal: "Prepare a complete application package: scan my resume, ask me about any experience gaps, optimize the resume based on my real experience, generate a cover letter, research the company, get salary data, and prepare interview questions." },
    { label: "Score & Optimize", goal: "Scan my resume against this job description. Ask me about any gaps before rewriting. Rescan after to verify improvement." },
    { label: "Interview Prep Only", goal: "Generate comprehensive interview preparation based on my resume and this job description." },
    { label: "Find Jobs For Me", goal: "Analyze my resume and search for current job openings that match my skills and experience. Include jobs in my area and remote options." },
    { label: "Research Only", goal: "Research the company mentioned in this job description and provide salary data for this role." },
  ];

  function handleRun(overrideGoal) {
    var g = overrideGoal || goal.trim();
    if (!g || !resumeText) return;
    agent.runAutopilot(g, resumeText, jdText);
  }

  function handleAnswer() {
    if (!clarAnswer.trim()) return;
    agent.answerClarification(clarAnswer.trim());
    setClarAnswer("");
  }

  // ── Shared styles ──
  var box = { background: C.s1, border: "1px solid " + C.border, borderRadius: 10, padding: 18 };
  var inputStyle = {
    width: "100%", background: C.s2, border: "1px solid " + C.border, borderRadius: 8,
    padding: "10px 14px", color: C.t1, fontSize: 12, outline: "none", boxSizing: "border-box",
  };

  // ══════════════════════════════════════
  // COPILOT MODE — full screen chat + sidebar
  // ══════════════════════════════════════
  if (mode === "copilot") {
    return (
      <div style={{ height: "calc(100vh - 52px)", display: "flex" }}>
        {/* ── Conversation sidebar ── */}
        <ConversationSidebar
          conversations={convos.conversations}
          activeId={convos.activeId}
          onSwitch={convos.switchTo}
          onNew={convos.createNew}
          onDelete={convos.deleteConversation}
        />

        {/* ── Main chat area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* ── Top bar with mode switcher ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 24px", borderBottom: "1px solid " + C.border, background: C.s1,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>Career Agent</div>
            <div style={{ display: "flex", gap: 2, background: C.s2, borderRadius: 8, padding: 2 }}>
              {[["autopilot", "Autopilot"], ["copilot", "Copilot"]].map(function (item) {
                return (
                  <button key={item[0]} onClick={function () { setMode(item[0]); }} style={{
                    padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                    fontSize: 11, fontWeight: 600,
                    background: mode === item[0] ? C.accent : "transparent",
                    color: mode === item[0] ? "#fff" : C.t3,
                  }}>{item[1]}</button>
                );
              })}
            </div>
          </div>

          {/* ── Chat or empty state ── */}
          {!resumeText ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.t1, marginBottom: 4 }}>No resume loaded</div>
                <div style={{ fontSize: 12, color: C.t3 }}>Upload your resume in the Resume tab first.</div>
              </div>
            </div>
          ) : (
            <CopilotChat
              resumeText={resumeText}
              jdText={jdText}
              conversation={convos.active}
              onUpdateMessages={function (msgs) { if (convos.activeId) convos.updateMessages(convos.activeId, msgs); }}
            />
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════
  // AUTOPILOT MODE — goal-based agent
  // ══════════════════════════════════════
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", letterSpacing: -0.3, color: C.t1 }}>Career Agent</h2>
          <p style={{ color: C.t3, margin: 0, fontSize: 12 }}>Set a goal. The agent works autonomously but asks before assuming.</p>
        </div>
        <div style={{ display: "flex", gap: 2, background: C.s2, borderRadius: 8, padding: 2 }}>
          {[["autopilot", "Autopilot"], ["copilot", "Copilot"]].map(function (item) {
            return (
              <button key={item[0]} onClick={function () { setMode(item[0]); }} style={{
                padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                background: mode === item[0] ? C.accent : "transparent",
                color: mode === item[0] ? "#fff" : C.t3,
              }}>{item[1]}</button>
            );
          })}
        </div>
      </div>

      {/* ── No resume state ── */}
      {!resumeText && (
        <div style={{ ...box, textAlign: "center", padding: "32px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.t1, marginBottom: 4 }}>No resume loaded</div>
          <div style={{ fontSize: 12, color: C.t3 }}>Go to the Resume tab and upload your resume first.</div>
        </div>
      )}

      {resumeText && (
        <>
          {/* ── Input state: JD + presets + custom goal ── */}
          {!agent.running && !agent.deliverables && !agent.clarification && (
            <>
              <div style={{ ...box, marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>Job Description</div>
                <textarea value={jdText} onChange={function (e) { setJdText(e.target.value); }} placeholder="Paste the job description here..."
                  style={Object.assign({}, inputStyle, { height: 160, lineHeight: 1.6, resize: "vertical", fontFamily: "'JetBrains Mono',monospace", padding: 14 })} />
              </div>
              <div style={{ ...box, marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>Quick Presets</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {presets.map(function (p) {
                    return (
                      <button key={p.label} onClick={function () { handleRun(p.goal); }} disabled={!jdText.trim() && !p.label.includes("Find")}
                        style={{
                          padding: "12px 14px", borderRadius: 8, border: "1px solid " + C.border,
                          background: C.accentDim, color: C.t1, fontSize: 12, fontWeight: 600,
                          cursor: "pointer", textAlign: "left",
                        }}>{p.label}</button>
                    );
                  })}
                </div>
              </div>
              <div style={{ ...box, marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>Custom Goal</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={goal} onChange={function (e) { setGoal(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") handleRun(); }}
                    placeholder="e.g. Rewrite my resume for a PM role and prep me for the interview"
                    style={Object.assign({}, inputStyle, { flex: 1 })} />
                  <button onClick={function () { handleRun(); }} disabled={!goal.trim()}
                    style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: !goal.trim() ? C.t4 : C.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Run Agent</button>
                </div>
              </div>
            </>
          )}

          {/* ── Running state: activity stream ── */}
          {(agent.running || agent.steps.length > 0) && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                {agent.running && (
                  <button onClick={agent.stop} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid " + C.red, background: C.redDim, color: C.red, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Stop Agent</button>
                )}
                {!agent.running && agent.deliverables && !agent.clarification && (
                  <button onClick={agent.reset} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid " + C.border, background: C.s1, color: C.t2, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>New Run</button>
                )}
              </div>
              <AgentStream steps={agent.steps} running={agent.running} />
            </div>
          )}

          {/* ── Clarification state: agent asking user ── */}
          {agent.clarification && (
            <div style={Object.assign({}, box, { marginBottom: 16, border: "1.5px solid " + C.accent, background: C.accentDim })}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Agent needs your input</div>
              <div style={{ fontSize: 13, color: C.t1, lineHeight: 1.6, marginBottom: 4 }}>{agent.clarification.question}</div>
              {agent.clarification.context && <div style={{ fontSize: 11, color: C.t3, marginBottom: 12 }}>{agent.clarification.context}</div>}
              <textarea value={clarAnswer} onChange={function (e) { setClarAnswer(e.target.value); }}
                onKeyDown={function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAnswer(); } }}
                placeholder="Type your answer here..."
                style={Object.assign({}, inputStyle, { height: 80, resize: "vertical", background: C.s1, lineHeight: 1.6 })} />
              <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleAnswer} disabled={!clarAnswer.trim()}
                  style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: !clarAnswer.trim() ? C.t4 : C.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Send Answer & Continue</button>
              </div>
            </div>
          )}

          {/* ── Error + deliverables ── */}
          {agent.error && <div style={{ padding: "10px 14px", background: C.redDim, borderRadius: 8, color: C.red, fontSize: 12, marginBottom: 16 }}>{agent.error}</div>}
          {agent.deliverables && <Deliverable data={agent.deliverables} />}
        </>
      )}
    </div>
  );
}