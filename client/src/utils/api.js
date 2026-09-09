// ══════════════════════════════════════
// api.js — Client API wrappers
// Endpoints: scan, parse, agent, chat, export
// ══════════════════════════════════════

// ── ATS Scanner ──
export async function scanResume(resumeText, jdText) {
  const res = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jdText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Scan failed");
  }
  return res.json();
}

// ── PDF Upload Parser ──
export async function parseFile(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/parse", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Parse failed");
  }
  return res.json();
}

// ── SSE Stream Reader ──
function readSSE(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try { onEvent(JSON.parse(line.slice(6))); } catch {}
        }
      }
    }
  })();
}

// ── Autopilot Agent Stream ──
export function streamAgent(goal, resumeText, jdText, onEvent, continuation) {
  const controller = new AbortController();
  fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal, resumeText, jdText, continuation }),
    signal: controller.signal,
  })
    .then((res) => readSSE(res, onEvent))
    .catch((err) => {
      if (err.name !== "AbortError") onEvent({ type: "error", message: err.message });
    });
  return () => controller.abort();
}

// ── Copilot Chat Stream ──
export function streamChat(message, resumeText, jdText, history, onEvent) {
  const controller = new AbortController();
  fetch("/api/agent/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, resumeText, jdText, history }),
    signal: controller.signal,
  })
    .then((res) => readSSE(res, onEvent))
    .catch((err) => {
      if (err.name !== "AbortError") onEvent({ type: "error", message: err.message });
    });
  return () => controller.abort();
}

// ── PDF Export & Download ──
export async function downloadPdf(text, title, type) {
  var endpoint = type === "cover-letter" ? "/api/export/cover-letter" : "/api/export/resume";
  var res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text, title: title }),
  });

  if (!res.ok) throw new Error("PDF export failed");

  var blob = await res.blob();
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = (title || "document").replace(/[^a-zA-Z0-9 ]/g, "") + ".pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}