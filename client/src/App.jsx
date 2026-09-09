import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Scanner from "./pages/Scanner";
import Results from "./pages/Results";
import ResumePage from "./pages/Resume";
import History from "./pages/History";
import AgentPage from "./pages/Agent";
import { useResume } from "./hooks/useResume";
import { useScans } from "./hooks/useScans";

function Layout({ children, fullWidth }) {
  if (fullWidth) return <>{children}</>;
  return <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>{children}</div>;
}

function AppRoutes({ resume, saveResume, clearResume, scans, addScan, deleteScan, activeResult, setActiveResult }) {
  const location = useLocation();
  const prevScore = scans.length > 1 ? scans[1].score : null;
  const isAgent = location.pathname === "/agent";

  return (
    <Layout fullWidth={isAgent}>
      <Routes>
        <Route path="/" element={<Scanner resume={resume} saveResume={saveResume} addScan={addScan} setActiveResult={setActiveResult} />} />
        <Route path="/results" element={<Results scan={activeResult} prevScore={prevScore} />} />
        <Route path="/resume" element={<ResumePage resume={resume} saveResume={saveResume} clearResume={clearResume} />} />
        <Route path="/history" element={<History scans={scans} deleteScan={deleteScan} setActiveResult={setActiveResult} />} />
        <Route path="/agent" element={<AgentPage resume={resume} />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const { resume, saveResume, clearResume } = useResume();
  const { scans, addScan, deleteScan } = useScans();
  const [activeResult, setActiveResult] = useState(null);

  return (
    <BrowserRouter>
      <Nav scanCount={scans.length} />
      <AppRoutes {...{ resume, saveResume, clearResume, scans, addScan, deleteScan, activeResult, setActiveResult }} />
    </BrowserRouter>
  );
}