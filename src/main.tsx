import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import ThemeWatcher from "./components/theme-watcher";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeWatcher>
      <App />
    </ThemeWatcher>
  </React.StrictMode>
);
