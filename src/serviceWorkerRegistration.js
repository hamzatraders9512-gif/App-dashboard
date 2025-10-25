export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.info("Service worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("Service worker registration failed:", err);
        });
    });
  }
}