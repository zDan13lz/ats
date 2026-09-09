import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateInterviewPrep(resumeText, jdText) {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `Generate interview preparation for this candidate based on their resume and the target job.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Generate questions across three categories. For each question, provide a suggested answer that uses the STAR method (Situation, Task, Action, Result) pulling from the candidate's actual resume experience. Do not invent experience.

Return ONLY valid JSON:
{
  "role_title": "<the job title>",
  "behavioral": [
    {"question": "q", "suggested_answer": "STAR-based answer using resume experience", "tip": "coaching tip"}
  ],
  "technical": [
    {"question": "q", "suggested_answer": "answer", "tip": "tip"}
  ],
  "situational": [
    {"question": "q", "suggested_answer": "answer", "tip": "tip"}
  ],
  "questions_to_ask": ["smart question the candidate should ask the interviewer"],
  "red_flags": ["potential weakness the interviewer might probe based on resume gaps"]
}

Generate 4 behavioral, 3 technical, 3 situational, 3 questions to ask, and 2-3 red flags.`,
    }],
  });

  const raw = msg.content.map((b) => b.text || "").join("");
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}