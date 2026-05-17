import { Link } from "react-router-dom";
import {
  FaCookieBite,
  FaEnvelope,
  FaLock,
  FaRegUser,
  FaShieldAlt,
  FaUserCheck,
} from "react-icons/fa";

import "./PrivacyPolicy.css";

const policySections = [
  {
    icon: <FaRegUser />,
    title: "Information We Collect",
    items: [
      "Name",
      "Email",
      "Phone number",
      "Profile photo",
      "Booking details",
      "Property listing details",
    ],
  },
  {
    icon: <FaShieldAlt />,
    title: "How We Use Your Information",
    items: [
      "Account management",
      "Booking experience",
      "Host and guest communication",
      "Security and verification",
      "Platform improvement",
    ],
  },
  {
    icon: <FaCookieBite />,
    title: "Cookies & Sessions",
    text:
      "DarDarek uses essential cookies and localStorage to keep users signed in, remember choices, and improve the experience. You can accept all cookies or choose necessary cookies only from the cookie banner.",
    items: [
      "Keep users signed in",
      "Remember cookie choices",
      "Improve the platform experience",
    ],
  },
  {
    icon: <FaLock />,
    title: "Account Security",
    items: [
      "Password protection",
      "Email and phone verification",
      "Protected routes",
      "Secure account access",
    ],
  },
  {
    icon: <FaUserCheck />,
    title: "User Rights",
    items: [
      "Update profile information",
      "Change contact details",
      "Manage account preferences",
      "Request account deletion or deactivation",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <main className="privacy-policy-page">
      <section className="privacy-policy-hero">
        <div className="privacy-policy-hero__content">
          <Link to="/" className="privacy-policy-hero__brand">
            DarDarek
          </Link>
          <p className="privacy-policy-hero__eyebrow">Privacy & trust</p>
          <h1>Privacy Policy</h1>
          <p className="privacy-policy-hero__intro">
            At DarDarek, we value your privacy and aim to provide a safe and
            trusted rental experience across Northern Morocco.
          </p>
          <p className="privacy-policy-hero__date">Last updated: May 2026</p>
        </div>
      </section>

      <section className="privacy-policy-shell" aria-label="Privacy details">
        <div className="privacy-policy-grid">
          {policySections.map((section) => (
            <article className="privacy-policy-card" key={section.title}>
              <div className="privacy-policy-card__icon" aria-hidden="true">
                {section.icon}
              </div>
              <div className="privacy-policy-card__content">
                <h2>{section.title}</h2>
                {section.text && <p>{section.text}</p>}
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <article className="privacy-policy-contact">
          <div className="privacy-policy-contact__icon" aria-hidden="true">
            <FaEnvelope />
          </div>
          <div>
            <p className="privacy-policy-contact__label">Contact us</p>
            <h2>Questions about your privacy?</h2>
            <p>
              For privacy questions or account requests, contact the DarDarek
              team at{" "}
              <a href="mailto:support@dardarek.ma">support@dardarek.ma</a>.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
