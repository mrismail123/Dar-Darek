// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';


import { GoogleOAuthProvider } from '@react-oauth/google'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from './Contexts/ThemeContext.jsx'

// import browse bar provider 
import { BrowseProvider } from './Contexts/BrowseContext.jsx';

// import token provider
import { TokenProvider } from './Contexts/TokenContext.jsx';
import "leaflet/dist/leaflet.css";



createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <GoogleOAuthProvider clientId="1053795619331-gldssns0qs9dol9j9rrfouf8ajkqkmj6.apps.googleusercontent.com">
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
