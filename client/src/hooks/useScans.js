import { useState, useEffect } from "react";
import * as storage from "../utils/storage";

export function useScans() {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    const saved = storage.get("scans");
    if (saved) setScans(saved);
  }, []);

  const addScan = (scan) => {
    const updated = [scan, ...scans].slice(0, 50);
    setScans(updated);
    storage.set("scans", updated);
    return updated;
  };

  const deleteScan = (id) => {
    const updated = scans.filter((s) => s.id !== id);
    setScans(updated);
    storage.set("scans", updated);
  };

  return { scans, addScan, deleteScan };
}