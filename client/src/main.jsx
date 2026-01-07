import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.jsx";
import "./styles/global.css";

window.__KC_BOOTED__ = true;

if (import.meta.env.DEV) {
  const showError = (message, stack) => {
    let panel = document.getElementById("runtime-error-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "runtime-error-panel";
      panel.style.position = "fixed";
      panel.style.inset = "12px";
      panel.style.background = "rgba(20, 20, 25, 0.92)";
      panel.style.color = "#fff";
      panel.style.padding = "16px";
      panel.style.borderRadius = "12px";
      panel.style.zIndex = "9999";
      panel.style.overflow = "auto";
      panel.style.fontFamily = "monospace";
      document.body.appendChild(panel);
    }
    panel.textContent = `${message}\n\n${stack || ""}`;
  };

  window.addEventListener("error", (event) => {
    showError(event.message || "Runtime error", event.error?.stack);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    showError(reason.message || "Unhandled promise rejection", reason.stack);
  });
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
