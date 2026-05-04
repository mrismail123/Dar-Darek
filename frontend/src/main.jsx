import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import "leaflet/dist/leaflet.css";

import App from "./App.jsx";
import { ThemeProvider } from "./Contexts/ThemeContext.jsx";
import { BrowseProvider } from "./Contexts/BrowseContext.jsx";
import { TokenProvider } from "./Contexts/TokenContext.jsx";
import { GOOGLE_CLIENT_ID } from "./lib/api.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <TokenProvider>
            <BrowseProvider>
              <App />
            </BrowseProvider>
          </TokenProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
