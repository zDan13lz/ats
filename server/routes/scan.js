import { Router } from "express";
import { analyzeScan } from "../services/claude.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { resumeText, jdText } = req.body;

    if (!resumeText?.trim() || !jdText?.trim()) {
      return res.status(400).json({ error: "Resume and job description are both required" });
    }

    const results = await analyzeScan(resumeText, jdText);

    res.json(results);
  } catch (err) {
    console.error("Scan error:", err);

    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: "AI returned invalid response — try again" });
    }

    res.status(500).json({ error: "Scan failed" });
  }
});

export default router;