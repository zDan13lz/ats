import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateCoverLetter(resumeText, jdText, companyName, tone) {
  const toneGuide = {
    formal: "Professional and polished. Traditional business tone.",
    conversational: "Warm and personable. Reads like a confident conversation, not a form letter.",
    confident: "Bold and direct. Leads with impact and doesn't hedge.",
  };

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: `Write a cover letter for this candidate applying to ${companyName || "this role"}.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

TONE: ${tone || "conversational"} — ${toneGuide[tone] || toneGuide.conversational}

Rules:
- Open with a hook, not "I am writing to apply for..."
- Connect the candidate's specific experience to the JD's requirements.
- Reference 2-3 concrete achievements from the resume that map to what the role needs.
- Keep it under 350 words.
- Close with a confident call to action.
- Do not invent experience or credentials.

Return ONLY valid JSON:
{
  "cover_letter": "<the full cover letter text>",
  "key_connections": ["resume point → JD requirement mapped"],
  "word_count": <number>
}`,
    }],
  });

  const raw = msg.content.map((b) => b.text || "").join("");
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}