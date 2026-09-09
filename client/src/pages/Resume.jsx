import { C } from "../styles/tokens";
import DropZone from "../components/DropZone";
import FormatCheck from "../components/FormatCheck";
import { parseFile } from "../utils/api";
import { runFormatCheck } from "../utils/formatCheck";
import { useState } from "react";

export default function ResumePage({ resume, saveResume, clearResume }) {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [formatResult, setFormatResult] = useState(resume?.formatCheck || null);

  const handleFile = async (file) => {
    setParsing(true);
    setError(null);
    try {
      const data = await parseFile(file);
      const fmt = runFormatCheck(data.text);
      saveResume(data.text, data.filename, fmt);
      setFormatResult(fmt);
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleClear = () => {
    clearResume();
    setFormatResult(null);
  };

  // Run format check if resume exists but no result yet
  if (resume?.text && !formatResult) {
    const fmt = runFormatCheck(resume.text);
    setFormatResult(fmt);
  }

  const box = { background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 };

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", letterSpacing: -0.3 }}>My Resume</h2>
        <p style={{ color: C.t3, margin: 0, fontSize: 12 }}>Upload once, scan against any job. Format analysis runs locally.</p>
      </div>

      <div style={{ ...box, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>Resume File</div>
        <DropZone onFile={handleFile} hasFile={!!resume} fileName={resume?.filename || ""} loading={parsing} onClear={handleClear} />
        {error && <p style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{error}</p>}
      </div>

      {formatResult && (
        <div style={{ ...box, marginBottom: 16 }}>
          <FormatCheck result={formatResult} />
        </div>
      )}

      {resume?.text && (
        <div style={box}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>Resume Text Preview</div>
          <pre style={{
            fontSize: 11, lineHeight: 1.6, color: C.t2, whiteSpace: "pre-wrap", margin: 0,
            maxHeight: 300, overflow: "auto", fontFamily: "'JetBrains Mono',monospace",
            padding: 12, background: C.s2, borderRadius: 8,
          }}>{resume.text}</pre>
        </div>
      )}
    </>
  );
}