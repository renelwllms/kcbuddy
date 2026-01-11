let installPromptEvent = null;
const installListeners = new Set();

function notifyInstallListeners() {
  const ready = Boolean(installPromptEvent);
  installListeners.forEach((listener) => listener(ready));
}

export function enableAppPwa() {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.location.pathname.startsWith("/app")) {
    return;
  }

  if (window.__KC_PWA_SETUP__) {
    return;
  }
  window.__KC_PWA_SETUP__ = true;

  const head = document.head;

  if (!document.querySelector("link[rel=\"manifest\"]")) {
    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "/manifest.webmanifest";
    head.appendChild(manifest);
  }

  if (!document.querySelector("meta[name=\"theme-color\"]")) {
    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#ff6f91";
    head.appendChild(theme);
  }

  if (!document.querySelector("link[rel=\"apple-touch-icon\"]")) {
    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.href = "/icons/kcbuddy-logo.png";
    head.appendChild(appleIcon);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { scope: "/app/" }).catch(() => {});
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPromptEvent = event;
    notifyInstallListeners();
  });

  window.addEventListener("appinstalled", () => {
    installPromptEvent = null;
    notifyInstallListeners();
  });
}

export function onInstallPromptReady(listener) {
  installListeners.add(listener);
  listener(Boolean(installPromptEvent));
  return () => {
    installListeners.delete(listener);
  };
}

export async function promptInstall() {
  if (!installPromptEvent) {
    return { outcome: "dismissed" };
  }

  const event = installPromptEvent;
  installPromptEvent = null;
  notifyInstallListeners();
  event.prompt();
  return event.userChoice;
}
