import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import { OrditoThemeProvider } from "./components/theme-provider";

import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OrditoThemeProvider>
      <App />
    </OrditoThemeProvider>
  </React.StrictMode>,
);
