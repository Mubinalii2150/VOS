import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Upload from "./pages/Upload";

function Dashboard() {
  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-name">VOS</span>
          <span className="brand-code">SIH26147</span>
        </div>

        <nav className="navigation">
          <Link to="/" className="nav-link">
            Upload
          </Link>

          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <div className="eyebrow">
              SIGNAL INTELLIGENCE
            </div>

            <h1>Analysis Dashboard</h1>

            <p>
              Upload and analyze IQ or WAV signal captures.
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span className="card-label">
              SIGNAL
            </span>

            <strong>Waiting for signal</strong>

            <p>
              Upload a file to begin analysis.
            </p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">
              FFT
            </span>

            <strong>—</strong>

            <p>
              Frequency analysis unavailable.
            </p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">
              MODULATION
            </span>

            <strong>—</strong>

            <p>
              No modulation detected.
            </p>
          </div>

          <div className="dashboard-card">
            <span className="card-label">
              FEC
            </span>

            <strong>—</strong>

            <p>
              No FEC analysis available.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Upload />}
        />

        <Route
          path="/upload"
          element={<Upload />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;