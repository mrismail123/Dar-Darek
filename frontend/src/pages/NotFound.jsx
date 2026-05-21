import React from "react";
import { Link } from "react-router-dom";
import { useThemeGlobal } from "../Contexts/ThemeContext";
import NotFoundIllustration from "../assets/not-found.png";
import Logo from "../assets/Logo.png"; // Assuming Logo.png is the brand logo
import "./NotFound.css";

export default function NotFound() {
  const themeGlobal = useThemeGlobal();

  return (
    <div className="not-found-page" style={{ background: themeGlobal.colors.background }}>
      <header className="not-found-header">
        <Link to="/">
          <img src={Logo} alt="Dar Darek Logo" className="not-found-logo" />
        </Link>
      </header>

      <main className="not-found-content">
        <div className="not-found-text-section">
          <h1 className="not-found-oops" style={{ color: themeGlobal.colors.primary }}>Oops!</h1>
          <h2 className="not-found-subtitle">We can't seem to find the page you're looking for.</h2>
          
          <p className="not-found-error-code">Error code: 404</p>
          
          <div className="not-found-links-container">
            <p className="not-found-links-title">Here are some helpful links instead:</p>
            <ul className="not-found-links-list">
              <li>
                <Link to="/" style={{ color: themeGlobal.colors.primary }}>Home</Link>
              </li>
              <li>
                <Link to="/search" style={{ color: themeGlobal.colors.primary }}>Search Properties</Link>
              </li>
              <li>
                <Link to="/support" style={{ color: themeGlobal.colors.primary }}>Support & Help</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="not-found-illustration-section">
          <img 
            src={NotFoundIllustration} 
            alt="Lost Illustration" 
            className="not-found-illustration-img" 
          />
        </div>
      </main>
    </div>
  );
}
