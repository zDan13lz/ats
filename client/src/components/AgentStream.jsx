import { useEffect, useRef } from "react";
import StepCard from "./StepCard";
import { C } from "../styles/tokens";

export default function AgentStream({ steps, running }) {
  const endRef = useRef();
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [steps]);

  return (
    <div style={{
      background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "14px 18px", maxHeight: 500, overflowY: "auto",
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
        color: C.t3, marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
      }}>
        Agent Activity
        {running && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "blink 1s ease infinite" }} />}
      </div>
      {steps.length === 0 && !running && (
        <div style={{ fontSize: 12, color: C.t3, padding: "20px 0", textAlign: "center" }}>Agent is idle. Set a goal to start.</div>
      )}
      {steps.map((step, i) => <StepCard key={i} step={step} />)}
      <div ref={endRef} />
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}