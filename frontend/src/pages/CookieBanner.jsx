import { useState } from "react";
import { Link } from "react-router-dom";

import "./CookieBanner.css";

const CONSENT_KEY = "dardarek_cookie_consent";

function getSavedConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function CookieBanner() {
  const [isVisible, setIsVisible] = useState(() => !getSavedConsent());

  const saveConsent = (choice) => {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } finally {
      setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section
      className="cookie-banner"
      aria-labelledby="cookie-banner-title"
      role="region"
    >
      <div className="cookie-banner__mark" aria-hidden="true">
        <span />
      </div>

      <div className="cookie-banner__content">
        <p className="cookie-banner__eyebrow">DarDarek privacy</p>
        <h2 id="cookie-banner-title">Your privacy matters</h2>
        <p>
          DarDarek uses essential cookies and local storage to keep you signed
          in and make the platform work smoothly. Optional cookies may help us
          improve the experience across Northern Morocco stays.
        </p>
        <Link
          to="/privacy-policy"
          className="cookie-banner__link"
        >
          Privacy Policy
        </Link>
      </div>

      <div className="cookie-banner__actions" aria-label="Cookie choices">
        <button
          className="cookie-banner__button cookie-banner__button--primary"
          type="button"
          onClick={() => saveConsent("all")}
        >
          Accept all
        </button>
        <button
          className="cookie-banner__button cookie-banner__button--secondary"
          type="button"
          onClick={() => saveConsent("necessary")}
        >
          Necessary only
        </button>
      </div>
    </section>
  );
}

export default CookieBanner;
