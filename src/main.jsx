import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Dashboard from "./Dashboard.jsx";
import Login from "./Login.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import InstallPrompt from "./InstallPrompt.jsx";
import { registerServiceWorker } from "./serviceWorkerRegistration.js";

function App() {
  const [authed, setAuthed] = React.useState(Boolean(localStorage.getItem("token")));

  const handleLogin = (payload = "demo-token") => {
    // store a simple token to mark "logged in"
    localStorage.setItem("token", payload);
    setAuthed(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthed(false);
    // optional: force to top of page
    window.scrollTo(0, 0);
  };

  React.useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
      {/* Install prompt banner for PWA */}
      <InstallPrompt />
      {authed ? <Dashboard onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
    </ErrorBoundary>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);