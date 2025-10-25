import React from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent || "");
    const dismissed = localStorage.getItem("pwaInstallPromptDismissed");
    if (!isAndroid || dismissed) return;

    const onBefore = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    const onInstalled = () => {
      localStorage.setItem("pwaInstallPromptDismissed", "1");
      setVisible(false);
    };
    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    localStorage.setItem("pwaInstallPromptDismissed", "1");
    setVisible(false);
    setDeferredPrompt(null);
    console.info("PWA install result:", choice.outcome);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      left: 12,
      right: 12,
      bottom: 20,
      zIndex: 60,
      display: "flex",
      gap: 10,
      alignItems: "center",
      justifyContent: "space-between",
      background: "linear-gradient(90deg,#111,#0b0b0b)",
      padding: "12px 14px",
      borderRadius: 14,
      boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
      color: "#fff"
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <img src="/icons/icon-192.png" alt="app" style={{ width: 44, height: 44, borderRadius: 10 }} />
        <div style={{ fontSize: 14 }}>
          <div style={{ fontWeight: 700 }}>Install Get Rich with Hamza</div>
          <div style={{ fontSize: 12, color: "#bbb" }}>Install the app for a better mobile experience</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { localStorage.setItem("pwaInstallPromptDismissed","1"); setVisible(false); }} style={{ background: "transparent", color: "#ccc", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 12px", borderRadius: 10 }}>
          Dismiss
        </button>
        <button onClick={handleInstall} style={{ background: "#06b6d4", color: "#000", padding: "8px 12px", borderRadius: 10, fontWeight: 700 }}>
          Install
        </button>
      </div>
    </div>
  );
}