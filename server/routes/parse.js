import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { extractText } from "../services/pdfParser.js";

const router = Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let text;

    if (req.file.mimetype === "application/pdf") {
      text = await extractText(req.file.buffer);
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    if (!text.trim()) {
      return res.status(422).json({ error: "Could not extract text from file" });
    }

    res.json({
      text: text.trim(),
      filename: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    console.error("Parse error:", err);
    res.status(500).json({ error: "Failed to parse file" });
  }
});

export default router;