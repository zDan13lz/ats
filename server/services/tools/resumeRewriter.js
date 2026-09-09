import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function rewriteResume(resumeText, jdText, gaps, missingKeywords, userConfirmedExperience) {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `You are a resume optimization expert. Rewrite this resume to improve ATS compatibility with the target job.

CURRENT RESUME:
${resumeText}

TARGET JOB DESCRIPTION:
${jdText}

${gaps?.length ? `IDENTIFIED GAPS:\n${gaps.join("\n")}` : ""}
${missingKeywords?.length ? `MISSING KEYWORDS TO INCORPORATE WHERE TRUTHFUL:\n${missingKeywords.join(", ")}` : ""}
${userConfirmedExperience ? `USER'S CONFIRMED REAL EXPERIENCE (use ONLY this for additions):\n${userConfirmedExperience}` : ""}

CRITICAL RULES:
- NEVER invent experience, credentials, tools, or skills the candidate doesn't have.
- Only incorporate keywords where the candidate's REAL experience supports them.
- ${userConfirmedExperience ? "Use the confirmed experience above to strengthen bullets — but don't exaggerate." : "If no confirmed experience was provided, only reorder and rephrase existing content. Do NOT add new skills or experience."}
- For genuine gaps where the candidate lacks experience, reframe existing experience to highlight transferable skills.
- Rewrite the summary to target this role using only real qualifications.
- Use strong action verbs and quantify where the original does.
- Keep the same structure: contact info, summary, experience, education, certifications.

Return ONLY valid JSON:
{
  "rewritten_resume": "<full rewritten resume as plain text>",
  "changes_made": ["change 1", "change 2"],
  "keywords_added": ["kw1", "kw2"],
  "bullets_modified": <count>,
  "confidence": "<high|medium|low>",
  "gaps_not_addressed": ["gap that couldn't be addressed because candidate lacks experience"]
}`,
    }],
  });

  const raw = msg.content.map((b) => b.text || "").join("");
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}