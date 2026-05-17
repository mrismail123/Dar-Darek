import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Home components/Header";
import Footer from "../Footer";
import { useToken } from "../Contexts/TokenContext";
import { buildApiUrl, createAuthConfig } from "../lib/api";
import "./CheckoutPage.css";

/* ── helpers ── */
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(amount);

const getNightCount = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  if (!checkIn || !checkOut || Number.isNaN(diff) || diff <= 0) return 1;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
};

const LOCK_DURATION = 15 * 60; // 15 minutes in seconds

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className={`co-toast co-toast--${toast.type}`} role="alert">
      <span className="co-toast__icon">
        {toast.type === "success" ? "✓" : toast.type === "warning" ? "⚠" : "✕"}
      </span>
      <p>{toast.message}</p>
      <button type="button" className="co-toast__close" onClick={onDismiss}>
        ✕
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COUNTDOWN TIMER
═══════════════════════════════════════════════════════════════ */
function CountdownTimer({ secondsLeft, isExpired }) {
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const isUrgent = secondsLeft <= 120;

  return (
    <div className={`co-timer ${isUrgent ? "co-timer--urgent" : ""} ${isExpired ? "co-timer--expired" : ""}`}>
      <span className="co-timer__icon">{isExpired ? "⏰" : "⏱"}</span>
      <div className="co-timer__content">
        <span className="co-timer__label">
          {isExpired ? "Session Expired" : "Session reserved for"}
        </span>
        <span className="co-timer__countdown">
          {isExpired ? "00:00" : `${mins}:${secs}`}
        </span>
      </div>
      {!isExpired && (
        <div
          className="co-timer__bar"
          style={{ width: `${(secondsLeft / LOCK_DURATION) * 100}%` }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useToken();

  /* dates & property passed via router state */
  const passedState = location.state || {};
  const checkIn = passedState.checkIn || "";
  const checkOut = passedState.checkOut || "";
  const passedProperty = passedState.property || null;

  /* property data */
  const [property, setProperty] = useState(passedProperty);
  const [loadingProp, setLoadingProp] = useState(!passedProperty);

  /* form fields */
  const [guestFullName, setGuestFullName] = useState("");
  const [guestIdNumber, setGuestIdNumber] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  /* UI state */
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  /* timer */
  const [secondsLeft, setSecondsLeft] = useState(LOCK_DURATION);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef(null);
  const lockStartRef = useRef(Date.now());

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  /* ── guard: must have dates & be logged in ── */
  useEffect(() => {
    if (!token) {
      navigate("/Authentication", { state: { from: location.pathname } });
      return;
    }
    if (!checkIn || !checkOut) {
      navigate(`/property-details/${propertyId}`);
    }
  }, [token, checkIn, checkOut, propertyId, navigate, location.pathname]);

  /* ── load property if not passed ── */
  useEffect(() => {
    if (passedProperty || !propertyId) return;

    const controller = new AbortController();
    (async () => {
      try {
        setLoadingProp(true);
        const res = await axios.get(
          buildApiUrl(`/api/properties/${propertyId}`),
          { signal: controller.signal }
        );
        setProperty(res.data?.property || res.data || null);
      } catch {
        /* swallow abort */
      } finally {
        setLoadingProp(false);
      }
    })();

    return () => controller.abort();
  }, [propertyId, passedProperty]);

  /* ── countdown timer ── */
  useEffect(() => {
    lockStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lockStartRef.current) / 1000);
      const remaining = LOCK_DURATION - elapsed;

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setSecondsLeft(0);
        setIsExpired(true);
        showToast("error", "Your session has expired. Redirecting to property page…");
        setTimeout(() => {
          navigate(`/property-details/${propertyId}`);
        }, 3000);
      } else {
        setSecondsLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [propertyId, navigate, showToast]);

  /* ── computed ── */
  const nights = getNightCount(checkIn, checkOut);
  const pricePerNight = Number(
    property?.price_per_day || property?.pricePerNight || 0
  );
  const nightsTotal = nights * pricePerNight;
  const title =
    property?.title || "Property";
  const city =
    property?.city || property?.city_name || "";

  /* ── validation ── */
  const validate = () => {
    const errors = {};
    const nameTrimmed = guestFullName.trim();
    const idTrimmed = guestIdNumber.trim();
    const phoneTrimmed = guestPhone.trim();

    if (!nameTrimmed || nameTrimmed.length < 5) {
      errors.guestFullName = "Please enter your full name (min 5 characters).";
    }
    if (!idTrimmed || idTrimmed.length < 5) {
      errors.guestIdNumber = "Please enter a valid ID / CIN / Passport number.";
    }
    if (!phoneTrimmed || !/^[\d\s()+-]{7,15}$/.test(phoneTrimmed)) {
      errors.guestPhone = "Please enter a valid phone number.";
    }
    if (!agreedToTerms) {
      errors.agreedToTerms = "You must accept the rental agreement to continue.";
    }
    return errors;
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isExpired) {
      showToast("error", "Your session has expired. Please go back and start again.");
      return;
    }

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!token) {
      navigate("/Authentication", { state: { from: location.pathname } });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id_property: propertyId,
        checkIn,
        checkOut,
        guest_full_name: guestFullName.trim(),
        guest_id_number: guestIdNumber.trim(),
        guest_phone: guestPhone.trim(),
        agreed_to_terms: true,
      };

      await axios.post(
        buildApiUrl("/api/bookingProperty"),
        payload,
        createAuthConfig(token)
      );

      /* clear timer */
      clearInterval(timerRef.current);

      navigate("/my-bookings", {
        state: {
          successToast:
            "Your reservation request has been sent! The host will review it and get back to you soon.",
        },
      });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "An error occurred while submitting your request.";

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        showToast("error", "Session expired. Please log in again.");
        navigate("/Authentication", { state: { from: location.pathname } });
      } else {
        showToast("error", msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ── render ── */
  if (loadingProp) {
    return (
      <>
        <Header />
        <main className="co-page">
          <div className="co-loading">
            <div className="co-loading__spinner" />
            <p>Loading booking details…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="co-page">
        <Toast toast={toast} onDismiss={() => setToast(null)} />

        {/* Back button */}
        <button
          type="button"
          className="co-back-btn"
          onClick={() => navigate(`/property-details/${propertyId}`)}
        >
          ← Back to listing
        </button>

        <div className="co-layout">
          {/* ── LEFT: Form ── */}
          <section className="co-form-section">
            <div className="co-section-header">
              <h1 className="co-section-header__title">Confirm your booking</h1>
              <p className="co-section-header__sub">
                Complete your identity verification to submit the reservation request.
              </p>
            </div>

            <CountdownTimer secondsLeft={secondsLeft} isExpired={isExpired} />

            <form
              id="checkout-form"
              className="co-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Identity section */}
              <div className="co-card">
                <div className="co-card__head">
                  <span className="co-card__badge">🪪</span>
                  <div>
                    <h2 className="co-card__title">Identity Verification</h2>
                    <p className="co-card__desc">
                      Required for security and host coordination.
                    </p>
                  </div>
                </div>

                <div className="co-form__fields">
                  {/* Full Name */}
                  <div className={`co-field ${fieldErrors.guestFullName ? "co-field--error" : ""}`}>
                    <label htmlFor="co-full-name" className="co-field__label">
                      Full Name <span className="co-field__required">*</span>
                      <span className="co-field__hint">as it appears on your ID</span>
                    </label>
                    <input
                      id="co-full-name"
                      type="text"
                      className="co-field__input"
                      placeholder="e.g. Mohamed El Fassi"
                      value={guestFullName}
                      onChange={(e) => {
                        setGuestFullName(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, guestFullName: "" }));
                      }}
                      autoComplete="name"
                      disabled={submitting || isExpired}
                    />
                    {fieldErrors.guestFullName && (
                      <span className="co-field__error">{fieldErrors.guestFullName}</span>
                    )}
                  </div>

                  {/* ID Number */}
                  <div className={`co-field ${fieldErrors.guestIdNumber ? "co-field--error" : ""}`}>
                    <label htmlFor="co-id-number" className="co-field__label">
                      ID / CIN / Passport Number{" "}
                      <span className="co-field__required">*</span>
                    </label>
                    <input
                      id="co-id-number"
                      type="text"
                      className="co-field__input"
                      placeholder="e.g. BE123456 or AB1234567"
                      value={guestIdNumber}
                      onChange={(e) => {
                        setGuestIdNumber(e.target.value.toUpperCase());
                        setFieldErrors((prev) => ({ ...prev, guestIdNumber: "" }));
                      }}
                      autoComplete="off"
                      disabled={submitting || isExpired}
                    />
                    {fieldErrors.guestIdNumber && (
                      <span className="co-field__error">{fieldErrors.guestIdNumber}</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className={`co-field ${fieldErrors.guestPhone ? "co-field--error" : ""}`}>
                    <label htmlFor="co-phone" className="co-field__label">
                      Phone Number <span className="co-field__required">*</span>
                    </label>
                    <input
                      id="co-phone"
                      type="tel"
                      className="co-field__input"
                      placeholder="e.g. +212 6XX XXX XXX"
                      value={guestPhone}
                      onChange={(e) => {
                        setGuestPhone(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, guestPhone: "" }));
                      }}
                      autoComplete="tel"
                      disabled={submitting || isExpired}
                    />
                    {fieldErrors.guestPhone && (
                      <span className="co-field__error">{fieldErrors.guestPhone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Consent */}
              <div className="co-card co-card--consent">
                <div className="co-card__head">
                  <span className="co-card__badge">📜</span>
                  <div>
                    <h2 className="co-card__title">Rental Agreement</h2>
                    <p className="co-card__desc">
                      Please read and accept the terms before confirming.
                    </p>
                  </div>
                </div>

                <label
                  className={`co-consent ${fieldErrors.agreedToTerms ? "co-consent--error" : ""}`}
                  htmlFor="co-consent-check"
                >
                  <input
                    id="co-consent-check"
                    type="checkbox"
                    className="co-consent__checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      setFieldErrors((prev) => ({ ...prev, agreedToTerms: "" }));
                    }}
                    disabled={submitting || isExpired}
                  />
                  <span className="co-consent__box" aria-hidden="true" />
                  <span className="co-consent__text">
                    I agree to the{" "}
                    <strong>Dar Darek Rental Agreement</strong> and verify that my
                    identification details are accurate. I understand that this
                    information will be shared with the host and local authorities if
                    required for security purposes.
                  </span>
                </label>
                {fieldErrors.agreedToTerms && (
                  <span className="co-field__error co-field__error--consent">
                    {fieldErrors.agreedToTerms}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="co-submit-btn"
                className="co-submit-btn"
                disabled={submitting || isExpired}
              >
                {submitting ? (
                  <>
                    <span className="co-submit-btn__spinner" />
                    Submitting request…
                  </>
                ) : (
                  <>
                    <span>🔐</span> Confirm Reservation Request
                  </>
                )}
              </button>

              <p className="co-notice">
                Your booking will be in <strong>Pending</strong> status until the
                host approves it. No payment is collected at this stage.
              </p>
            </form>
          </section>

          {/* ── RIGHT: Summary ── */}
          <aside className="co-summary-section">
            <div className="co-summary-card">
              <h2 className="co-summary-card__title">Booking Summary</h2>

              <div className="co-summary-card__property">
                <span className="co-summary-card__type">🏠 {property?.property_type || "Property"}</span>
                <h3 className="co-summary-card__name">{title}</h3>
                {city && <p className="co-summary-card__city">📍 {city}</p>}
              </div>

              <div className="co-summary-card__divider" />

              <div className="co-summary-card__dates">
                <div className="co-summary-card__date-row">
                  <div className="co-date-block">
                    <span className="co-date-block__label">Check-in</span>
                    <strong className="co-date-block__value">
                      {formatDisplayDate(checkIn)}
                    </strong>
                  </div>
                  <span className="co-date-arrow">→</span>
                  <div className="co-date-block">
                    <span className="co-date-block__label">Check-out</span>
                    <strong className="co-date-block__value">
                      {formatDisplayDate(checkOut)}
                    </strong>
                  </div>
                </div>
                <span className="co-summary-card__nights">
                  {nights} {nights === 1 ? "night" : "nights"}
                </span>
              </div>

              <div className="co-summary-card__divider" />

              <div className="co-summary-card__pricing">
                <div className="co-price-row">
                  <span>
                    {formatCurrency(pricePerNight)} × {nights}{" "}
                    {nights === 1 ? "night" : "nights"}
                  </span>
                  <span>{formatCurrency(nightsTotal)}</span>
                </div>
              </div>

              <div className="co-summary-card__divider" />

              <div className="co-summary-card__total">
                <span>Total</span>
                <strong>{formatCurrency(nightsTotal)}</strong>
              </div>

              <p className="co-summary-card__note">
                ⚠ This is a reservation <em>request</em>. The host must approve
                it before it's confirmed.
              </p>
            </div>

            {/* Security note */}
            <div className="co-security-note">
              <span className="co-security-note__icon">🔒</span>
              <p>
                Your identity details are encrypted and only shared with the
                property host upon booking approval.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
