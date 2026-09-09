export function runFormatCheck(text) {
  const checks = [];
  const lines = text.split("\n").filter((l) => l.trim());

  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/.test(text);
  checks.push({ name: "Email detected", pass: hasEmail, note: hasEmail ? "Found email address" : "No email found — most ATS require this" });
  checks.push({ name: "Phone detected", pass: hasPhone, note: hasPhone ? "Found phone number" : "No phone found — add a contact number" });

  const sections = [
    { label: "Experience section", rx: /\b(experience|work history|employment|professional background)\b/i },
    { label: "Education section", rx: /\b(education|academic|degree|university|college)\b/i },
    { label: "Skills section", rx: /\b(skills|core competencies|technical skills|proficiencies)\b/i },
  ];
  sections.forEach(({ label, rx }) => {
    const found = rx.test(text);
    checks.push({ name: label, pass: found, note: found ? "Standard header found" : `Missing — ATS looks for standard section names` });
  });

  const dates = text.match(/\b(\d{1,2}\/\d{4}|\w+ \d{4}|\d{4}\s*[-–—]\s*(present|\d{4}|current))\b/gi) || [];
  checks.push({ name: "Parseable dates", pass: dates.length >= 2, note: dates.length >= 2 ? `Found ${dates.length} date entries` : "Use MM/YYYY or Month YYYY format" });

  const badChars = text.match(/[""''•◦▪►■●→←—–…]/g) || [];
  checks.push({ name: "No special characters", pass: badChars.length < 3, note: badChars.length < 3 ? "Clean character set" : `${badChars.length} special characters may break parsing` });

  const pipeLines = lines.filter((l) => (l.match(/\|/g) || []).length >= 2);
  checks.push({ name: "No table structures", pass: pipeLines.length < 2, note: pipeLines.length < 2 ? "No tables detected" : "Table structure detected — may scramble in ATS" });

  const wordCount = text.split(/\s+/).length;
  const lengthOk = wordCount >= 150 && wordCount <= 1200;
  checks.push({ name: "Appropriate length", pass: lengthOk, note: `${wordCount} words — ${wordCount < 150 ? "too short" : wordCount > 1200 ? "consider trimming" : "good range"}` });

  const capsLines = lines.filter((l) => l.length > 10 && l === l.toUpperCase());
  checks.push({ name: "Minimal ALL CAPS", pass: capsLines.length <= 3, note: capsLines.length <= 3 ? "Reasonable caps usage" : `${capsLines.length} all-caps lines may cause issues` });

  const bulletChars = new Set();
  lines.forEach((l) => { const m = l.match(/^\s*([•\-*►▪■●])/); if (m) bulletChars.add(m[1]); });
  checks.push({ name: "Consistent bullet style", pass: bulletChars.size <= 1, note: bulletChars.size <= 1 ? "Consistent formatting" : `${bulletChars.size} bullet styles — standardize to one` });

  const passCount = checks.filter((c) => c.pass).length;
  const score = Math.round((passCount / checks.length) * 100);
  return { checks, score, passCount, total: checks.length };
}