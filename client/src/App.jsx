// ══════════════════════════════════════
// App.jsx — Root app component
// Auth gate: login required before any access
// Passes user to Nav for logout + display
// ══════════════════════════════════════

import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Scanner from "./pages/Scanner";
import Results from "./pages/Results";
import ResumePage from "./pages/Resume";
import History from "./pages/History";
import AgentPage from "./pages/Agent";
import Login from "./pages/Login";
import { useResume } from "./hooks/useResume";
import { useScans } from "./hooks/useScans";
import { useAuth } from "./hooks/useAuth";

function Layout({ children, fullWidth }) {
  if (fullWidth) return <>{children}</>;
  return <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>{children}</div>;
}

function AppRoutes({ resume, saveResume, clearResume, scans, addScan, deleteScan, activeResult, setActiveResult }) {
  var location = useLocation();
  var prevScore = scans.length > 1 ? scans[1].score : null;
  var isAgent = location.pathname === "/agent";

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
  var auth = useAuth();

  // Show loading while checking saved session
  if (auth.loading) return null;

  // Show login if not authenticated
  if (!auth.user) return <Login onLogin={auth.login} />;

  return <AuthenticatedApp user={auth.user} logout={auth.logout} />;
}

function AuthenticatedApp({ user, logout }) {
  var { resume, saveResume, clearResume } = useResume();
  var { scans, addScan, deleteScan } = useScans();
  var _active = useState(null);
  var activeResult = _active[0], setActiveResult = _active[1];

  return (
    <BrowserRouter>
      <Nav scanCount={scans.length} user={user} onLogout={logout} />
      <AppRoutes {...{ resume, saveResume, clearResume, scans, addScan, deleteScan, activeResult, setActiveResult }} />
    </BrowserRouter>
  );
}