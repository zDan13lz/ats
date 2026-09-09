import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../styles/tokens";
import DropZone from "../components/DropZone";
import { scanResume, parseFile } from "../utils/api";

export default function Scanner({ resume, saveResume, addScan, setActiveResult }) {
  const [resumeText, setResumeText] = useState(resume?.text || "");
  const [resumeFile, setResumeFile] = useState(resume?.filename || "");
  const [jdText, setJdText] = useState("");
  const [jdLabel, setJdLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const phases = ["Parsing resume structure", "Extracting JD requirements", "Matching keywords", "Scoring alignment", "Generating optimizations"];

  const handleFile = async (file) => {
    setParsing(true);
    setError(null);
    try {
      const data = await parseFile(file);
      setResumeText(data.text);
      setResumeFile(data.filename);
      saveResume(data.text, data.filename, null);
    } catch (err) {
      setError(err.message || "Failed to parse file");
    } finally {
      setParsing(false);
    }
  };

  const handleScan = async () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    setLoading(true);
    setError(null);
    let pi = 0;
    setPhase(phases[0]);
    const interval = setInterval(() => {
      pi = Math.min(pi + 1, phases.length - 1);
      setPhase(phases[pi]);
    }, 2800);

    try {
      const results = await scanResume(resumeText, jdText);
      const scan = {
        id: Date.now(),
        date: new Date().toISOString(),
        jobTitle: jdLabel.trim() || results.job_title_guess || "Untitled Role",
        score: results.score,
        results,
      };
      addScan(scan);
      setActiveResult(scan);
      navigate("/results");
    } catch (err) {
      setError(err.message || "Scan failed");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", paddingTop: 100 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: C.accent, margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 2s ease infinite",
        }}>
          <span style={{ fontSize: 22 }}>⚡</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{phase}</div>
        <div style={{ fontSize: 12, color: C.t3 }}>Usually takes 10–20 seconds</div>
        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(.94)}}`}</style>
      </div>
    );
  }

  const box = { background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 };
  const input = {
    width: "100%", background: C.s2, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "10px 14px", color: C.t1, fontSize: 12, outline: "none", boxSizing: "border-box",
  };
  const ta = {
    ...input, height: 200, lineHeight: 1.6, resize: "vertical", fontFamily: "'JetBrains Mono',monospace",
    padding: 14,
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", letterSpacing: -0.3 }}>New Scan</h2>
        <p style={{ color: C.t3, margin: 0, fontSize: 12 }}>Upload your resume and paste a job description to get a full ATS report.</p>
      </div>

      <div style={{ ...box, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3 }}>Resume</div>
          {resume && !resumeText && (
            <button onClick={() => { setResumeText(resume.text); setResumeFile(resume.filename); }} style={{
              padding: "6px 14px", borderRadius: 8, border: "none", background: C.accent,
              color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>Use Saved Resume</button>
          )}
        </div>
        <DropZone onFile={handleFile} hasFile={!!resumeFile} fileName={resumeFile} loading={parsing}
          onClear={() => { setResumeFile(""); setResumeText(""); }} />
        {!resumeFile && (
          <>
            <div style={{ textAlign: "center", padding: "10px 0", color: C.t4, fontSize: 11, fontWeight: 600 }}>OR PASTE TEXT</div>
            <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste resume text here..." style={ta} />
            {resumeText.trim() && !resume && (
              <div style={{ marginTop: 8, textAlign: "right" }}>
                <button onClick={() => saveResume(resumeText, "Pasted Resume", null)} style={{
                  padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: "transparent", color: C.t2, fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>Save as My Resume</button>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ ...box, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.t3, marginBottom: 10 }}>Job Description</div>
        <input value={jdLabel} onChange={(e) => setJdLabel(e.target.value)} placeholder="Job title (optional — helps organize history)" style={{ ...input, marginBottom: 10 }} />
        <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the full job description here..." style={ta} />
      </div>

      <button onClick={handleScan} disabled={!resumeText.trim() || !jdText.trim()} style={{
        width: "100%", padding: "14px 0", borderRadius: 10, border: "none",
        background: (!resumeText.trim() || !jdText.trim()) ? C.t4 : C.accent,
        color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}>Run ATS Scan</button>
      {error && <p style={{ color: C.red, textAlign: "center", marginTop: 10, fontSize: 12 }}>{error}</p>}
    </>
  );
}