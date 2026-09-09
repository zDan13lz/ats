import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function atsScan(resumeText, jdText) {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `You are an ATS analyst. Score this resume against the job description. Return ONLY valid JSON.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Return:
{
  "score": <0-100>,
  "verdict": "<one sentence>",
  "job_title_guess": "<3-5 words>",
  "categories": { "Keyword Match": <0-100>, "Experience Fit": <0-100>, "Skills Alignment": <0-100>, "Education": <0-100>, "ATS Formatting": <0-100> },
  "matched": [{"term":"kw","weight":"high|medium|low"}],
  "missing": [{"term":"kw","weight":"high|medium|low","fix":"how to add"}],
  "partial": [{"has":"resume term","needs":"JD term","tip":"bridge"}],
  "strengths": ["str1","str2","str3"],
  "gaps": [{"issue":"desc","severity":"high|medium|low","action":"fix"}],
  "rewrites": [{"original":"bullet","rewrite":"improved","added":["kw"],"why":"reason"}],
  "quick_wins": ["tip1","tip2","tip3"]
}`,
    }],
  });

  const raw = msg.content.map((b) => b.text || "").join("");
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}