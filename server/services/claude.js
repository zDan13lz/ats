import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert ATS resume analyst. You score resumes against job descriptions with precision. Return ONLY valid JSON — no markdown fences, no backticks, no preamble, no commentary. Nothing outside the JSON object.`;

function buildPrompt(resumeText, jdText) {
  return `Analyze this resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Return this exact JSON structure:
{
  "score": <0-100>,
  "verdict": "<one punchy sentence>",
  "job_title_guess": "<what role this JD is for, 3-5 words>",
  "categories": {
    "Keyword Match": <0-100>,
    "Experience Fit": <0-100>,
    "Skills Alignment": <0-100>,
    "Education": <0-100>,
    "ATS Formatting": <0-100>
  },
  "matched": [{"term":"keyword","weight":"high|medium|low"}],
  "missing": [{"term":"keyword","weight":"high|medium|low","fix":"how to add it"}],
  "partial": [{"has":"resume term","needs":"JD term","tip":"how to bridge"}],
  "strengths": ["strength 1","strength 2","strength 3"],
  "gaps": [{"issue":"description","severity":"high|medium|low","action":"specific fix"}],
  "rewrites": [{"original":"bullet text","rewrite":"improved version","added":["kw1","kw2"],"why":"reason"}],
  "quick_wins": ["tip 1","tip 2","tip 3"]
}`;
}

export async function analyzeScan(resumeText, jdText) {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(resumeText, jdText) }],
  });

  const raw = message.content
    .map((block) => block.text || "")
    .join("");

  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}