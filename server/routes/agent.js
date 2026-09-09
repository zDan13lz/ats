import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { runAgent } from "../services/orchestrator.js";
import { findJobs } from "../services/tools/jobSearch.js";
import { researchSalary } from "../services/tools/salaryResearch.js";
import { researchCompany } from "../services/tools/companyResearch.js";

dotenv.config({ path: "../.env" });

var router = Router();

// ── Safe SSE helpers ──
function send(res, data) {
  try { if (!res._done) res.write("data: " + JSON.stringify(data) + "\n\n"); }
  catch (e) { console.error("[SSE] Write error:", e.message); }
}

function finish(res) {
  try { if (!res._done) { res._done = true; res.end(); } }
  catch (e) {}
}

function setupSSE(res) {
  res._done = false;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  res.on("close", function () { res._done = true; });
}

// ── Detect if message needs real-time tools ──
function needsTools(msg) {
  var m = msg.toLowerCase();
  var triggers = [
    "find me jobs", "find jobs", "find me open", "find me positions",
    "find positions", "find openings", "search for jobs", "search jobs",
    "job openings", "job postings", "who is hiring", "what companies are hiring",
    "open positions", "current openings", "available jobs", "hiring near",
    "look up salary", "salary for", "salary range", "pay range",
    "how much does", "how much do", "what does a .* make", "what does a .* earn",
    "compensation for", "what should i be making", "what should i expect",
    "research company", "tell me about .* company", "what is .* like to work",
    "look up .* company", "glassdoor", "company culture at",
  ];
  for (var i = 0; i < triggers.length; i++) {
    try { if (new RegExp(triggers[i]).test(m)) return true; } catch (e) {}
  }
  return false;
}

// ── Tool definitions ──
var TOOLS = [
  {
    name: "find_jobs",
    description: "Search for real current job postings. Only use when user explicitly asks to find or search for job openings.",
    input_schema: {
      type: "object",
      properties: {
        skills: { type: "array", items: { type: "string" } },
        job_titles: { type: "array", items: { type: "string" } },
        location: { type: "string" },
        preferences: { type: "string" },
      },
      required: ["skills", "job_titles"],
    },
  },
  {
    name: "research_salary",
    description: "Search for real-time salary data. Only use when user explicitly asks for current salary numbers.",
    input_schema: {
      type: "object",
      properties: {
        job_title: { type: "string" },
        location: { type: "string" },
      },
      required: ["job_title"],
    },
  },
  {
    name: "research_company",
    description: "Research a specific company. Only use when user asks about a specific company.",
    input_schema: {
      type: "object",
      properties: { company_name: { type: "string" } },
      required: ["company_name"],
    },
  },
];

function runTool(name, input) {
  switch (name) {
    case "find_jobs": return findJobs(input.skills, input.job_titles, input.location, input.preferences);
    case "research_salary": return researchSalary(input.job_title, input.location);
    case "research_company": return researchCompany(input.company_name);
    default: return Promise.reject(new Error("Unknown tool: " + name));
  }
}

// ── System prompts ──
var SYSTEM_FAST = [
  "You are a career advisor. The user has uploaded their resume.",
  "Answer directly from their resume and your knowledge. Be specific, actionable, and reference their actual experience.",
  "Use markdown: ## headers, **bold**, bullet lists. Never use pipe tables.",
  "Keep responses focused and scannable. No filler.",
].join("\n");

var SYSTEM_TOOLS = [
  "You are a career advisor with real-time search tools. The user has uploaded their resume.",
  "",
  "TOOLS — use sparingly:",
  "- find_jobs: ONLY when user says find/search for actual job postings",
  "- research_salary: ONLY when user asks for specific current salary data",
  "- research_company: ONLY when user asks about a specific company",
  "",
  "For resume advice, job fit analysis, interview prep, skill gaps, career strategy: answer DIRECTLY. No tool needed.",
  "",
  "FORMAT job listings as:",
  "**Job Title** at **Company Name**",
  "Location | Salary if known",
  "[Apply here](url) if direct link available",
  "**Why you match:** one sentence",
  "**Skills match:** skill1, skill2",
  "**Gap:** missing skill or None",
  "",
  "Use ## headers. Bold for emphasis. Never pipe tables. Be specific. Reference their resume.",
].join("\n");

// ── Build conversation messages from history ──
function buildMessages(message, resumeText, jdText, history) {
  var messages = [];
  var context = "";
  if (resumeText) context += "MY RESUME:\n" + resumeText + "\n\n";
  if (jdText) context += "JOB DESCRIPTION:\n" + jdText + "\n\n";

  if (history && history.length > 0) {
    var didContext = false;
    for (var i = 0; i < history.length; i++) {
      var msg = history[i];
      if (!didContext && msg.role === "user") {
        messages.push({ role: "user", content: context + "QUESTION: " + msg.content });
        didContext = true;
      } else {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  } else {
    messages.push({ role: "user", content: context + "QUESTION: " + message });
  }

  return messages;
}

// ══════════════════════════════════════
// AUTOPILOT ROUTE
// ══════════════════════════════════════
router.post("/", async function (req, res) {
  var goal = req.body.goal;
  var resumeText = req.body.resumeText;
  var jdText = req.body.jdText;
  var continuation = req.body.continuation;

  if (!resumeText && !continuation) return res.status(400).json({ error: "Resume required" });
  if (!goal && !continuation) return res.status(400).json({ error: "Goal required" });

  setupSSE(res);

  try {
    await runAgent(goal, resumeText, jdText, function (data) { send(res, data); }, continuation || null);
  } catch (err) {
    console.error("[Agent] Error:", err.message || err);
    send(res, { type: "error", message: err.message || "Agent failed" });
  }

  finish(res);
});

// ══════════════════════════════════════
// CHAT ROUTE
// ══════════════════════════════════════
router.post("/chat", async function (req, res) {
  var message = req.body.message;
  var resumeText = req.body.resumeText || "";
  var jdText = req.body.jdText || "";
  var history = req.body.history;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  setupSSE(res);

  var useTools = needsTools(message);
  console.log("[Chat] " + message.slice(0, 80) + " | tools=" + useTools);

  var client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  var messages = buildMessages(message, resumeText, jdText, history);

  // ── FAST PATH: no tools, single API call ──
  if (!useTools) {
    try {
      var response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        system: SYSTEM_FAST,
        messages: messages,
      });

      var text = "";
      for (var i = 0; i < response.content.length; i++) {
        if (response.content[i].type === "text") text += response.content[i].text;
      }

      if (text.trim()) send(res, { type: "agent_message", message: text.trim() });
      send(res, { type: "complete", deliverables: {} });
    } catch (err) {
      console.error("[Chat] Error:", err.message);
      send(res, { type: "error", message: err.message || "Failed" });
    }

    finish(res);
    return;
  }

  // ── TOOL PATH: needs real-time data ──
  try {
    for (var turn = 0; turn < 4; turn++) {
      console.log("[Chat] Turn " + (turn + 1) + " | msgs=" + messages.length);

      var response;
      try {
        response = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 3000,
          system: SYSTEM_TOOLS,
          tools: TOOLS,
          messages: messages,
        });
      } catch (apiErr) {
        console.error("[Chat] API error:", apiErr.message);
        send(res, { type: "error", message: apiErr.message });
        break;
      }

      console.log("[Chat] stop=" + response.stop_reason + " blocks=" + response.content.length);

      var texts = [];
      var tools = [];
      for (var i = 0; i < response.content.length; i++) {
        if (response.content[i].type === "text") texts.push(response.content[i]);
        if (response.content[i].type === "tool_use") tools.push(response.content[i]);
      }

      // No tools or done — send final text
      if (tools.length === 0 || response.stop_reason === "end_turn") {
        var text = "";
        for (var i = 0; i < texts.length; i++) text += texts[i].text;
        if (text.trim()) send(res, { type: "agent_message", message: text.trim() });
        send(res, { type: "complete", deliverables: {} });
        break;
      }

      // Execute tools
      messages.push({ role: "assistant", content: response.content });

      var results = [];
      for (var i = 0; i < tools.length; i++) {
        console.log("[Chat] Tool: " + tools[i].name);
        send(res, { type: "tool_start", tool: tools[i].name, input_summary: "Searching..." });

        try {
          var result = await runTool(tools[i].name, tools[i].input);
          console.log("[Chat] Done: " + tools[i].name);
          results.push({ type: "tool_result", tool_use_id: tools[i].id, content: JSON.stringify(result) });
        } catch (toolErr) {
          console.error("[Chat] Tool fail: " + tools[i].name + " " + toolErr.message);
          results.push({ type: "tool_result", tool_use_id: tools[i].id, content: JSON.stringify({ error: toolErr.message }), is_error: true });
        }
      }

      messages.push({ role: "user", content: results });
    }
  } catch (err) {
    console.error("[Chat] Outer error:", err.message || err);
    send(res, { type: "error", message: err.message || "Chat failed" });
  }

  finish(res);
});

export default router;