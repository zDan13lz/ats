import { C } from "../styles/tokens";
import ToolBadge from "./ToolBadge";

export default function StepCard({ step }) {
  const statusColor = { active: C.accent, running: C.amber, done: C.green, error: C.red }[step.status] || C.t3;
  const statusIcon = { active: "◌", running: "⟳", done: "✓", error: "✕" }[step.status] || "·";

  return (
    <div style={{
      display: "flex", gap: 12, padding: "10px 0",
      borderBottom: `1px solid ${C.border}`,
      opacity: step.status === "done" ? 0.8 : 1,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, color: statusColor, marginTop: 2,
        background: statusColor === C.green ? C.greenDim : statusColor === C.red ? C.redDim : C.accentDim,
        animation: step.status === "running" ? "spin 1.5s linear infinite" : "none",
      }}>{statusIcon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {step.type === "thinking" && (
          <div style={{ fontSize: 12, color: C.t3, fontStyle: "italic" }}>{step.message}</div>
        )}
        {step.type === "tool" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ToolBadge tool={step.tool} />
              <span style={{ fontSize: 11, color: C.t3 }}>{step.summary}</span>
            </div>
            {step.result && (
              <div style={{
                fontSize: 11, color: step.status === "error" ? C.red : C.green,
                padding: "6px 10px", background: step.status === "error" ? C.redDim : C.greenDim,
                borderRadius: 6, marginTop: 4,
              }}>{step.result}</div>
            )}
          </>
        )}
        {step.type === "message" && (
          <div style={{ fontSize: 12, color: C.t1, lineHeight: 1.6 }}>{step.message}</div>
        )}
        {step.type === "clarification" && (
          <div style={{
            padding: "10px 14px", background: C.accentDim, borderRadius: 8,
            border: `1px solid ${C.accent}30`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 4 }}>Agent is asking you a question</div>
            <div style={{ fontSize: 12, color: C.t1, lineHeight: 1.6 }}>{step.message}</div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}