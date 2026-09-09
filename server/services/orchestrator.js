// ══════════════════════════════════════
// orchestrator.js — Agent brain
// Agentic loop with tool_use, clarification via ask_user,
// server-side session storage for pause/resume
// Tools: scan, rewrite, cover letter, interview, research,
//        salary, scrape, job search
// ══════════════════════════════════════

import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { atsScan } from "./tools/atsScan.js";
import { rewriteResume } from "./tools/resumeRewriter.js";
import { generateCoverLetter } from "./tools/coverLetter.js";
import { generateInterviewPrep } from "./tools/interviewPrep.js";
import { researchCompany } from "./tools/companyResearch.js";
import { researchSalary } from "./tools/salaryResearch.js";
import { scrapeJobUrl } from "./tools/jdScraper.js";
import { findJobs } from "./tools/jobSearch.js";
import { saveSession, getSession, deleteSession } from "./sessionStore.js";


var client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Tool definitions for Claude ──
var TOOLS = [
  {
    name: "scan_resume",
    description: "Score a resume against a job description for ATS compatibility. Returns score, matched/missing keywords, gaps, and suggestions. Always use this FIRST when a JD is provided.",
    input_schema: {
      type: "object",
      properties: {
        resume_text: { type: "string" },
        jd_text: { type: "string" },
      },
      required: ["resume_text", "jd_text"],
    },
  },
  {
    name: "ask_user",
    description: "Ask the user a question to get information you need before proceeding. Use this BEFORE rewriting the resume when you find gaps. Ask about their real experience related to the missing skills. NEVER invent or assume experience — always ask first.",
    input_schema: {
      type: "object",
      properties: {
        question: { type: "string", description: "The question to ask the user." },
        context: { type: "string", description: "Why you're asking." },
      },
      required: ["question"],
    },
  },
  {
    name: "rewrite_resume",
    description: "Rewrite the resume optimized for the job description. ONLY call this AFTER you have asked the user about their real experience. Never invent credentials.",
    input_schema: {
      type: "object",
      properties: {
        resume_text: { type: "string" },
        jd_text: { type: "string" },
        gaps: { type: "array", items: { type: "string" } },
        missing_keywords: { type: "array", items: { type: "string" } },
        user_confirmed_experience: { type: "string" },
      },
      required: ["resume_text", "jd_text"],
    },
  },
  {
    name: "generate_cover_letter",
    description: "Generate a targeted cover letter.",
    input_schema: {
      type: "object",
      properties: {
        resume_text: { type: "string" },
        jd_text: { type: "string" },
        company_name: { type: "string" },
        tone: { type: "string", enum: ["formal", "conversational", "confident"] },
      },
      required: ["resume_text", "jd_text"],
    },
  },
  {
    name: "generate_interview_prep",
    description: "Generate interview questions with suggested answers based on the candidate's actual experience.",
    input_schema: {
      type: "object",
      properties: {
        resume_text: { type: "string" },
        jd_text: { type: "string" },
      },
      required: ["resume_text", "jd_text"],
    },
  },
  {
    name: "research_company",
    description: "Research a company via web search.",
    input_schema: {
      type: "object",
      properties: { company_name: { type: "string" } },
      required: ["company_name"],
    },
  },
  {
    name: "research_salary",
    description: "Research salary ranges for a job title and location.",
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
    name: "scrape_job_url",
    description: "Fetch a job posting URL and extract the job description text.",
    input_schema: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"],
    },
  },
  {
    name: "find_jobs",
    description: "Search the web for current job postings that match the candidate's resume. Use when the user asks to find jobs or explore opportunities.",
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
];

// ── System prompt ──
var SYSTEM = [
  "You are a career agent that helps candidates prepare for job applications.",
  "You have tools to scan resumes, rewrite them, generate cover letters, prep for interviews, research companies and salaries, and search for job openings.",
  "",
  "CRITICAL RULES:",
  "1. NEVER invent, fabricate, or assume experience the candidate doesn't have. If the scan reveals gaps, use ask_user to ask about their real experience before rewriting.",
  "2. When you find missing keywords or skills gaps, ask specific questions about their real experience.",
  "3. Only after the user confirms what they have should you proceed with rewriting.",
  "4. When rewriting, only incorporate confirmed experience. For genuine gaps, reframe existing experience as transferable skills.",
  "5. Always scan the resume first when a JD is provided.",
  "6. After rewriting, rescan to verify improvement.",
  "7. When finding jobs, extract the candidate's key skills and likely job titles from their resume and search broadly.",
  "8. Be conversational and helpful. Explain what you're doing and why.",
  "",
  "You are thorough but honest. The user's trust matters more than a high score.",
].join("\n");

// ── Tool executor ──
function executeTool(name, input) {
  switch (name) {
    case "scan_resume": return atsScan(input.resume_text, input.jd_text);
    case "rewrite_resume": return rewriteResume(input.resume_text, input.jd_text, input.gaps, input.missing_keywords, input.user_confirmed_experience);
    case "generate_cover_letter": return generateCoverLetter(input.resume_text, input.jd_text, input.company_name, input.tone);
    case "generate_interview_prep": return generateInterviewPrep(input.resume_text, input.jd_text);
    case "research_company": return researchCompany(input.company_name);
    case "research_salary": return researchSalary(input.job_title, input.location);
    case "scrape_job_url": return scrapeJobUrl(input.url);
    case "find_jobs": return findJobs(input.skills, input.job_titles, input.location, input.preferences);
    default: return Promise.reject(new Error("Unknown tool: " + name));
  }
}

// ══════════════════════════════════════
// MAIN AGENT LOOP
// continuation.sessionId — resume from ask_user pause
// continuation.answer — user's response to the question
// ══════════════════════════════════════
export async function runAgent(goal, resumeText, jdText, onEvent, continuation) {
  var deliverables = {};
  var messages;

  // ── Resume from a paused session (user answered a clarification) ──
  if (continuation && continuation.sessionId) {
    var session = getSession(continuation.sessionId);
    if (!session) {
      onEvent({ type: "error", message: "Session expired. Please start a new run." });
      return {};
    }
    messages = session.messages;
    messages.push({
      role: "user",
      content: [{ type: "tool_result", tool_use_id: session.toolUseId, content: continuation.answer }],
    });
    Object.assign(deliverables, session.deliverables || {});
    deleteSession(continuation.sessionId);
    console.log("[Agent] Resuming from session " + continuation.sessionId);

  // ── Legacy fallback: messages passed directly ──
  } else if (continuation && continuation.messages) {
    messages = continuation.messages;
    messages.push({
      role: "user",
      content: [{ type: "tool_result", tool_use_id: continuation.toolUseId, content: continuation.answer }],
    });
    console.log("[Agent] Resuming (legacy)");

  // ── Fresh run ──
  } else {
    var content = "GOAL: " + goal + "\n\nCANDIDATE RESUME:\n" + resumeText;
    if (jdText) {
      content += "\n\nJOB DESCRIPTION:\n" + jdText;
    } else {
      content += "\n\nNo job description provided. If the user wants to find jobs, use find_jobs based on their resume. If they need a JD, ask or use scrape_job_url.";
    }
    content += "\n\nBegin.";
    messages = [{ role: "user", content: content }];
    console.log("[Agent] Starting new run | Goal: " + goal.slice(0, 80));
  }

  // ── Agent loop ──
  var MAX_ITERATIONS = 15;

  for (var i = 0; i < MAX_ITERATIONS; i++) {
    var model = "claude-sonnet-4-6";
    console.log("[Agent] Iteration " + (i + 1) + " | Model: " + model + " | Messages: " + messages.length);

    onEvent({
      type: "thinking",
      iteration: i + 1,
      message: i === 0 && !continuation ? "Agent is analyzing the goal..." : "Agent is deciding next step...",
    });

    var response;
    try {
      response = await client.messages.create({
        model: model,
        max_tokens: 4096,
        system: SYSTEM,
        tools: TOOLS,
        messages: messages,
      });
      console.log("[Agent] Response: stop_reason=" + response.stop_reason + " | blocks=" + response.content.length);
    } catch (err) {
      console.error("[Agent] API error: " + err.message);
      onEvent({ type: "error", message: "API error: " + err.message });
      break;
    }

    // ── Separate text and tool blocks ──
    var textBlocks = [];
    var toolBlocks = [];
    for (var b = 0; b < response.content.length; b++) {
      if (response.content[b].type === "text") textBlocks.push(response.content[b]);
      if (response.content[b].type === "tool_use") toolBlocks.push(response.content[b]);
    }

    // ── Send agent messages to client ──
    for (var t = 0; t < textBlocks.length; t++) {
      if (textBlocks[t].text.trim()) {
        console.log("[Agent] Message: " + textBlocks[t].text.trim().slice(0, 100));
        onEvent({ type: "agent_message", message: textBlocks[t].text.trim() });
      }
    }

    // ── No tools = agent is done ──
    if (toolBlocks.length === 0 || response.stop_reason === "end_turn") {
      console.log("[Agent] Complete | Deliverables: " + (Object.keys(deliverables).join(", ") || "none"));
      onEvent({ type: "complete", deliverables: deliverables });
      return deliverables;
    }

    messages.push({ role: "assistant", content: response.content });

    // ── Check for ask_user — pause and wait for user input ──
    var askTool = null;
    for (var a = 0; a < toolBlocks.length; a++) {
      if (toolBlocks[a].name === "ask_user") { askTool = toolBlocks[a]; break; }
    }

    if (askTool) {
      console.log("[Agent] Asking user: " + askTool.input.question.slice(0, 100));

      // Store state server-side so client only needs a session ID
      var sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      saveSession(sessionId, {
        messages: messages,
        deliverables: deliverables,
        toolUseId: askTool.id,
      });

      onEvent({
        type: "clarification_needed",
        question: askTool.input.question,
        context: askTool.input.context || "",
        sessionId: sessionId,
      });
      return { paused: true };
    }

    // ── Execute tools ──
    var toolResults = [];
    for (var j = 0; j < toolBlocks.length; j++) {
      var tool = toolBlocks[j];
      onEvent({ type: "tool_start", tool: tool.name, input_summary: summarizeInput(tool.name, tool.input) });
      console.log("[Agent] Running tool: " + tool.name);

      try {
        var result = await executeTool(tool.name, tool.input);

        // ── Store deliverables by type ──
        if (tool.name === "scan_resume") {
          if (!deliverables.initial_scan) deliverables.initial_scan = result;
          else deliverables.rescan = result;
        }
        if (tool.name === "rewrite_resume") deliverables.rewritten_resume = result;
        if (tool.name === "generate_cover_letter") deliverables.cover_letter = result;
        if (tool.name === "generate_interview_prep") deliverables.interview_prep = result;
        if (tool.name === "research_company") deliverables.company_research = result;
        if (tool.name === "research_salary") deliverables.salary_research = result;
        if (tool.name === "find_jobs") deliverables.job_search = result;

        var summary = summarizeResult(tool.name, result);
        console.log("[Agent] Tool complete: " + tool.name + " -> " + summary.slice(0, 100));
        onEvent({ type: "tool_complete", tool: tool.name, result_summary: summary });

        toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: JSON.stringify(result) });
      } catch (err) {
        console.error("[Agent] Tool error: " + tool.name + " -> " + err.message);
        onEvent({ type: "tool_error", tool: tool.name, message: err.message });
        toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: JSON.stringify({ error: err.message }), is_error: true });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  console.log("[Agent] Hit max iterations");
  onEvent({ type: "complete", deliverables: deliverables });
  return deliverables;
}

// ── Human-readable summaries for the activity stream ──
function summarizeInput(tool, input) {
  switch (tool) {
    case "scan_resume": return "Scanning resume against JD";
    case "rewrite_resume": return "Rewriting with " + (input.missing_keywords?.length || 0) + " target keywords";
    case "generate_cover_letter": return (input.tone || "conversational") + " tone" + (input.company_name ? " for " + input.company_name : "");
    case "generate_interview_prep": return "Building questions from JD + resume";
    case "research_company": return "Researching " + input.company_name;
    case "research_salary": return input.job_title + " in " + (input.location || "US");
    case "scrape_job_url": return "Fetching " + (input.url?.slice(0, 60) || "");
    case "find_jobs": return "Searching for " + (input.job_titles?.join(", ") || "") + " in " + (input.location || "US");
    default: return "";
  }
}

function summarizeResult(tool, result) {
  switch (tool) {
    case "scan_resume": return "Score: " + result.score + "/100 — " + result.verdict;
    case "rewrite_resume": return result.bullets_modified + " bullets modified, " + (result.keywords_added?.length || 0) + " keywords added";
    case "generate_cover_letter": return result.word_count + " words";
    case "generate_interview_prep": return ((result.behavioral?.length || 0) + (result.technical?.length || 0) + (result.situational?.length || 0)) + " questions generated";
    case "research_company": return result.overview?.slice(0, 100) || "Research complete";
    case "research_salary": return "$" + (result.salary_low?.toLocaleString() || "?") + " – $" + (result.salary_high?.toLocaleString() || "?");
    case "scrape_job_url": return "Extracted " + result.length + " chars";
    case "find_jobs": return "Found " + (result.jobs?.length || 0) + " matching jobs";
    default: return "Done";
  }
}