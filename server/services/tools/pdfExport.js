import PDFDocument from "pdfkit";

export function generatePdf(content, title) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text(title, { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke("#cccccc");
    doc.moveDown(0.5);

    // Body — split into paragraphs
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        doc.moveDown(0.3);
        continue;
      }

      // Detect section headers (ALL CAPS or short lines)
      if (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && trimmed.length > 2) {
        doc.moveDown(0.4);
        doc.fontSize(12).font("Helvetica-Bold").text(trimmed);
        doc.moveDown(0.2);
      } else if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        doc.fontSize(10).font("Helvetica").text(trimmed, { indent: 15 });
      } else {
        doc.fontSize(10).font("Helvetica").text(trimmed);
      }
    }

    doc.end();
  });
}