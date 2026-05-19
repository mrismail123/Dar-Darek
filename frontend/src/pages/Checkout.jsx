import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../Home components/Header";
import Footer from "../Footer";
import { useToken } from "../Contexts/TokenContext";
import { useThemeGlobal } from "../Contexts/ThemeContext";
import { buildApiUrl, createAuthConfig } from "../lib/api";
import "./Checkout.css";

/* ─── helpers ─────────────────────────────────────────────────────────── */
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(`${String(value).split("T")[0]}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
};

const getNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff =
    new Date(`${checkOut}T12:00:00`).getTime() -
    new Date(`${checkIn}T12:00:00`).getTime();
  const n = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return n > 0 ? n : 0;
};

const pad = (n) => String(n).padStart(2, "0");

/* ─── Toast ──────────────────────────────────────────────────────────── */
function Toast({ message, type, onDismiss }) {
  if (!message) return null;
  return (
    <div className={`co-toast co-toast--${type}`} role="alert">
      <span className="co-toast__icon">{type === "success" ? "✓" : "⚠"}</span>
      <p>{message}</p>
      <button
        type="button"
        className="co-toast__close"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

/* ─── Countdown Timer ────────────────────────────────────────────────── */
function CountdownTimer({ expiresAt, onExpire }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(expiresAt - Date.now(), 0),
  );

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const id = window.setInterval(() => {
      const left = Math.max(expiresAt - Date.now(), 0);
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(id);
        onExpire();
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [expiresAt, onExpire, remaining]);

  const totalSec = Math.ceil(remaining / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const isUrgent = totalSec <= 60;

  return (
    <div className={`co-timer${isUrgent ? " co-timer--urgent" : ""}`}>
      <span className="co-timer__icon" aria-hidden="true">
        ⏱
      </span>
      <div className="co-timer__body">
        <span className="co-timer__label">Session reserved for</span>
        <span className="co-timer__digits" aria-live="polite">
          {pad(mins)}:{pad(secs)}
        </span>
      </div>
      {isUrgent && (
        <span className="co-timer__warning">Expiring soon!</span>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function Checkout() {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useToken();
  const themeGlobal = useThemeGlobal();

  /* State passed from PropertyDetails */
  const passed = location.state || {};
  const checkIn = passed.checkIn || "";
  const checkOut = passed.checkOut || "";
  const propertyTitle = passed.propertyTitle || "Your selected property";
  const pricePerNight = Number(passed.pricePerNight) || 0;
  const propertyImage = passed.propertyImage || null;
  const propertyCity = passed.propertyCity || "";

  /* Timer & Lock */
  const lockIdRef = useRef(null);
  const lockStartRef = useRef(
    passed.lockStart ? Number(passed.lockStart) : Date.now(),
  );
  const [expiresAt, setExpiresAt] = useState(
    lockStartRef.current + LOCK_DURATION_MS,
  );

  /* form */
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* feedback */
  const [toast, setToast] = useState(null); // { message, type }
  const [fieldErrors, setFieldErrors] = useState({});

  const nights = getNights(checkIn, checkOut);
  const totalPrice = pricePerNight * nights;

  /* Guard: redirect if no dates passed */
  useEffect(() => {
    if (!checkIn || !checkOut) {
      navigate(`/property-details/${propertyId}`, { replace: true });
    }
    if (!token) {
      navigate("/Authentication", {
        state: { from: `/checkout/${propertyId}` },
        replace: true,
      });
    }
  }, [checkIn, checkOut, token, propertyId, navigate]);

  /* Acquire booking lock on mount */
  useEffect(() => {
    if (!checkIn || !checkOut || !token) return;

    let cancelled = false;

    async function acquireLock() {
      try {
        const { data } = await axios.post(
          buildApiUrl("/api/booking-lock"),
          { id_property: propertyId, checkIn, checkOut },
          createAuthConfig(token),
        );

        if (cancelled) return;

        lockIdRef.current = data.lockId;
        if (data.expiresAt) {
          setExpiresAt(new Date(data.expiresAt).getTime());
        }
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.response?.data?.message ||
          "Could not reserve your session. Please try again.";
        setToast({ message: msg, type: "error" });

        if (err?.response?.status === 409) {
          window.setTimeout(() => {
            navigate(`/property-details/${propertyId}`);
          }, 2800);
        }
      }
    }

    acquireLock();

    return () => {
      cancelled = true;
      // Release lock on unmount
      if (lockIdRef.current && token) {
        axios
          .delete(
            buildApiUrl(`/api/booking-lock/${lockIdRef.current}`),
            createAuthConfig(token),
          )
          .catch(() => {});
      }
    };
  }, [checkIn, checkOut, token, propertyId, navigate]);

  /* ── Timer expiry ── */
  function handleTimerExpire() {
    setToast({
      message:
        "Your session has expired. Please select new dates and try again.",
      type: "error",
    });
    window.setTimeout(() => {
      navigate(`/property-details/${propertyId}`);
    }, 2800);
  }

  /* ── Client-side validation ── */
  function validate() {
    const errors = {};
    if (!fullName.trim() || fullName.trim().length < 5)
      errors.fullName = "Full name must be at least 5 characters.";
    if (!idNumber.trim() || idNumber.trim().length < 5)
      errors.idNumber = "Please enter a valid CIN or Passport number.";
    if (!/^[\d\s()+-]{7,20}$/.test(phone.trim()))
      errors.phone = "Please enter a valid phone number (7–20 digits).";
    if (!agreed)
      errors.agreed = "You must accept the rental agreement to proceed.";
    return errors;
  }

  /* ── Submit ── */
  async function handleConfirm(e) {
    e.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!token) {
      navigate("/Authentication", {
        state: { from: `/checkout/${propertyId}` },
      });
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      await axios.post(
        buildApiUrl("/api/bookingProperty"),
        {
          id_property: propertyId,
          checkIn,
          checkOut,
          guest_full_name: fullName.trim(),
          guest_id_number: idNumber.trim(),
          guest_phone: phone.trim(),
          agreed_to_terms: true,
        },
        createAuthConfig(token),
      );

      /* Lock is cleaned up server-side after booking; prevent double-release */
      lockIdRef.current = null;

      /* Success → go to My Bookings with success toast */
      navigate("/my-bookings", {
        state: {
          successToast:
            "Your reservation request has been sent! The host will review it shortly.",
        },
        replace: true,
      });
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      if (status === 401 || status === 403) {
        navigate("/Authentication", {
          state: { from: `/checkout/${propertyId}` },
        });
        return;
      }

      setToast({ message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Render ── */
  return (
    <div
      className="co-page"
      style={{ background: themeGlobal.colors.background }}
    >
      <Header />

      <main className="co-shell">
        {/* ── Page heading ── */}
        <div className="co-heading">
          <button
            type="button"
            className="co-back-btn"
            onClick={() => navigate(`/property-details/${propertyId}`)}
            aria-label="Back to property"
          >
            ← Back
          </button>
          <div>
            <p className="co-kicker">Step 2 of 2</p>
            <h1>Review &amp; Confirm</h1>
            <p className="co-subtitle">
              Verify your identity and confirm your reservation request.
            </p>
          </div>
        </div>

        <div className="co-layout">
          {/* ═══════════════════ LEFT COLUMN ═════════════════════ */}
          <div className="co-main-col">
            {/* Timer */}
            <CountdownTimer
              expiresAt={expiresAt}
              onExpire={handleTimerExpire}
            />

            {/* Toast */}
            <Toast
              message={toast?.message}
              type={toast?.type}
              onDismiss={() => setToast(null)}
            />

            {/* Identity Form */}
            <section className="co-card co-form-card" aria-label="Identity verification">
              <div className="co-card__header">
                <span className="co-card__icon" aria-hidden="true">🪪</span>
                <div>
                  <h2>Identity Verification</h2>
                  <p>Required for security and host communication.</p>
                </div>
              </div>

              <form
                id="co-form"
                className="co-form"
                onSubmit={handleConfirm}
                noValidate
              >
                {/* Full Name */}
                <div className={`co-field${fieldErrors.fullName ? " co-field--error" : ""}`}>
                  <label htmlFor="co-fullname">
                    Full Name
                    <span className="co-required" aria-hidden="true"> *</span>
                  </label>
                  <div className="co-input-wrap">
                    <span className="co-input-icon" aria-hidden="true">👤</span>
                    <input
                      id="co-fullname"
                      type="text"
                      autoComplete="name"
                      placeholder="As it appears on your ID document"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName)
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.fullName;
                            return next;
                          });
                      }}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="co-field__error" role="alert">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                {/* ID Number */}
                <div className={`co-field${fieldErrors.idNumber ? " co-field--error" : ""}`}>
                  <label htmlFor="co-idnumber">
                    ID Number (CIN / Passport)
                    <span className="co-required" aria-hidden="true"> *</span>
                  </label>
                  <div className="co-input-wrap">
                    <span className="co-input-icon" aria-hidden="true">🪪</span>
                    <input
                      id="co-idnumber"
                      type="text"
                      autoComplete="off"
                      placeholder="CIN or Passport number"
                      value={idNumber}
                      onChange={(e) => {
                        setIdNumber(e.target.value);
                        if (fieldErrors.idNumber)
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.idNumber;
                            return next;
                          });
                      }}
                    />
                  </div>
                  {fieldErrors.idNumber && (
                    <p className="co-field__error" role="alert">
                      {fieldErrors.idNumber}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className={`co-field${fieldErrors.phone ? " co-field--error" : ""}`}>
                  <label htmlFor="co-phone">
                    Phone Number
                    <span className="co-required" aria-hidden="true"> *</span>
                  </label>
                  <div className="co-input-wrap">
                    <span className="co-input-icon" aria-hidden="true">📞</span>
                    <input
                      id="co-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+212 6XX XXX XXX"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone)
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.phone;
                            return next;
                          });
                      }}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="co-field__error" role="alert">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Legal Consent */}
                <div className={`co-consent${fieldErrors.agreed ? " co-consent--error" : ""}`}>
                  <label className="co-consent__label">
                    <span className="co-checkbox-wrap">
                      <input
                        id="co-agreed"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => {
                          setAgreed(e.target.checked);
                          if (fieldErrors.agreed)
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.agreed;
                              return next;
                            });
                        }}
                      />
                      <span className="co-checkbox-visual" aria-hidden="true" />
                    </span>
                    <span className="co-consent__text">
                      I agree to the{" "}
                      <strong>Dar Darek Rental Agreement</strong> and verify
                      that my identification details are accurate. I understand
                      that this information will be shared with the host and
                      local authorities if required for security purposes.
                    </span>
                  </label>
                  {fieldErrors.agreed && (
                    <p className="co-field__error" role="alert">
                      {fieldErrors.agreed}
                    </p>
                  )}
                </div>
              </form>
            </section>

            {/* Security note */}
            <div className="co-security-note">
              <span aria-hidden="true">🔒</span>
              <p>
                Your data is encrypted and handled in accordance with Moroccan
                data-protection regulations. It will only be used for
                reservation purposes.
              </p>
            </div>
          </div>

          {/* ═══════════════════ RIGHT COLUMN — SUMMARY ══════════════════ */}
          <aside className="co-sidebar">
            <div className="co-card co-summary-card" aria-label="Booking summary">
              {propertyImage && (
                <div className="co-summary__image">
                  <img src={propertyImage} alt={propertyTitle} />
                </div>
              )}

              <div className="co-summary__body">
                {propertyCity && (
                  <p className="co-summary__city">{propertyCity}</p>
                )}
                <h2 className="co-summary__title">{propertyTitle}</h2>

                <div className="co-summary__dates">
                  <div className="co-summary__date-row">
                    <span className="co-summary__date-label">
                      <span aria-hidden="true">📅</span> Check-in
                    </span>
                    <strong>{formatDate(checkIn)}</strong>
                  </div>
                  <div className="co-summary__date-divider" aria-hidden="true" />
                  <div className="co-summary__date-row">
                    <span className="co-summary__date-label">
                      <span aria-hidden="true">📅</span> Check-out
                    </span>
                    <strong>{formatDate(checkOut)}</strong>
                  </div>
                </div>

                <div className="co-summary__pricing">
                  <div className="co-summary__price-row">
                    <span>
                      {formatCurrency(pricePerNight)} ×{" "}
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="co-summary__total-row">
                    <strong>Total</strong>
                    <strong className="co-summary__total-price">
                      {formatCurrency(totalPrice)}
                    </strong>
                  </div>
                </div>

                <p className="co-summary__note">
                  ℹ️ Payment is collected by the host upon arrival. This is a
                  reservation request only.
                </p>
              </div>
            </div>

            {/* Sticky CTA */}
            <button
              type="submit"
              form="co-form"
              className="co-confirm-btn"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <span className="co-spinner" aria-hidden="true" /> Sending
                  Request…
                </>
              ) : (
                <>✈ Confirm Reservation Request</>
              )}
            </button>

            <p className="co-confirm-hint">
              The host will review your request and respond within 24 hours.
              No payment is charged now.
            </p>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
