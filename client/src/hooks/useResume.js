import { useState, useEffect } from "react";
import * as storage from "../utils/storage";

export function useResume() {
  const [resume, setResume] = useState(null);

  useEffect(() => {
    const saved = storage.get("resume");
    if (saved) setResume(saved);
  }, []);

  const saveResume = (text, filename, formatCheck) => {
    const obj = { text, filename, date: new Date().toISOString(), formatCheck };
    setResume(obj);
    storage.set("resume", obj);
  };

  const clearResume = () => {
    setResume(null);
    storage.remove("resume");
  };

  return { resume, saveResume, clearResume };
}