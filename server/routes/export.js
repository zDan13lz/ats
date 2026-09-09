import { Router } from "express";
import { generatePdf } from "../services/tools/pdfExport.js";

var router = Router();

router.post("/resume", async function (req, res) {
  var text = req.body.text;
  var title = req.body.title || "Resume";

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }

  console.log("[Export] Generating PDF: " + title);

  try {
    var buffer = await generatePdf(text, title);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="' + title.replace(/[^a-zA-Z0-9 ]/g, "") + '.pdf"');
    res.send(buffer);
  } catch (err) {
    console.error("[Export] Error:", err.message);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

router.post("/cover-letter", async function (req, res) {
  var text = req.body.text;
  var title = req.body.title || "Cover Letter";

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    var buffer = await generatePdf(text, title);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="' + title.replace(/[^a-zA-Z0-9 ]/g, "") + '.pdf"');
    res.send(buffer);
  } catch (err) {
    console.error("[Export] Error:", err.message);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

export default router;