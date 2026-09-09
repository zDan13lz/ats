export const C = {
  bg: "#F8F9FB",
  s1: "#FFFFFF",
  s2: "#F1F3F7",
  s3: "#E8EBF0",
  border: "#E2E5EB",
  borderFocus: "#4F6EF7",
  accent: "#4F6EF7",
  accentDim: "rgba(79,110,247,0.08)",
  green: "#0D9668",
  greenDim: "rgba(13,150,104,0.07)",
  amber: "#C27A0E",
  amberDim: "rgba(194,122,14,0.07)",
  red: "#D63B3B",
  redDim: "rgba(214,59,59,0.07)",
  t1: "#1A1D26",
  t2: "#5A6178",
  t3: "#8C92A4",
  t4: "#B8BCC9",
};

export const sc = (v) => (v >= 80 ? C.green : v >= 60 ? C.amber : C.red);
export const scBg = (v) => (v >= 80 ? C.greenDim : v >= 60 ? C.amberDim : C.redDim);
export const scLbl = (v) =>
  v >= 85 ? "Excellent" : v >= 75 ? "Strong" : v >= 60 ? "Fair" : v >= 40 ? "Weak" : "Poor";