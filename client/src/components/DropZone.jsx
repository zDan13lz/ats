import { useState, useRef } from "react";
import { C } from "../styles/tokens";

export default function DropZone({ onFile, hasFile, fileName, onClear, loading }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();
  const handle = (file) => { if (file) onFile(file); };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => !hasFile && !loading && inputRef.current?.click()}
      style={{
        border: `1.5px dashed ${drag ? C.accent : hasFile ? C.green : C.border}`,
        borderRadius: 10, padding: hasFile ? "14px 18px" : "36px 18px", textAlign: "center",
        cursor: hasFile || loading ? "default" : "pointer", transition: "all 0.2s",
        background: drag ? C.accentDim : hasFile ? C.greenDim : C.s2,
      }}>
      <input ref={inputRef} type="file" accept=".pdf,.txt" style={{ display: "none" }}
        onChange={(e) => handle(e.target.files[0])} />
      {loading ? (
        <div style={{ fontSize: 13, color: C.t2 }}>Parsing file...</div>
      ) : hasFile ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📄</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{fileName}</div>
              <div style={{ fontSize: 11, color: C.green }}>Parsed successfully</div>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} style={{
            padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.s1, color: C.t2, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>Replace</button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.t2, marginBottom: 4 }}>Drop a PDF or click to upload</div>
          <div style={{ fontSize: 11, color: C.t3 }}>PDF and TXT supported</div>
        </>
      )}
    </div>
  );
}