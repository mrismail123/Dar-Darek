import { createElement, useEffect, useMemo, useRef, useState } from "react";
import {
  FiBell,
  FiBriefcase,
  FiCamera,
  FiCheck,
  FiCreditCard,
  FiGlobe,
  FiHome,
  FiChevronDown,
  FiLock,
  FiMail,
  FiMapPin,
  FiMonitor,
  FiPhone,
  FiSettings,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useToken } from "../Contexts/TokenContext";
import Footer from "../Footer";
import "./AccountSettings.css";

const MOCK_USER = {
  name: "Ismail Mrini",
  email: "ismail.mrini@example.com",
  phone: "+212 661 234 567",
  bio: "Passionate traveller. I love discovering the beauty of Northern Morocco and finding memorable stays.",
  role: "user",
};

const API_BASE_URL = "http://localhost:5000";

function parseStoredUser() {
  try {
    const storedRaw = localStorage.getItem("user");
    return storedRaw ? JSON.parse(storedRaw) : null;
  } catch {
    return null;
  }
}

function normalizeAccountDate(value) {
  return value ? String(value).split("T")[0] : "";
}

function parseAccountLanguages(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : [];
  } catch {
    return value
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean);
  }
}

function normalizeProfilePictureUrl(value) {
  if (!value) return "";
  return String(value).startsWith("/uploads")
    ? `${API_BASE_URL}${value}`
    : String(value);
}

const SECTIONS = [
  { id: "profile", label: "Profile", Icon: FiUser },
  { id: "security", label: "Security", Icon: FiShield },
  { id: "notifications", label: "Notifications", Icon: FiBell },
  { id: "hosting", label: "Hosting", Icon: FiHome },
  { id: "preferences", label: "Preferences", Icon: FiSettings },
  { id: "payments", label: "Payments", Icon: FiCreditCard },
];

const NATIONALITY_OPTIONS = [
  "Moroccan",
  "French",
  "Spanish",
  "Algerian",
  "Tunisian",
  "Egyptian",
  "American",
  "British",
  "Italian",
  "German",
  "Dutch",
  "Belgian",
  "Turkish",
  "Canadian",
  "Other",
];

const LANGUAGE_OPTIONS = [
  "Arabic",
  "French",
  "English",
  "Spanish",
  "Italian",
  "German",
  "Dutch",
  "Portuguese",
  "Turkish",
  "Amazigh",
];

const CONTACT_OPTIONS = ["Email", "SMS", "Push notification"];

const notificationCategories = [
  {
    key: "bookingUpdates",
    label: "Booking updates",
    description: "Confirmations, changes, cancellations, and reminders.",
    Icon: FiBriefcase,
  },
  {
    key: "messages",
    label: "Messages",
    description: "Conversations between guests and hosts.",
    Icon: FiMail,
  },
  {
    key: "rentalRequests",
    label: "Rental requests",
    description: "Requests sent or received for a property.",
    Icon: FiHome,
  },
  {
    key: "reviewsReminders",
    label: "Reviews and reminders",
    description: "Reminders to leave reviews or complete actions.",
    Icon: FiCheck,
  },
  {
    key: "promotions",
    label: "Promotions",
    description: "Travel inspiration and DarDarek offers.",
    Icon: FiGlobe,
  },
  {
    key: "securityAlerts",
    label: "Security alerts",
    description: "Important account and login activity.",
    Icon: FiShield,
  },
];

const notificationChannels = [
  {
    key: "email",
    label: "Email notifications",
    description: "Booking updates, messages, and account notices by email.",
    Icon: FiMail,
  },
  {
    key: "sms",
    label: "SMS notifications",
    description: "Short text alerts for important reservation activity.",
    Icon: FiPhone,
  },
  {
    key: "push",
    label: "Push notifications",
    description: "In-app alerts when DarDarek mobile support is added.",
    Icon: FiBell,
  },
];

const hostingSteps = [
  {
    title: "Tell us about your place",
    description:
      "Choose the type of space, location, guest capacity, and what makes it unique.",
  },
  {
    title: "Add photos and essentials",
    description:
      "Upload clear photos, select amenities, and describe the experience guests can expect.",
  },
  {
    title: "Set availability and price",
    description:
      "Choose your nightly price, check-in details, and when guests can request to stay.",
  },
  {
    title: "Publish when ready",
    description:
      "Submit your listing. Verification and approval can be handled later with backend integration.",
  },
];

const hostingModalChecklist = [
  "Complete your profile",
  "Prepare property photos",
  "Add your first listing details",
];

const hostActiveItems = [
  "Profile ready",
  "Hosting tools unlocked",
  "Listing creation available",
];

const publishChecklist = [
  "Add property details",
  "Upload photos",
  "Set price and availability",
];

const hostingWorksItems = [
  "Create your listing",
  "Review rental requests",
  "Welcome guests safely",
];

const preferenceLanguageOptions = [
  "English",
  "French",
  "Arabic",
  "Spanish",
  "German",
  "Italian",
  "Dutch",
  "Portuguese",
  "Turkish",
  "Amazigh",
];

const preferenceCurrencyOptions = [
  { value: "MAD", label: "Moroccan Dirham" },
  { value: "EUR", label: "Euro" },
  { value: "USD", label: "US Dollar" },
  { value: "GBP", label: "British Pound" },
  { value: "CAD", label: "Canadian Dollar" },
  { value: "AED", label: "UAE Dirham" },
  { value: "SAR", label: "Saudi Riyal" },
];

const preferenceCityOptions = [
  "Ajdir",
  "Al Hoceima",
  "Asilah",
  "Belyounech",
  "Bni Bouayach",
  "Cabo Negro",
  "Chefchaouen",
  "Fnideq",
  "Imzouren",
  "Ksar El Kebir",
  "Larache",
  "Martil",
  "M'diq",
  "Oued Laou",
  "Ouazzane",
  "Tangier",
  "Targuist",
  "Tetouan",
];

const commonPreferenceCities = [
  "Ajdir",
  "Al Hoceima",
  "Asilah",
  "Belyounech",
  "Bni Bouayach",
  "Cabo Negro",
  "Chefchaouen",
  "Fnideq",
  "Imzouren",
  "Ksar El Kebir",
  "Larache",
  "Martil",
  "M'diq",
  "Oued Laou",
  "Ouazzane",
  "Tangier",
  "Targuist",
  "Tetouan",
].sort((a, b) => a.localeCompare(b));

const preferenceStayTypes = [
  { value: "Apartment", icon: "🏢" },
  { value: "Studio", icon: "🛋️" },
  { value: "House", icon: "🏠" },
  { value: "Villa", icon: "🏡" },
  { value: "Riad", icon: "🕌" },
  { value: "Guest house", icon: "🛎️" },
];

const billingCountryOptions = ["Morocco", "France", "Spain", "Other"];

const payoutMethodOptions = [
  "Bank account",
  "PayPal",
  "Payoneer",
  "International wire",
];

const paymentSafetyPoints = [
  "Secure checkout will be connected later",
  "Payout verification is required for hosts",
  "Sensitive payment data should be handled by a payment provider",
];

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function splitName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", className: "" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) && password.length >= 10) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", className: "weak" };
  if (score === 2) return { score: 2, label: "Medium", className: "medium" };
  return { score: 3, label: "Strong", className: "strong" };
}

function formatValue(value) {
  return value && String(value).trim() ? value : "Not provided yet";
}

function formatDateOfBirth(value) {
  if (!value) return "Not provided yet";

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "Not provided yet";

  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const birthDayOptions = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

const birthMonthOptions = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const birthYearOptions = Array.from({ length: 100 }, (_, index) =>
  String(new Date().getFullYear() - 18 - index),
);

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`settings-toggle ${checked ? "settings-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span className="settings-toggle__thumb" />
    </button>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const Icon = toast.type === "warning" ? FiShield : FiCheck;
  return (
    <div
      className={`settings-toast settings-toast--${toast.type}`}
      role="status"
    >
      <Icon aria-hidden="true" />
      <span>{toast.message}</span>
    </div>
  );
}

function SettingsModal({ modal, errors, onChange, onClose, onSave }) {
  const [openBirthDropdown, setOpenBirthDropdown] = useState(null);

  if (!modal) return null;

  const copy = {
    name: {
      title: "Edit full name",
      guidance: "Make sure this name matches your official documents.",
    },
    email: {
      title: "Edit email address",
      guidance:
        modal.draft.step === 2
          ? "We sent a 6-digit verification code to your new email address."
          : "Enter a new email address and verify it before saving.",
    },
    phone: {
      title: "Edit phone number",
      guidance:
        modal.draft.step === 2
          ? "We sent a 6-digit verification code to your phone number."
          : "Enter a phone number and verify it before saving.",
    },
    dateOfBirth: {
      title: "Edit date of birth",
      guidance:
        "Your date of birth helps DarDarek support trust and account safety. It will not be shown publicly.",
    },
  }[modal.type];

  const saveLabel =
    modal.type === "email" || modal.type === "phone"
      ? modal.draft.step === 2
        ? "Verify and save"
        : "Send verification code"
      : "Save";

  return (
    <div
      className="settings-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="settings-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>
        <h3 id="settings-modal-title">{copy.title}</h3>
        <p>{copy.guidance}</p>

        {modal.type === "name" && (
          <div className="settings-modal__grid">
            <label className="settings-field">
              <span className="settings-label">First name</span>
              <input
                className={`settings-input ${errors.firstName ? "settings-input--error" : ""}`}
                value={modal.draft.firstName}
                onChange={(event) =>
                  onChange({ ...modal.draft, firstName: event.target.value })
                }
                autoFocus
              />
              {errors.firstName && (
                <span className="settings-error">{errors.firstName}</span>
              )}
            </label>
            <label className="settings-field">
              <span className="settings-label">Last name</span>
              <input
                className={`settings-input ${errors.lastName ? "settings-input--error" : ""}`}
                value={modal.draft.lastName}
                onChange={(event) =>
                  onChange({ ...modal.draft, lastName: event.target.value })
                }
              />
              {errors.lastName && (
                <span className="settings-error">{errors.lastName}</span>
              )}
            </label>
          </div>
        )}

        {modal.type === "dateOfBirth" && (
          <div className="settings-birth-modal">
            <div className="settings-birth-picker">
              <label className="settings-field">
                <span className="settings-label">Day</span>
                <PreferenceDropdown
                  value={modal.draft.day}
                  options={birthDayOptions}
                  open={openBirthDropdown === "day"}
                  onToggle={() =>
                    setOpenBirthDropdown((current) =>
                      current === "day" ? null : "day",
                    )
                  }
                  onClose={() => setOpenBirthDropdown(null)}
                  onSelect={(day) => {
                    onChange({ ...modal.draft, day });
                    setOpenBirthDropdown(null);
                  }}
                  placeholder="Day"
                  className={`settings-birth-dropdown ${
                    errors.day ? "settings-birth-dropdown--error" : ""
                  }`}
                  menuClassName="settings-birth-dropdown__menu"
                />
                {errors.day && (
                  <span className="settings-error">{errors.day}</span>
                )}
              </label>

              <label className="settings-field">
                <span className="settings-label">Month</span>
                <PreferenceDropdown
                  value={modal.draft.month}
                  options={birthMonthOptions}
                  open={openBirthDropdown === "month"}
                  onToggle={() =>
                    setOpenBirthDropdown((current) =>
                      current === "month" ? null : "month",
                    )
                  }
                  onClose={() => setOpenBirthDropdown(null)}
                  onSelect={(month) => {
                    onChange({ ...modal.draft, month });
                    setOpenBirthDropdown(null);
                  }}
                  placeholder="Month"
                  className={`settings-birth-dropdown ${
                    errors.month ? "settings-birth-dropdown--error" : ""
                  }`}
                  menuClassName="settings-birth-dropdown__menu"
                  getOptionValue={(month) => month.value}
                  getOptionLabel={(month) => month.label}
                />
                {errors.month && (
                  <span className="settings-error">{errors.month}</span>
                )}
              </label>

              <label className="settings-field">
                <span className="settings-label">Year</span>
                <PreferenceDropdown
                  value={modal.draft.year}
                  options={birthYearOptions}
                  open={openBirthDropdown === "year"}
                  onToggle={() =>
                    setOpenBirthDropdown((current) =>
                      current === "year" ? null : "year",
                    )
                  }
                  onClose={() => setOpenBirthDropdown(null)}
                  onSelect={(year) => {
                    onChange({ ...modal.draft, year });
                    setOpenBirthDropdown(null);
                  }}
                  placeholder="Year"
                  className={`settings-birth-dropdown ${
                    errors.year ? "settings-birth-dropdown--error" : ""
                  }`}
                  menuClassName="settings-birth-dropdown__menu"
                />
                {errors.year && (
                  <span className="settings-error">{errors.year}</span>
                )}
              </label>
            </div>

            <div className="settings-birth-note">
              We ask for this information to support account safety and future
              identity verification.
            </div>
          </div>
        )}

        {modal.type === "email" && (
          <div className="settings-modal-flow">
            {modal.draft.step === 2 && (
              <div className="settings-verification-card">
                <span>New email</span>
                <strong>{modal.draft.email}</strong>
              </div>
            )}

            {modal.draft.step === 1 ? (
              <label className="settings-field">
                <span className="settings-label">New email address</span>
                <input
                  className={`settings-input ${errors.email ? "settings-input--error" : ""}`}
                  type="email"
                  value={modal.draft.email}
                  onChange={(event) =>
                    onChange({ ...modal.draft, email: event.target.value })
                  }
                  autoFocus
                />
                {errors.email && (
                  <span className="settings-error">{errors.email}</span>
                )}
              </label>
            ) : (
              <label className="settings-field">
                <span className="settings-label">Verification code</span>
                <input
                  className={`settings-input ${errors.code ? "settings-input--error" : ""}`}
                  inputMode="numeric"
                  maxLength={6}
                  value={modal.draft.code}
                  onChange={(event) =>
                    onChange({
                      ...modal.draft,
                      code: event.target.value.replace(/\D/g, "").slice(0, 6),
                    })
                  }
                  placeholder="123456"
                  autoFocus
                />
                <span className="settings-helper">
                  For preview mode, use code 123456.
                </span>
                {errors.code && (
                  <span className="settings-error">{errors.code}</span>
                )}
              </label>
            )}
          </div>
        )}

        {modal.type === "phone" && (
          <div className="settings-modal-flow settings-phone-flow">
            {modal.draft.step === 2 && (
              <div className="settings-verification-card">
                <span>Phone number</span>
                <strong>{modal.draft.phone}</strong>
              </div>
            )}

            {modal.draft.step === 1 ? (
              <label className="settings-field">
                <span className="settings-label">Phone number</span>
                <input
                  className={`settings-input ${errors.phone ? "settings-input--error" : ""}`}
                  type="tel"
                  value={modal.draft.phone}
                  onChange={(event) =>
                    onChange({
                      ...modal.draft,
                      phone: event.target.value.replace(/[^\d\s()+-]/g, ""),
                    })
                  }
                  placeholder="+212 600 000 000"
                  autoFocus
                />
                {errors.phone && (
                  <span className="settings-error">{errors.phone}</span>
                )}
              </label>
            ) : (
              <label className="settings-field">
                <span className="settings-label">Verification code</span>
                <input
                  className={`settings-input ${errors.code ? "settings-input--error" : ""}`}
                  inputMode="numeric"
                  maxLength={6}
                  value={modal.draft.code}
                  onChange={(event) =>
                    onChange({
                      ...modal.draft,
                      code: event.target.value.replace(/\D/g, "").slice(0, 6),
                    })
                  }
                  placeholder="123456"
                  autoFocus
                />
                <span className="settings-helper">
                  For preview mode, use code 123456.
                </span>
                {errors.code && (
                  <span className="settings-error">{errors.code}</span>
                )}
              </label>
            )}
          </div>
        )}

        <div className="settings-modal__actions">
          <button
            className="settings-btn settings-btn--ghost"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="settings-btn settings-btn--primary"
            type="button"
            onClick={onSave}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AvatarPhotoModal({ photo, onClose, onSave }) {
  const [zoom, setZoom] = useState(photo?.zoom || 1);
  const [position, setPosition] = useState({
    x: photo?.positionX || 0,
    y: photo?.positionY || 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  if (!photo) return null;

  const getPoint = (event) => {
    const touch = event.touches?.[0];
    return touch
      ? { x: touch.clientX, y: touch.clientY }
      : { x: event.clientX, y: event.clientY };
  };

  const handleDragStart = (event) => {
    event.preventDefault();
    setIsDragging(true);
    setDragStart(getPoint(event));
  };

  const handleDragMove = (event) => {
    if (!isDragging || !dragStart) return;
    event.preventDefault();
    const nextPoint = getPoint(event);
    setPosition((current) => ({
      x: current.x + nextPoint.x - dragStart.x,
      y: current.y + nextPoint.y - dragStart.y,
    }));
    setDragStart(nextPoint);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const resetCrop = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    handleDragEnd();
  };

  return (
    <div
      className="settings-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="settings-modal settings-avatar-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-avatar-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="settings-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>
        <h3 id="settings-avatar-modal-title">Preview profile photo</h3>
        <p>Drag to reposition your photo. Use the slider to zoom.</p>

        <div
          className={`settings-avatar-preview ${
            isDragging ? "settings-avatar-preview--dragging" : ""
          }`}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <img
            src={photo.url}
            alt="Selected profile preview"
            draggable="false"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          />
        </div>
        <span className="settings-avatar-crop-hint">
          Move image inside the circle
        </span>

        <label className="settings-field settings-zoom-field">
          <span className="settings-label">Zoom</span>
          <input
            type="range"
            min="1"
            max="2"
            step="0.05"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>

        <div className="settings-modal__actions">
          <button
            className="settings-btn settings-btn--ghost"
            type="button"
            onClick={resetCrop}
          >
            Reset
          </button>
          <button
            className="settings-btn settings-btn--ghost"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="settings-btn settings-btn--primary"
            type="button"
            onClick={() =>
              onSave({
                ...photo,
                zoom,
                positionX: position.x,
                positionY: position.y,
              })
            }
          >
            Save photo
          </button>
        </div>
      </div>
    </div>
  );
}

function DeactivateAccountModal({ onClose, onConfirm }) {
  return (
    <div
      className="settings-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="settings-modal settings-deactivate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-deactivate-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="settings-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>
        <h3 id="settings-deactivate-modal-title">Deactivate account?</h3>
        <p>
          Your profile and listings will be hidden in preview mode. You can
          reactivate later when backend integration is added.
        </p>
        <div className="settings-modal__actions">
          <button
            className="settings-btn settings-btn--ghost"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="settings-btn settings-btn--warning"
            type="button"
            onClick={onConfirm}
          >
            Deactivate account
          </button>
        </div>
      </div>
    </div>
  );
}

function StartHostingModal({ onClose, onContinue }) {
  return (
    <div
      className="settings-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="settings-modal settings-hosting-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-hosting-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="settings-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>
        <span className="settings-hosting-modal__eyebrow">Host onboarding</span>
        <h3 id="settings-hosting-modal-title">Start hosting on DarDarek</h3>
        <p>
          Before you publish your first property, DarDarek will guide you
          through a few simple steps.
        </p>

        <div className="settings-hosting-modal__checklist">
          {hostingModalChecklist.map((item) => (
            <div className="settings-hosting-modal__item" key={item}>
              <FiCheck aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="settings-hosting-modal__note">
          For this frontend preview, continuing will enable host mode locally.
          Backend verification will be added later.
        </div>

        <div className="settings-modal__actions">
          <button
            className="settings-btn settings-btn--ghost"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="settings-btn settings-btn--primary"
            type="button"
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodPreviewModal({ onClose }) {
  return (
    <div
      className="settings-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="settings-modal settings-payment-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-payment-preview-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="settings-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>
        <h3 id="settings-payment-preview-title">Add payment method</h3>
        <p>
          Online payments will be available after backend and payment provider
          integration.
        </p>

        <div className="settings-payment-preview-fields">
          <label className="settings-field">
            <span className="settings-label">Cardholder name</span>
            <input
              className="settings-input"
              placeholder="Preview only"
              disabled
              readOnly
            />
          </label>
          <label className="settings-field">
            <span className="settings-label">Card number</span>
            <input
              className="settings-input"
              placeholder="0000 0000 0000 0000"
              disabled
              readOnly
            />
          </label>
          <div className="settings-payment-preview-row">
            <label className="settings-field">
              <span className="settings-label">Expiry date</span>
              <input
                className="settings-input"
                placeholder="MM / YY"
                disabled
                readOnly
              />
            </label>
            <label className="settings-field">
              <span className="settings-label">CVC</span>
              <input
                className="settings-input"
                placeholder="000"
                disabled
                readOnly
              />
            </label>
          </div>
        </div>

        <div className="settings-payment-preview-note">
          Do not enter real card details. This is a UI preview only.
        </div>

        <div className="settings-modal__actions">
          <button
            className="settings-btn settings-btn--ghost"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="settings-btn settings-btn--primary"
            type="button"
            onClick={onClose}
          >
            Continue later
          </button>
        </div>
      </div>
    </div>
  );
}

function PayoutSetupPreviewModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("Morocco");
  const [method, setMethod] = useState("Bank account");

  const previewFields =
    method === "Bank account"
      ? [
          "Account holder name",
          "Bank name",
          "Account number placeholder",
          "RIB/IBAN placeholder",
        ]
      : [
          "Account holder name",
          `${method} account placeholder`,
          "Confirmation contact placeholder",
        ];

  return (
    <div
      className="settings-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="settings-modal settings-payout-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-payout-preview-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="settings-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>
        <h3 id="settings-payout-preview-title">Set up payout method</h3>
        <p>
          Preview the future payout setup flow without storing financial
          information.
        </p>

        <div className="settings-payout-steps" aria-label="Payout setup step">
          {[1, 2, 3].map((item) => (
            <span
              className={`settings-payout-step ${
                item <= step ? "settings-payout-step--active" : ""
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>

        {step === 1 && (
          <div className="settings-payout-flow">
            <h4>Choose billing country/region</h4>
            <div className="settings-payout-choice-grid">
              {billingCountryOptions.map((option) => (
                <button
                  className={`settings-payout-choice ${
                    country === option ? "settings-payout-choice--active" : ""
                  }`}
                  key={option}
                  type="button"
                  onClick={() => setCountry(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="settings-payout-flow">
            <h4>Choose payout method</h4>
            <div className="settings-payout-choice-grid">
              {payoutMethodOptions.map((option) => (
                <button
                  className={`settings-payout-choice ${
                    method === option ? "settings-payout-choice--active" : ""
                  }`}
                  key={option}
                  type="button"
                  onClick={() => setMethod(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="settings-payout-flow">
            <h4>{method} preview fields</h4>
            <div className="settings-payment-preview-fields">
              {previewFields.map((field) => (
                <label className="settings-field" key={field}>
                  <span className="settings-label">{field}</span>
                  <input
                    className="settings-input"
                    placeholder="Preview only"
                    disabled
                    readOnly
                  />
                </label>
              ))}
            </div>
            <div className="settings-payment-preview-note">
              Real payout setup will require backend verification and may show
              pending status.
            </div>
          </div>
        )}

        <div className="settings-modal__actions">
          {step > 1 && (
            <button
              className="settings-btn settings-btn--ghost"
              type="button"
              onClick={() => setStep((current) => current - 1)}
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              className="settings-btn settings-btn--primary"
              type="button"
              onClick={() => setStep((current) => current + 1)}
            >
              Next
            </button>
          ) : (
            <button
              className="settings-btn settings-btn--primary"
              type="button"
              onClick={onClose}
            >
              Close preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  title,
  description,
  value,
  actionLabel,
  onAction,
  children,
  isEditing,
}) {
  const isEmptyValue = !value || !String(value).trim();

  return (
    <div
      className={`settings-profile-row ${isEditing ? "settings-profile-row--editing" : ""}`}
    >
      <div className="settings-profile-row__copy">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div
        className={`settings-profile-row__value ${
          isEmptyValue ? "settings-profile-row__value--empty" : ""
        }`}
      >
        {formatValue(value)}
      </div>
      {actionLabel && onAction && (
        <button className="settings-link-btn" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  );
}

function ProfileFieldCard({ title, description, fullWidth = false, children }) {
  return (
    <div
      className={`settings-profile-field ${fullWidth ? "settings-profile-field--full" : ""}`}
    >
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}

function SuggestionList({ suggestions, onSelect }) {
  if (!suggestions.length) return null;

  return (
    <div className="settings-suggestions" role="listbox">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          role="option"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

function PreferenceDropdown({
  value,
  options,
  open,
  onToggle,
  onClose,
  onSelect,
  getOptionValue = (option) => option,
  getOptionLabel = (option) => option,
  placeholder = "Select",
  className = "",
  menuClassName = "",
}) {
  const selectedOption =
    options.find((option) => getOptionValue(option) === value) || value;
  const selectedLabel =
    value === "" || value === null || value === undefined
      ? placeholder
      : typeof selectedOption === "string"
      ? selectedOption
      : getOptionLabel(selectedOption);

  return (
    <div
      className={`settings-preference-dropdown ${
        open ? "settings-preference-dropdown--open" : ""
      } ${className}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onClose();
        }
      }}
    >
      <button
        className="settings-preference-dropdown__button"
        type="button"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span
          className={
            value === "" || value === null || value === undefined
              ? "settings-preference-dropdown__placeholder"
              : ""
          }
        >
          {selectedLabel}
        </span>
        <FiChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div
          className={`settings-preference-dropdown__menu ${menuClassName}`}
          role="listbox"
        >
          {options.map((option) => {
            const optionValue = getOptionValue(option);
            const optionLabel = getOptionLabel(option);
            return (
              <button
                className={`settings-preference-dropdown__option ${
                  optionValue === value
                    ? "settings-preference-dropdown__option--active"
                    : ""
                }`}
                key={optionValue}
                type="button"
                role="option"
                aria-selected={optionValue === value}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(optionValue)}
              >
                {optionLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PasswordStrength({ password }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="password-strength-wrap settings-password-strength">
      <div className="password-strength-track">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`password-strength-bar ${bar <= strength.score ? "is-active" : ""}`}
          />
        ))}
      </div>
      <span
        className={`password-strength password-strength--${strength.className}`}
      >
        {strength.label}
      </span>
    </div>
  );
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const avatarPhotoUrlRef = useRef(null);
  const avatarPreviewUrlRef = useRef(null);
  const { token, user: ctxUser, setUser } = useToken();
  const storedUser = parseStoredUser();
  const rawUser = ctxUser || storedUser || MOCK_USER;

  const [activeSection, setActiveSection] = useState("profile");
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountRole, setAccountRole] = useState(rawUser.role || "user");
  const [hasPassword, setHasPassword] = useState(
    rawUser.has_password ?? rawUser.hasPassword ?? true,
  );
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [modalErrors, setModalErrors] = useState({});
  const [nationalityFocused, setNationalityFocused] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");
  const [languageFocused, setLanguageFocused] = useState(false);
  const [avatarPhoto, setAvatarPhoto] = useState(null);
  const [avatarModal, setAvatarModal] = useState(null);
  const [emergencyVerification, setEmergencyVerification] = useState({
    step: "idle",
    code: "",
    verified: false,
    error: "",
  });

  const [profile, setProfile] = useState({
    name: rawUser.name || "",
    email: rawUser.email || "",
    phone: rawUser.phone_number || rawUser.phone || "",
    dateOfBirth: normalizeAccountDate(rawUser.date_of_birth || rawUser.dateOfBirth),
    nationality: rawUser.nationality || "",
    languages: parseAccountLanguages(rawUser.languages),
    contactMethod: rawUser.preferred_contact || "Email",
    emergencyContact: rawUser.emergency_contact || "",
    bio: rawUser.bio || "",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  const [notifications, setNotifications] = useState({
    categories: {
      bookingUpdates: true,
      messages: true,
      rentalRequests: true,
      reviewsReminders: true,
      promotions: false,
      securityAlerts: true,
    },
    channels: {
      email: true,
      sms: false,
      push: true,
    },
  });

  const [hosting, setHosting] = useState({
    hostMode: rawUser.role === "host" || rawUser.role === "admin",
  });
  const [startHostingModalOpen, setStartHostingModalOpen] = useState(false);

  const [preferences, setPreferences] = useState({
    language: rawUser.preferred_language || "English",
    currency: rawUser.preferred_currency || "MAD",
    preferredCity: rawUser.preferred_city || "Tangier",
    stayType: rawUser.preferred_stay_type || "Apartment",
  });
  const [citySearch, setCitySearch] = useState("");
  const [cityFocused, setCityFocused] = useState(false);
  const [openPreferenceDropdown, setOpenPreferenceDropdown] = useState(null);

  const [billing, setBilling] = useState({
    billingName: rawUser.billing_name || rawUser.name || "",
    address: rawUser.billing_address || "",
    city: rawUser.billing_city || "",
    postalCode: rawUser.billing_postal_code || "",
    country: rawUser.billing_country || "Morocco",
  });
  const [paymentPreviewOpen, setPaymentPreviewOpen] = useState(false);
  const [payoutPreviewOpen, setPayoutPreviewOpen] = useState(false);
  const isHost = accountRole === "host" || accountRole === "admin";

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewUrlRef.current);
      }
      if (avatarPhotoUrlRef.current) {
        URL.revokeObjectURL(avatarPhotoUrlRef.current);
      }
    };
  }, []);

  const profileCompletion = useMemo(() => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.dateOfBirth,
      profile.nationality,
      profile.languages.length > 0 ? "languages" : "",
      profile.contactMethod,
      profile.emergencyContact,
      profile.bio,
    ];
    const filled = fields.filter((value) => String(value || "").trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const securityStatusRows = useMemo(
    () => [
      {
        label: "Password login",
        status: hasPassword ? "Enabled" : "Not enabled",
        tone: hasPassword ? "verified" : "pending",
      },
      {
        label: "Email verification",
        status: profile.email ? "Verified" : "Pending",
        tone: profile.email ? "verified" : "pending",
      },
      {
        label: "Phone verification",
        status: profile.phone ? "Verified" : "Pending",
        tone: profile.phone ? "verified" : "pending",
      },
    ],
    [hasPassword, profile.email, profile.phone],
  );

  const filteredPreferenceCities = useMemo(() => {
    const query = citySearch.trim().toLowerCase();
    if (!query) return commonPreferenceCities;
    return preferenceCityOptions.filter((city) =>
      city.toLowerCase().includes(query),
    );
  }, [citySearch]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const accountRequest = async (path, options = {}) => {
    if (!token) {
      throw new Error("Please sign in again to update account settings.");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Could not update account settings.");
    }

    return data;
  };

  const syncStoredUser = (accountUser) => {
    const nextStoredUser = {
      ...(ctxUser || storedUser || {}),
      id: accountUser.id_user,
      id_user: accountUser.id_user,
      name: accountUser.name,
      email: accountUser.email,
      role: accountUser.role,
      has_password: accountUser.has_password,
    };

    localStorage.setItem("user", JSON.stringify(nextStoredUser));
    setUser(nextStoredUser);
  };

  const applyAccountUser = (accountUser) => {
    if (!accountUser) return;

    setProfile({
      name: accountUser.name || "",
      email: accountUser.email || "",
      phone: accountUser.phone_number || "",
      dateOfBirth: normalizeAccountDate(accountUser.date_of_birth),
      nationality: accountUser.nationality || "",
      languages: parseAccountLanguages(accountUser.languages),
      contactMethod: accountUser.preferred_contact || "Email",
      emergencyContact: accountUser.emergency_contact || "",
      bio: accountUser.bio || "",
    });

    setPreferences({
      language: accountUser.preferred_language || "English",
      currency: accountUser.preferred_currency || "MAD",
      preferredCity: accountUser.preferred_city || "Tangier",
      stayType: accountUser.preferred_stay_type || "Apartment",
    });

    setBilling({
      billingName: accountUser.billing_name || accountUser.name || "",
      address: accountUser.billing_address || "",
      city: accountUser.billing_city || "",
      postalCode: accountUser.billing_postal_code || "",
      country: accountUser.billing_country || "Morocco",
    });

    setAccountRole(accountUser.role || "user");
    setHasPassword(Boolean(accountUser.has_password));
    setHosting({ hostMode: accountUser.role === "host" || accountUser.role === "admin" });

    const profilePictureUrl = normalizeProfilePictureUrl(
      accountUser.profile_picture,
    );
    setAvatarPhoto(
      profilePictureUrl
        ? { url: profilePictureUrl, zoom: 1, positionX: 0, positionY: 0 }
        : null,
    );
    syncStoredUser(accountUser);
  };

  useEffect(() => {
    let isMounted = true;

    const loadAccountSettings = async () => {
      if (!token) {
        setAccountLoading(false);
        return;
      }

      try {
        setAccountLoading(true);
        const data = await accountRequest("/api/users/me");
        if (isMounted) {
          applyAccountUser(data.user);
        }
      } catch {
        if (isMounted) {
          showToast("Could not load account settings.", "warning");
        }
      } finally {
        if (isMounted) {
          setAccountLoading(false);
        }
      }
    };

    loadAccountSettings();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleDone = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  const sanitizePhoneInput = (value) => value.replace(/[^\d\s()+-]/g, "");

  const isValidPhone = (value) =>
    /^[\d\s()+-]+$/.test(value) && value.replace(/\D/g, "").length >= 7;

  const nationalitySuggestions = NATIONALITY_OPTIONS.filter((option) =>
    option.toLowerCase().includes(profile.nationality.trim().toLowerCase()),
  );

  const languageSuggestions = LANGUAGE_OPTIONS.filter(
    (language) =>
      !profile.languages.includes(language) &&
      language.toLowerCase().includes(languageQuery.trim().toLowerCase()),
  );
  const emergencyContactError =
    profile.emergencyContact &&
    profile.emergencyContact.replace(/\D/g, "").length < 7;

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (avatarPreviewUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewUrlRef.current);
    }
    const nextUrl = URL.createObjectURL(file);
    avatarPreviewUrlRef.current = nextUrl;
    setAvatarModal({ url: nextUrl, zoom: 1, positionX: 0, positionY: 0 });
    event.target.value = "";
  };

  const closeAvatarModal = () => {
    if (avatarPreviewUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewUrlRef.current);
      avatarPreviewUrlRef.current = null;
    }
    setAvatarModal(null);
  };

  const saveAvatarPhoto = (adjustedPhoto) => {
    if (!adjustedPhoto) return;
    if (avatarPhotoUrlRef.current) {
      URL.revokeObjectURL(avatarPhotoUrlRef.current);
    }
    avatarPhotoUrlRef.current = adjustedPhoto.url;
    avatarPreviewUrlRef.current = null;
    setAvatarPhoto(adjustedPhoto);
    setAvatarModal(null);
    showToast("Profile photo updated.");
  };

  const startEmergencyVerification = () => {
    if (!isValidPhone(profile.emergencyContact)) {
      setEmergencyVerification({
        step: "idle",
        code: "",
        verified: false,
        error: "Enter a valid emergency phone number before verifying.",
      });
      return;
    }

    setEmergencyVerification({
      step: "code",
      code: "",
      verified: false,
      error: "",
    });
  };

  const verifyEmergencyContact = () => {
    if (emergencyVerification.code !== "123456") {
      setEmergencyVerification((current) => ({
        ...current,
        error: "Invalid verification code. Use 123456 for preview.",
      }));
      return;
    }

    setEmergencyVerification({
      step: "verified",
      code: "",
      verified: true,
      error: "",
    });
  };

  const addLanguage = (language) => {
    setProfile((current) => ({
      ...current,
      languages: current.languages.includes(language)
        ? current.languages
        : [...current.languages, language],
    }));
    setLanguageQuery("");
  };

  const removeLanguage = (language) => {
    setProfile((current) => ({
      ...current,
      languages: current.languages.filter((item) => item !== language),
    }));
  };

  const openProfileModal = (type) => {
    const currentBirth = profile.dateOfBirth || "";
    const [birthYear = "", birthMonth = "", birthDay = ""] =
      currentBirth.split("-");

    const draft =
      type === "name"
        ? splitName(profile.name)
        : type === "email"
          ? { email: profile.email, step: 1, code: "" }
          : type === "phone"
            ? { phone: profile.phone, step: 1, code: "" }
            : {
                day: birthDay,
                month: birthMonth,
                year: birthYear,
              };

    setModal({ type, draft });
    setModalErrors({});
  };

  const saveProfileModal = async () => {
    const errors = {};
    if (modal.type === "name") {
      if (!modal.draft.firstName.trim())
        errors.firstName = "First name is required.";
      if (!modal.draft.lastName.trim())
        errors.lastName = "Last name is required.";
    }
    if (modal.type === "email") {
      if (modal.draft.step === 1) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modal.draft.email)) {
          errors.email = "Please enter a valid email address.";
        }
        setModalErrors(errors);
        if (Object.keys(errors).length) return;
        setModal((current) => ({
          ...current,
          draft: { ...current.draft, step: 2, code: "" },
        }));
        return;
      }

      if (!/^\d{6}$/.test(modal.draft.code)) {
        errors.code = "Enter the 6-digit verification code.";
      } else if (modal.draft.code !== "123456") {
        errors.code = "Invalid verification code. Use 123456 for preview.";
      }
    }
    if (modal.type === "phone") {
      if (modal.draft.step === 1) {
        if (!isValidPhone(modal.draft.phone)) {
          errors.phone =
            "Enter a valid phone number using numbers and phone symbols only.";
        }
        setModalErrors(errors);
        if (Object.keys(errors).length) return;
        setModal((current) => ({
          ...current,
          draft: { ...current.draft, step: 2, code: "" },
        }));
        return;
      }

      if (!/^\d{6}$/.test(modal.draft.code)) {
        errors.code = "Enter the 6-digit verification code.";
      } else if (modal.draft.code !== "123456") {
        errors.code = "Invalid verification code. Use 123456 for preview.";
      }
    }

    if (modal.type === "dateOfBirth") {
      if (!modal.draft.day) errors.day = "Day is required.";
      if (!modal.draft.month) errors.month = "Month is required.";
      if (!modal.draft.year) errors.year = "Year is required.";

      if (!Object.keys(errors).length) {
        const selectedDate = new Date(
          Number(modal.draft.year),
          Number(modal.draft.month) - 1,
          Number(modal.draft.day),
        );

        const isInvalidDate =
          selectedDate.getFullYear() !== Number(modal.draft.year) ||
          selectedDate.getMonth() !== Number(modal.draft.month) - 1 ||
          selectedDate.getDate() !== Number(modal.draft.day);

        const today = new Date();
        const age =
          today.getFullYear() -
          selectedDate.getFullYear() -
          (today <
          new Date(
            today.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
          )
            ? 1
            : 0);

        if (isInvalidDate) {
          errors.day = "Please choose a valid date.";
        } else if (age < 18) {
          errors.year = "You must be at least 18 years old.";
        }
      }
    }

    setModalErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      let data;

      if (modal.type === "name") {
        data = await accountRequest("/api/users/profile", {
          method: "PUT",
          body: JSON.stringify({
            name: `${modal.draft.firstName.trim()} ${modal.draft.lastName.trim()}`,
          }),
        });
      } else if (modal.type === "email") {
        data = await accountRequest("/api/users/email", {
          method: "PUT",
          body: JSON.stringify({ email: modal.draft.email }),
        });
      } else if (modal.type === "phone") {
        data = await accountRequest("/api/users/profile", {
          method: "PUT",
          body: JSON.stringify({ phone_number: modal.draft.phone.trim() }),
        });
      } else if (modal.type === "dateOfBirth") {
        data = await accountRequest("/api/users/profile", {
          method: "PUT",
          body: JSON.stringify({
            date_of_birth: `${modal.draft.year}-${modal.draft.month}-${modal.draft.day}`,
          }),
        });
      }

      applyAccountUser(data?.user);
      setModal(null);
      showToast(
        modal.type === "email"
          ? "Email address verified and updated."
          : modal.type === "phone"
            ? "Phone number verified and updated."
            : modal.type === "dateOfBirth"
              ? "Date of birth updated."
              : "Profile detail updated.",
      );
    } catch (error) {
      showToast(error.message || "Could not update account settings.", "warning");
    }
  };

  const getPasswordErrors = (values) => {
    const errors = {};
    if (hasPassword && !values.currentPassword)
      errors.currentPassword = "Current password is required.";
    if (values.newPassword.length < 8)
      errors.newPassword = "Password must be at least 8 characters.";
    if (
      values.confirmPassword &&
      values.newPassword !== values.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (!values.confirmPassword)
      errors.confirmPassword = "Confirm your new password.";
    return errors;
  };

  const validatePassword = (nextSecurity = security) => {
    const errors = getPasswordErrors(nextSecurity);
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const savePassword = async () => {
    setPasswordTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });
    if (!validatePassword()) return;

    try {
      const passwordPath = hasPassword
        ? "/api/users/change-password"
        : "/api/users/create-password";
      const passwordBody = hasPassword
        ? {
            currentPassword: security.currentPassword,
            newPassword: security.newPassword,
          }
        : { newPassword: security.newPassword };

      const data = await accountRequest(passwordPath, {
        method: "PUT",
        body: JSON.stringify(passwordBody),
      });
      if (data?.has_password) {
        setHasPassword(true);
      }
      setSecurity({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      setPasswordTouched({});
      showToast(
        hasPassword
          ? "Password updated successfully."
          : "Password login enabled for this account.",
      );
    } catch (error) {
      showToast(error.message || "Could not update password.", "warning");
    }
  };

  const confirmDeactivateAccount = () => {
    setDeactivateModalOpen(false);
    showToast("Account deactivation is disabled in preview mode.", "warning");
  };

  const updateNotificationCategory = (categoryKey, value) => {
    setNotifications((current) => ({
      ...current,
      categories: {
        ...current.categories,
        [categoryKey]: value,
      },
    }));
  };

  const updateNotificationChannel = (channelKey, value) => {
    setNotifications((current) => ({
      ...current,
      channels: {
        ...current.channels,
        [channelKey]: value,
      },
    }));
  };

  const hostModeActive = isHost || hosting.hostMode;

  const continueHostOnboarding = async () => {
    try {
      const data = await accountRequest("/api/users/become-host", {
        method: "PUT",
      });
      const nextRole = data.role || "host";
      setAccountRole(nextRole);
      setHosting((current) => ({ ...current, hostMode: true }));
      setStartHostingModalOpen(false);

      const nextStoredUser = {
        ...(ctxUser || storedUser || {}),
        role: nextRole,
      };
      localStorage.setItem("user", JSON.stringify(nextStoredUser));
      setUser(nextStoredUser);
      showToast("Host mode enabled.");
    } catch (error) {
      showToast(error.message || "Could not enable host mode.", "warning");
    }
  };

  const saveNotificationPreferences = () => {
    showToast("Notification preferences saved for preview.");
  };

  const saveProfileDetails = async () => {
    if (emergencyContactError) {
      showToast("Enter a valid emergency phone number.", "warning");
      return;
    }

    try {
      const data = await accountRequest("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          bio: profile.bio,
          nationality: profile.nationality,
          languages: profile.languages,
          preferred_contact: profile.contactMethod,
          emergency_contact: profile.emergencyContact,
        }),
      });
      applyAccountUser(data.user);
      showToast("Profile details saved.");
    } catch (error) {
      showToast(error.message || "Could not save profile details.", "warning");
    }
  };

  const savePreferences = async () => {
    try {
      const data = await accountRequest("/api/users/preferences", {
        method: "PUT",
        body: JSON.stringify({
          preferred_language: preferences.language,
          preferred_currency: preferences.currency,
          preferred_city: preferences.preferredCity,
          preferred_stay_type: preferences.stayType,
        }),
      });
      applyAccountUser(data.user);
      showToast("Preferences saved.");
    } catch (error) {
      showToast(error.message || "Could not save preferences.", "warning");
    }
  };

  const saveBillingInformation = async () => {
    try {
      const data = await accountRequest("/api/users/billing", {
        method: "PUT",
        body: JSON.stringify({
          billing_name: billing.billingName,
          billing_address: billing.address,
          billing_city: billing.city,
          billing_postal_code: billing.postalCode,
          billing_country: billing.country,
        }),
      });
      applyAccountUser(data.user);
      showToast("Billing information saved.");
    } catch (error) {
      showToast(
        error.message || "Could not save billing information.",
        "warning",
      );
    }
  };

  const closePaymentPreview = () => {
    setPaymentPreviewOpen(false);
    showToast("Payment method setup will be connected later.");
  };

  const closePayoutPreview = () => {
    setPayoutPreviewOpen(false);
    showToast("Payout method setup will be connected later.");
  };

  const isPasswordReady =
    (!hasPassword || security.currentPassword.trim()) &&
    security.newPassword.trim() &&
    security.confirmPassword.trim();

  const renderPasswordField = (key, label) => {
    const isConfirm = key === "confirmPassword";
    const shouldShowFeedback = Boolean(passwordTouched[key]);
    const hasMatch =
      isConfirm &&
      shouldShowFeedback &&
      security.confirmPassword &&
      security.confirmPassword === security.newPassword;
    const hasMismatch =
      isConfirm &&
      shouldShowFeedback &&
      security.confirmPassword &&
      security.confirmPassword !== security.newPassword;
    const visibleError = shouldShowFeedback ? passwordErrors[key] : "";

    return (
      <label className="settings-field">
        <span className="settings-label">{label}</span>
        <div className="settings-password-input">
          <input
            className={`settings-input ${visibleError || hasMismatch ? "settings-input--error" : ""} ${
              hasMatch ? "settings-input--success" : ""
            }`}
            type={showPassword[key] ? "text" : "password"}
            value={security[key]}
            onChange={(event) => {
              const next = { ...security, [key]: event.target.value };
              setSecurity(next);
              setPasswordErrors(getPasswordErrors(next));
            }}
            onBlur={() => {
              setPasswordTouched((current) => ({ ...current, [key]: true }));
              validatePassword();
            }}
            placeholder={label}
          />
          <button
            type="button"
            onClick={() =>
              setShowPassword((current) => ({
                ...current,
                [key]: !current[key],
              }))
            }
          >
            {showPassword[key] ? "Hide" : "Show"}
          </button>
        </div>
        {key === "newPassword" && (
          <PasswordStrength password={security.newPassword} />
        )}
        {visibleError && <span className="settings-error">{visibleError}</span>}
        {hasMatch && (
          <span className="settings-success-inline">Passwords match.</span>
        )}
        {hasMismatch && (
          <span className="settings-error">Passwords do not match.</span>
        )}
      </label>
    );
  };

  return (
    <div className="account-settings-page">
      <Toast toast={toast} />
      <SettingsModal
        modal={modal}
        errors={modalErrors}
        onChange={(draft) => setModal((current) => ({ ...current, draft }))}
        onClose={() => setModal(null)}
        onSave={saveProfileModal}
      />
      {startHostingModalOpen && (
        <StartHostingModal
          onClose={() => setStartHostingModalOpen(false)}
          onContinue={continueHostOnboarding}
        />
      )}
      {deactivateModalOpen && (
        <DeactivateAccountModal
          onClose={() => setDeactivateModalOpen(false)}
          onConfirm={confirmDeactivateAccount}
        />
      )}
      {paymentPreviewOpen && (
        <PaymentMethodPreviewModal onClose={closePaymentPreview} />
      )}
      {payoutPreviewOpen && (
        <PayoutSetupPreviewModal onClose={closePayoutPreview} />
      )}
      {avatarModal && (
        <AvatarPhotoModal
          key={avatarModal.url}
          photo={avatarModal}
          onClose={closeAvatarModal}
          onSave={saveAvatarPhoto}
        />
      )}

      <div className="account-settings-wrapper">
        <header className="account-settings-header-card">
          <div className="account-settings-avatar-wrap">
            <div className="account-settings-avatar">
              {avatarPhoto ? (
                <img
                  src={avatarPhoto.url}
                  alt="Profile"
                  style={{
                    transform: `translate(${avatarPhoto.positionX}px, ${avatarPhoto.positionY}px) scale(${avatarPhoto.zoom})`,
                  }}
                />
              ) : (
                getInitials(profile.name || rawUser.name) || "DD"
              )}
            </div>
            <input
              ref={avatarInputRef}
              className="account-settings-avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
            />
            <button
              className="account-settings-camera"
              type="button"
              aria-label="Update profile photo"
              onClick={() => avatarInputRef.current?.click()}
            >
              <FiCamera aria-hidden="true" />
            </button>
          </div>

          <div className="account-settings-header-info">
            <div className="account-settings-header-top">
              <h2 className="account-settings-username">
                {profile.name || "Your name"}
              </h2>
              {isHost && <span className="settings-role-badge">Host</span>}
            </div>
            <p className="account-settings-email">{profile.email}</p>
            <p className="account-settings-tagline">
              Manage your personal data, privacy, and account preferences.
            </p>
          </div>

          <div
            className="settings-progress-wrap"
            aria-label={`Profile completion ${profileCompletion}%`}
          >
            <span className="settings-progress-label">Profile completion</span>
            <div className="settings-progress-bar">
              <span
                className="settings-progress-fill"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <strong>{profileCompletion}%</strong>
          </div>

          <button
            className="settings-btn settings-btn--done"
            type="button"
            onClick={handleDone}
          >
            Done
          </button>
        </header>

        <div className="account-settings-body">
          <nav
            className="account-settings-sidebar"
            aria-label="Account settings sections"
          >
            {SECTIONS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={`settings-nav-item ${activeSection === id ? "settings-nav-item--active" : ""}`}
                onClick={() => setActiveSection(id)}
              >
                {createElement(Icon, { "aria-hidden": "true" })}
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <main className="account-settings-content">
            {accountLoading ? (
              <section className="settings-section">
                <div className="settings-card">
                  <div className="settings-card__head">
                    <div className="settings-card__icon">
                      <FiSettings aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="settings-card-title">
                        Loading account settings
                      </h4>
                      <p className="settings-helper">
                        Your account details are being loaded.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <>
            {activeSection === "profile" && (
              <section className="settings-section">
                <div className="settings-section__head">
                  <h3 className="settings-section-title">Profile</h3>
                  <p className="settings-section-subtitle">
                    The information guests and hosts use to know you.
                  </p>
                </div>

                <div className="settings-card settings-profile-list">
                  <ProfileRow
                    title="Full name"
                    description="Use your legal name for smoother verification."
                    value={profile.name}
                    actionLabel="Edit"
                    onAction={() => openProfileModal("name")}
                  />
                  <ProfileRow
                    title="Email"
                    description="Used for bookings, receipts, and security alerts."
                    value={profile.email}
                    actionLabel="Edit"
                    onAction={() => openProfileModal("email")}
                  />
                  <ProfileRow
                    title="Phone number"
                    description="Used for communication between confirmed guests and hosts."
                    value={profile.phone}
                    actionLabel="Edit"
                    onAction={() => openProfileModal("phone")}
                  />
                  <ProfileRow
                    title="Date of birth"
                    description="Used for trust, safety, and future identity verification."
                    value={formatDateOfBirth(profile.dateOfBirth)}
                    actionLabel={profile.dateOfBirth ? "Edit" : "Add"}
                    onAction={() => openProfileModal("dateOfBirth")}
                  />
                </div>

                <div className="settings-card settings-profile-direct-card">
                  <div className="settings-profile-direct-grid">
                    <ProfileFieldCard
                      title="Nationality"
                      description="Select the nationality shown on your profile."
                    >
                      <div className="settings-combobox">
                        <input
                          className="settings-input"
                          value={profile.nationality}
                          onFocus={() => setNationalityFocused(true)}
                          onBlur={() => setNationalityFocused(false)}
                          onChange={(event) =>
                            setProfile({
                              ...profile,
                              nationality: event.target.value,
                            })
                          }
                          placeholder="Search nationality"
                        />
                        {nationalityFocused && (
                          <SuggestionList
                            suggestions={nationalitySuggestions}
                            onSelect={(nationality) => {
                              setProfile({ ...profile, nationality });
                              setNationalityFocused(false);
                            }}
                          />
                        )}
                      </div>
                    </ProfileFieldCard>

                    <ProfileFieldCard
                      title="Languages spoken"
                      description="Add languages guests and hosts can use with you."
                    >
                      <div className="settings-chip-picker">
                        <div className="settings-chip-list">
                          {profile.languages.map((language) => (
                            <span className="settings-chip" key={language}>
                              {language}
                              <button
                                type="button"
                                onClick={() => removeLanguage(language)}
                                aria-label={`Remove ${language}`}
                              >
                                <FiX aria-hidden="true" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="settings-combobox">
                          <input
                            className="settings-input"
                            value={languageQuery}
                            onFocus={() => setLanguageFocused(true)}
                            onBlur={() => setLanguageFocused(false)}
                            onChange={(event) =>
                              setLanguageQuery(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" &&
                                languageSuggestions[0]
                              ) {
                                event.preventDefault();
                                addLanguage(languageSuggestions[0]);
                              }
                            }}
                            placeholder="Search languages"
                          />
                          {languageFocused && (
                            <SuggestionList
                              suggestions={languageSuggestions}
                              onSelect={addLanguage}
                            />
                          )}
                        </div>
                      </div>
                    </ProfileFieldCard>

                    <ProfileFieldCard
                      title="Preferred contact"
                      description="Choose how DarDarek should reach you first."
                    >
                      <div
                        className="settings-segmented"
                        role="radiogroup"
                        aria-label="Preferred contact"
                      >
                        {CONTACT_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={
                              profile.contactMethod === option
                                ? "settings-segmented__option settings-segmented__option--active"
                                : "settings-segmented__option"
                            }
                            role="radio"
                            aria-checked={profile.contactMethod === option}
                            onClick={() =>
                              setProfile({
                                ...profile,
                                contactMethod: option,
                              })
                            }
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </ProfileFieldCard>

                    <ProfileFieldCard
                      title="Emergency contact"
                      description="Used only for urgent booking or safety situations."
                    >
                      <div className="settings-emergency-contact">
                        <div className="settings-emergency-contact__row">
                          <input
                            className={`settings-input ${
                              emergencyContactError ||
                              (emergencyVerification.error &&
                                emergencyVerification.step === "idle")
                                ? "settings-input--error"
                                : ""
                            }`}
                            type="tel"
                            value={profile.emergencyContact}
                            onChange={(event) => {
                              setProfile({
                                ...profile,
                                emergencyContact: sanitizePhoneInput(
                                  event.target.value,
                                ),
                              });
                              setEmergencyVerification({
                                step: "idle",
                                code: "",
                                verified: false,
                                error: "",
                              });
                            }}
                            placeholder="+212 600 000 000"
                          />
                          <button
                            className="settings-btn settings-btn--ghost settings-emergency-contact__verify"
                            type="button"
                            onClick={startEmergencyVerification}
                          >
                            Verify
                          </button>
                        </div>
                        {emergencyVerification.step === "code" && (
                          <div className="settings-emergency-code">
                            <input
                              className={`settings-input ${emergencyVerification.error ? "settings-input--error" : ""}`}
                              inputMode="numeric"
                              maxLength={6}
                              value={emergencyVerification.code}
                              onChange={(event) =>
                                setEmergencyVerification((current) => ({
                                  ...current,
                                  code: event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 6),
                                  error: "",
                                }))
                              }
                              placeholder="123456"
                            />
                            <button
                              className="settings-btn settings-btn--primary"
                              type="button"
                              onClick={verifyEmergencyContact}
                            >
                              Confirm
                            </button>
                          </div>
                        )}
                        {emergencyVerification.verified && (
                          <span className="settings-verified-badge">
                            <FiCheck aria-hidden="true" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="settings-helper">
                        Used only for urgent booking or safety situations.
                      </span>
                      <span className="settings-helper">
                        For preview mode, use code 123456.
                      </span>
                      {(emergencyContactError ||
                        emergencyVerification.error) && (
                        <span className="settings-error">
                          {emergencyVerification.error ||
                            "Enter a valid emergency phone number."}
                        </span>
                      )}
                    </ProfileFieldCard>

                    <ProfileFieldCard
                      title="Bio"
                      description="A short introduction for hosts and guests."
                      fullWidth
                    >
                      <textarea
                        className="settings-input settings-textarea"
                        value={profile.bio}
                        maxLength={250}
                        onChange={(event) =>
                          setProfile({ ...profile, bio: event.target.value })
                        }
                        placeholder="Tell hosts and guests a little about yourself."
                        rows={4}
                      />
                      <span className="settings-character-count">
                        {profile.bio.length} / 250
                      </span>
                    </ProfileFieldCard>
                  </div>
                  <div className="settings-actions">
                    <button
                      className="settings-btn settings-btn--primary"
                      type="button"
                      onClick={saveProfileDetails}
                    >
                      Save profile details
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "security" && (
              <section className="settings-section">
                <div className="settings-section__head">
                  <h3 className="settings-section-title">Security</h3>
                  <p className="settings-section-subtitle">
                    Review account protections and preview security controls.
                  </p>
                </div>

                <div className="settings-card settings-security-status-card">
                  <div className="settings-card__head">
                    <div className="settings-card__icon">
                      <FiShield aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="settings-card-title">Security status</h4>
                      <p className="settings-helper">
                        Based on the profile details available in preview mode.
                      </p>
                    </div>
                  </div>
                  <div className="settings-security-status-list">
                    {securityStatusRows.map((row) => (
                      <div
                        className="settings-security-status-row"
                        key={row.label}
                      >
                        <span>{row.label}</span>
                        <strong
                          className={`settings-status-badge settings-status-badge--${row.tone}`}
                        >
                          {row.status}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-card__head">
                    <div className="settings-card__icon">
                      <FiLock aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="settings-card-title">
                        {hasPassword ? "Change password" : "Create password"}
                      </h4>
                      <p className="settings-helper">
                        {hasPassword
                          ? "Use at least 8 characters with a mix of letters, numbers, or symbols."
                          : "Your account was created with Google. Add a password if you also want to sign in with email and password."}
                      </p>
                    </div>
                  </div>
                  <div className="settings-field-grid">
                    {hasPassword &&
                      renderPasswordField("currentPassword", "Current password")}
                    {renderPasswordField("newPassword", "New password")}
                    {renderPasswordField("confirmPassword", "Confirm password")}
                  </div>
                  <div className="settings-actions">
                    <button
                      className="settings-btn settings-btn--primary"
                      type="button"
                      onClick={savePassword}
                      disabled={!isPasswordReady}
                    >
                      {hasPassword ? "Update password" : "Create password"}
                    </button>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-card__head">
                    <div className="settings-card__icon">
                      <FiMonitor aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="settings-card-title">Login devices</h4>
                      <p className="settings-helper">
                        Recent sessions connected to your DarDarek account.
                      </p>
                    </div>
                  </div>
                  <div className="settings-device-list">
                    <div className="settings-device-row settings-device-row--current">
                      <FiMonitor aria-hidden="true" />
                      <div>
                        <strong>Current session</strong>
                        <span>Current browser</span>
                        <span>Location: Morocco</span>
                      </div>
                      <em>Status: Active now</em>
                    </div>
                    <p className="settings-integration-note">
                      Other trusted devices will appear here after backend
                      integration.
                    </p>
                    <div className="settings-actions">
                      <button
                        className="settings-btn settings-btn--ghost"
                        type="button"
                        onClick={() =>
                          showToast(
                            "Device management will be available after backend integration.",
                            "warning",
                          )
                        }
                      >
                        Sign out of other devices
                      </button>
                    </div>
                  </div>
                </div>

                <div className="settings-card settings-card--warning">
                  <div>
                    <h4 className="settings-card-title">Deactivate account</h4>
                    <p className="settings-helper">
                      Your profile and listings will be hidden until you sign
                      back in. No data is deleted in this preview.
                    </p>
                  </div>
                  <button
                    className="settings-btn settings-btn--warning"
                    type="button"
                    onClick={() => setDeactivateModalOpen(true)}
                  >
                    Deactivate account
                  </button>
                </div>
              </section>
            )}

            {activeSection === "notifications" && (
              <section className="settings-section">
                <div className="settings-section__head">
                  <h3 className="settings-section-title">Notifications</h3>
                  <p className="settings-section-subtitle">
                    Choose the updates DarDarek can send in preview mode.
                  </p>
                </div>

                <div className="settings-card settings-intro-card">
                  <div className="settings-card__head">
                    <div className="settings-card__icon">
                      <FiBell aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="settings-card-title">
                        Notification preferences
                      </h4>
                      <p className="settings-helper">
                        Choose how DarDarek keeps you updated about bookings,
                        messages, rental requests, and account activity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="settings-notification-list">
                  {notificationCategories.map(
                    ({ key, label, description, Icon }) => (
                      <div
                        className="settings-card settings-notification-row"
                        key={key}
                      >
                        <div className="settings-notification-mark">
                          {createElement(Icon, { "aria-hidden": "true" })}
                        </div>
                        <div>
                          <strong>{label}</strong>
                          <p>{description}</p>
                        </div>
                        <Toggle
                          checked={notifications.categories[key]}
                          onChange={(value) =>
                            updateNotificationCategory(key, value)
                          }
                          label={`Toggle ${label}`}
                        />
                      </div>
                    ),
                  )}
                </div>

                <div className="settings-card settings-delivery-card">
                  <div>
                    <h4 className="settings-card-title">Delivery channels</h4>
                    <p className="settings-helper">
                      Choose where enabled notifications should appear.
                    </p>
                  </div>
                  <div className="settings-delivery-grid">
                    {notificationChannels.map(
                      ({ key, label, description, Icon }) => (
                        <div className="settings-delivery-option" key={key}>
                          <div className="settings-delivery-option__icon">
                            {createElement(Icon, { "aria-hidden": "true" })}
                          </div>
                          <div>
                            <strong>{label}</strong>
                            <p>{description}</p>
                          </div>
                          <Toggle
                            checked={notifications.channels[key]}
                            onChange={(value) =>
                              updateNotificationChannel(key, value)
                            }
                            label={`Toggle ${label}`}
                          />
                        </div>
                      ),
                    )}
                  </div>
                  <div className="settings-actions">
                    <button
                      className="settings-btn settings-btn--primary"
                      type="button"
                      onClick={saveNotificationPreferences}
                    >
                      Save notification preferences
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "hosting" && (
              <section className="settings-section">
                <div className="settings-section__head">
                  <h3 className="settings-section-title">Hosting</h3>
                  <p className="settings-section-subtitle">
                    Prepare your account for future DarDarek hosting tools.
                  </p>
                </div>

                <div className="settings-host-grid">
                  <div
                    className={`settings-card settings-host-card ${
                      hostModeActive ? "settings-host-card--active" : ""
                    }`}
                  >
                    {hostModeActive ? (
                      <>
                        <div className="settings-card__head">
                          <div className="settings-card__icon">
                            <FiHome aria-hidden="true" />
                          </div>
                          <div>
                            <span className="settings-host-eyebrow">
                              Host account active
                            </span>
                            <h4 className="settings-card-title">
                              Your host account is active
                            </h4>
                            <p className="settings-helper">
                              You can now create listings and prepare your
                              property for guests.
                            </p>
                          </div>
                        </div>

                        <div className="settings-host-status-grid">
                          {hostActiveItems.map((item) => (
                            <div className="settings-host-status" key={item}>
                              <FiCheck aria-hidden="true" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                        <div className="settings-host-note">
                          Backend verification and approval will be connected
                          later.
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="settings-card__head">
                          <div className="settings-card__icon">
                            <FiHome aria-hidden="true" />
                          </div>
                          <div>
                            <h4 className="settings-card-title">
                              Become a host on DarDarek
                            </h4>
                            <p className="settings-helper">
                              Share your apartment, studio, riad, or villa with
                              travelers discovering Northern Morocco.
                            </p>
                          </div>
                        </div>
                        <p className="settings-host-lede">
                          Start with your space, add the details that make it
                          special, and welcome your first guests when you are
                          ready.
                        </p>

                        <div className="settings-host-steps">
                          {hostingSteps.map((step, index) => (
                            <div
                              className="settings-host-step"
                              key={step.title}
                            >
                              <span className="settings-host-step__number">
                                {index + 1}
                              </span>
                              <div>
                                <strong>{step.title}</strong>
                                <p>{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          className="settings-btn settings-btn--primary settings-btn--fit"
                          type="button"
                          onClick={() => setStartHostingModalOpen(true)}
                        >
                          Start hosting
                        </button>
                      </>
                    )}
                  </div>

                  {hostModeActive && (
                    <div className="settings-card settings-card--publish">
                      <div className="settings-card__head">
                        <div className="settings-card__icon">
                          <FiBriefcase aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="settings-card-title">
                            Ready to publish your property?
                          </h4>
                          <p className="settings-helper">
                            Create a listing for your apartment, riad, studio,
                            or villa in Northern Morocco.
                          </p>
                        </div>
                      </div>
                      <div className="settings-publish-checklist">
                        {publishChecklist.map((item) => (
                          <div className="settings-publish-check" key={item}>
                            <FiCheck aria-hidden="true" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <a
                        className="settings-btn settings-btn--accent settings-btn--fit"
                        href="/new-listing"
                      >
                        List your property
                      </a>
                    </div>
                  )}

                  <div className="settings-card settings-host-process-card">
                    <div>
                      <h4 className="settings-card-title">How hosting works</h4>
                      <p className="settings-helper">
                        DarDarek keeps hosting simple: create your listing,
                        review requests, and welcome guests when everything is
                        ready.
                      </p>
                    </div>
                    <div className="settings-host-process-list">
                      {hostingWorksItems.map((item, index) => (
                        <div className="settings-host-process-item" key={item}>
                          <span>{index + 1}</span>
                          <strong>{item}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "preferences" && (
              <section className="settings-section">
                <div className="settings-section__head">
                  <h3 className="settings-section-title">Preferences</h3>
                  <p className="settings-section-subtitle">
                    Set simple defaults for future searches and bookings.
                  </p>
                </div>

                <div className="settings-card settings-preferences-summary">
                  <div className="settings-card__head">
                    <div className="settings-card__icon">
                      <FiSettings aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="settings-card-title">
                        Personalize your DarDarek experience
                      </h4>
                      <p className="settings-helper">
                        These preferences help DarDarek tailor destinations,
                        stay styles, language, and currency to your account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="settings-card settings-preferences-card settings-preferences-core-card">
                  <div className="settings-preferences-grid settings-preferences-grid--four">
                    <div className="settings-field settings-preference-field">
                      <span className="settings-label">Preferred language</span>
                      <PreferenceDropdown
                        value={preferences.language}
                        options={preferenceLanguageOptions}
                        open={openPreferenceDropdown === "language"}
                        onToggle={() =>
                          setOpenPreferenceDropdown((current) =>
                            current === "language" ? null : "language",
                          )
                        }
                        onClose={() => setOpenPreferenceDropdown(null)}
                        onSelect={(language) => {
                          setPreferences({
                            ...preferences,
                            language,
                          });
                          setOpenPreferenceDropdown(null);
                        }}
                      />
                      <span className="settings-preference-note">
                        Language switching will be connected later.
                      </span>
                    </div>

                    <div className="settings-field settings-preference-field">
                      <span className="settings-label">Currency</span>
                      <PreferenceDropdown
                        value={preferences.currency}
                        options={preferenceCurrencyOptions}
                        open={openPreferenceDropdown === "currency"}
                        onToggle={() =>
                          setOpenPreferenceDropdown((current) =>
                            current === "currency" ? null : "currency",
                          )
                        }
                        onClose={() => setOpenPreferenceDropdown(null)}
                        onSelect={(currency) => {
                          setPreferences({
                            ...preferences,
                            currency,
                          });
                          setOpenPreferenceDropdown(null);
                        }}
                        getOptionValue={(option) => option.value}
                        getOptionLabel={(option) =>
                          `${option.value} — ${option.label}`
                        }
                      />
                      <span className="settings-preference-note">
                        Currency conversion will be connected later.
                      </span>
                    </div>

                    <div className="settings-field settings-preference-field settings-city-combobox">
                      <span className="settings-label">
                        Preferred travel city
                      </span>
                      <p className="settings-preference-note">
                        Search and select your favorite Northern Morocco
                        destination.
                      </p>

                      <div
                        className="settings-combobox"
                        onBlur={(event) => {
                          if (
                            !event.currentTarget.contains(event.relatedTarget)
                          ) {
                            setCityFocused(false);
                            setCitySearch("");
                          }
                        }}
                      >
                        <input
                          className="settings-input settings-city-search"
                          type="search"
                          value={
                            cityFocused ? citySearch : preferences.preferredCity
                          }
                          onFocus={() => {
                            setCityFocused(true);
                            setCitySearch("");
                          }}
                          onChange={(event) => {
                            setCityFocused(true);
                            setCitySearch(event.target.value);
                          }}
                          placeholder="Search Northern Morocco"
                        />

                        {cityFocused && (
                          <div
                            className="settings-suggestions settings-city-suggestions"
                            role="listbox"
                          >
                            {filteredPreferenceCities.length ? (
                              filteredPreferenceCities.map((city) => (
                                <button
                                  className={
                                    preferences.preferredCity === city
                                      ? "settings-suggestion--active"
                                      : ""
                                  }
                                  key={city}
                                  type="button"
                                  role="option"
                                  aria-selected={
                                    preferences.preferredCity === city
                                  }
                                  onMouseDown={(event) =>
                                    event.preventDefault()
                                  }
                                  onClick={() => {
                                    setPreferences((current) => ({
                                      ...current,
                                      preferredCity: city,
                                    }));
                                    setCityFocused(false);
                                    setCitySearch("");
                                  }}
                                >
                                  {city}
                                </button>
                              ))
                            ) : (
                              <span className="settings-city-empty">
                                No Northern Morocco city matches your search.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="settings-field settings-preference-field">
                      <span className="settings-label">
                        Preferred stay type
                      </span>
                      <p className="settings-preference-note">
                        Pick the stay style you usually want to see first.
                      </p>

                      <PreferenceDropdown
                        value={preferences.stayType}
                        options={preferenceStayTypes}
                        open={openPreferenceDropdown === "stayType"}
                        onToggle={() =>
                          setOpenPreferenceDropdown((current) =>
                            current === "stayType" ? null : "stayType",
                          )
                        }
                        onClose={() => setOpenPreferenceDropdown(null)}
                        onSelect={(stayType) => {
                          setPreferences({
                            ...preferences,
                            stayType,
                          });
                          setOpenPreferenceDropdown(null);
                        }}
                        getOptionValue={(option) => option.value}
                        getOptionLabel={(option) =>
                          `${option.icon} ${option.value}`
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-preferences-actions">
                  <button
                    className="settings-btn settings-btn--primary"
                    type="button"
                    onClick={savePreferences}
                  >
                    Save preferences
                  </button>
                </div>
              </section>
            )}

            {activeSection === "payments" && (
              <section className="settings-section">
                <div className="settings-section__head">
                  <h3 className="settings-section-title">Payments</h3>
                  <p className="settings-section-subtitle">
                    Manage how you pay for bookings and how hosting payouts will
                    be handled.
                  </p>
                  <div className="settings-payment-trust-note">
                    Payment features are prepared for future backend and payment
                    provider integration.
                  </div>
                </div>

                <div className="settings-payment-grid">
                  <div className="settings-card settings-payment-method-card">
                    <div className="settings-card__head">
                      <div className="settings-card__icon">
                        <FiCreditCard aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="settings-card-title">Payment methods</h4>
                        <p className="settings-helper">
                          Add a payment method to make future bookings faster
                          and easier.
                        </p>
                      </div>
                    </div>
                    <div className="settings-empty-state">
                      <strong>No payment method added yet.</strong>
                      <span>Online checkout will be connected later.</span>
                    </div>
                    <button
                      className="settings-btn settings-btn--primary settings-btn--fit"
                      type="button"
                      onClick={() => setPaymentPreviewOpen(true)}
                    >
                      Add payment method
                    </button>
                  </div>
                  <div className="settings-card settings-payout-card">
                    <div className="settings-card__head">
                      <div className="settings-card__icon">
                        <FiBriefcase aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="settings-card-title">Payout methods</h4>
                        <p className="settings-helper">
                          Hosts will be able to choose how they receive payouts
                          for confirmed bookings.
                        </p>
                      </div>
                    </div>
                    <div className="settings-coming-soon-row">
                      <strong>No payout method added yet.</strong>
                      <span className="settings-status-badge settings-status-badge--pending">
                        Backend required
                      </span>
                    </div>
                    <button
                      className="settings-btn settings-btn--ghost settings-btn--fit"
                      type="button"
                      onClick={() => setPayoutPreviewOpen(true)}
                    >
                      Set up payout method
                    </button>
                  </div>
                  <div className="settings-card settings-billing-card">
                    <div className="settings-card__head">
                      <div className="settings-card__icon">
                        <FiGlobe aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="settings-card-title">
                          Billing information
                        </h4>
                        <p className="settings-helper">
                          Used for receipts, invoices, and account records.
                        </p>
                      </div>
                    </div>
                    <div className="settings-billing-grid">
                      <label className="settings-field">
                        <span className="settings-label">Billing name</span>
                        <input
                          className="settings-input"
                          value={billing.billingName}
                          onChange={(event) =>
                            setBilling({
                              ...billing,
                              billingName: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label className="settings-field">
                        <span className="settings-label">Address</span>
                        <input
                          className="settings-input"
                          value={billing.address}
                          onChange={(event) =>
                            setBilling({
                              ...billing,
                              address: event.target.value,
                            })
                          }
                          placeholder="Street and building"
                        />
                      </label>
                      <label className="settings-field">
                        <span className="settings-label">City</span>
                        <input
                          className="settings-input"
                          value={billing.city}
                          onChange={(event) =>
                            setBilling({
                              ...billing,
                              city: event.target.value,
                            })
                          }
                          placeholder="Tangier"
                        />
                      </label>
                      <label className="settings-field">
                        <span className="settings-label">Postal code</span>
                        <input
                          className="settings-input"
                          value={billing.postalCode}
                          onChange={(event) =>
                            setBilling({
                              ...billing,
                              postalCode: event.target.value,
                            })
                          }
                          placeholder="90000"
                        />
                      </label>
                      <div className="settings-field settings-field--full">
                        <span className="settings-label">Country</span>
                        <PreferenceDropdown
                          value={billing.country}
                          options={billingCountryOptions}
                          open={openPreferenceDropdown === "billingCountry"}
                          onToggle={() =>
                            setOpenPreferenceDropdown((current) =>
                              current === "billingCountry"
                                ? null
                                : "billingCountry",
                            )
                          }
                          onClose={() => setOpenPreferenceDropdown(null)}
                          onSelect={(country) => {
                            setBilling({
                              ...billing,
                              country,
                            });
                            setOpenPreferenceDropdown(null);
                          }}
                        />
                      </div>
                    </div>
                    <div className="settings-actions">
                      <button
                        className="settings-btn settings-btn--primary"
                        type="button"
                        onClick={saveBillingInformation}
                      >
                        Save billing information
                      </button>
                    </div>
                  </div>
                  <div className="settings-card settings-payment-safety-card">
                    <div className="settings-card__head">
                      <div className="settings-card__icon">
                        <FiShield aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="settings-card-title">Payment safety</h4>
                        <p className="settings-helper">
                          DarDarek should never store raw card numbers directly.
                          Real payments should be handled by a secure payment
                          provider such as Stripe, PayPal, or a bank payment
                          gateway.
                        </p>
                      </div>
                    </div>
                    <div className="settings-payment-safety-list">
                      {paymentSafetyPoints.map((point) => (
                        <div
                          className="settings-payment-safety-item"
                          key={point}
                        >
                          <FiCheck aria-hidden="true" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
