// ══════════════════════════════════════
// useAgent.js — Autopilot agent state management
// Handles: step tracking, deliverables, clarification
//          pause/resume via server-side sessionId
// ══════════════════════════════════════

import { useState, useRef, useCallback } from "react";
import { streamAgent } from "../utils/api";

export function useAgent() {
  // ── State ──
  var _steps = useState([]);
  var steps = _steps[0], setSteps = _steps[1];
  var _deliv = useState(null);
  var deliverables = _deliv[0], setDeliverables = _deliv[1];
  var _running = useState(false);
  var running = _running[0], setRunning = _running[1];
  var _error = useState(null);
  var error = _error[0], setError = _error[1];
  var _msgs = useState([]);
  var agentMessages = _msgs[0], setAgentMessages = _msgs[1];
  var _clar = useState(null);
  var clarification = _clar[0], setClarification = _clar[1];

  // ── Refs for continuation context ──
  var cancelRef = useRef(null);
  var goalRef = useRef("");
  var resumeRef = useRef("");
  var jdRef = useRef("");

  // ── Step helpers ──
  var addStep = useCallback(function (step) {
    setSteps(function (prev) { return prev.concat([Object.assign({}, step, { timestamp: Date.now() })]); });
  }, []);

  var updateLastStep = useCallback(function (update) {
    setSteps(function (prev) {
      var copy = prev.slice();
      if (copy.length > 0) copy[copy.length - 1] = Object.assign({}, copy[copy.length - 1], update);
      return copy;
    });
  }, []);

  // ── SSE event handler ──
  var handleEvent = useCallback(function (event) {
    switch (event.type) {
      case "thinking":
        addStep({ type: "thinking", message: event.message, status: "active" });
        break;
      case "tool_start":
        addStep({ type: "tool", tool: event.tool, summary: event.input_summary, status: "running" });
        break;
      case "tool_complete":
        updateLastStep({ status: "done", result: event.result_summary });
        break;
      case "tool_error":
        updateLastStep({ status: "error", result: event.message });
        break;
      case "agent_message":
        setAgentMessages(function (prev) { return prev.concat([event.message]); });
        addStep({ type: "message", message: event.message, status: "done" });
        break;
      case "clarification_needed":
        // Agent paused — store sessionId for resume
        addStep({ type: "clarification", message: event.question, status: "active" });
        setClarification({
          question: event.question,
          context: event.context || "",
          sessionId: event.sessionId,
        });
        setRunning(false);
        break;
      case "complete":
        setDeliverables(function (prev) { return Object.assign({}, prev, event.deliverables); });
        setRunning(false);
        break;
      case "error":
        setError(event.message);
        setRunning(false);
        break;
    }
  }, [addStep, updateLastStep]);

  // ── Start a new autopilot run ──
  var runAutopilot = useCallback(function (goal, resumeText, jdText) {
    setSteps([]);
    setDeliverables(null);
    setError(null);
    setAgentMessages([]);
    setClarification(null);
    setRunning(true);
    goalRef.current = goal;
    resumeRef.current = resumeText;
    jdRef.current = jdText;

    var cancel = streamAgent(goal, resumeText, jdText, handleEvent);
    cancelRef.current = cancel;
  }, [handleEvent]);

  // ── Resume after user answers a clarification ──
  var answerClarification = useCallback(function (answer) {
    if (!clarification) return;
    addStep({ type: "message", message: answer, status: "done" });
    setRunning(true);

    // Send sessionId + answer — server loads conversation state
    var continuation = {
      sessionId: clarification.sessionId,
      answer: answer,
    };

    setClarification(null);

    var cancel = streamAgent(
      goalRef.current, resumeRef.current, jdRef.current,
      handleEvent, continuation
    );
    cancelRef.current = cancel;
  }, [clarification, handleEvent, addStep]);

  // ── Controls ──
  var stop = useCallback(function () {
    if (cancelRef.current) cancelRef.current();
    setRunning(false);
  }, []);

  var reset = useCallback(function () {
    setSteps([]);
    setDeliverables(null);
    setError(null);
    setAgentMessages([]);
    setClarification(null);
    setRunning(false);
  }, []);

  return {
    steps: steps,
    deliverables: deliverables,
    running: running,
    error: error,
    agentMessages: agentMessages,
    clarification: clarification,
    runAutopilot: runAutopilot,
    answerClarification: answerClarification,
    stop: stop,
    reset: reset,
  };
}