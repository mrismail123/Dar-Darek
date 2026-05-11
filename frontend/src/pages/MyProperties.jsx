import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArchive,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiEdit3,
  FiEye,
  FiHome,
  FiInfo,
  FiMapPin,
  FiMessageSquare,
  FiPlusCircle,
  FiSearch,
  FiSliders,
  FiStar,
  FiTrash2,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import Header from "../Home components/Header";
import Footer from "../Footer";
import tangierImage from "../assets/Tangier2.jpg";
import { buildApiUrl } from "../lib/api";
import "./MyProperties.css";

const propertyTabs = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "draft", label: "Drafts" },
  { id: "rejected", label: "Rejected" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-desc", label: "Price high to low" },
  { value: "price-asc", label: "Price low to high" },
  { value: "most-booked", label: "Most booked" },
];

const statusMeta = {
  active: {
    label: "Active",
    tone: "success",
    icon: FiCheckCircle,
  },
  pending: {
    label: "Pending approval",
    tone: "warning",
    icon: FiClock,
  },
  rejected: {
    label: "Needs attention",
    tone: "danger",
    icon: FiXCircle,
  },
  draft: {
    label: "Draft",
    tone: "muted",
    icon: FiEdit3,
  },
};

const emptyStateCopy = {
  all: {
    title: "No properties match this view.",
    text: "Try another search or start a fresh listing for your next Northern Morocco stay.",
  },
  active: {
    title: "No active listings yet.",
    text: "Approved homes will appear here once they are ready for guests to book.",
  },
  pending: {
    title: "No listings waiting for approval.",
    text: "Submitted homes under DarDarek review will be gathered here.",
  },
  draft: {
    title: "No drafts in progress.",
    text: "Unfinished listings stay here until you are ready to submit them.",
  },
  rejected: {
    title: "No rejected listings.",
    text: "Listings that need revisions will appear here with clear next steps.",
  },
};

const FALLBACK_PROPERTY_IMAGE = tangierImage;

const priceFormatter = new Intl.NumberFormat("en-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});

const shortPriceFormatter = new Intl.NumberFormat("en-MA", {
  maximumFractionDigits: 0,
});

function formatCompactPrice(value) {
  if (value >= 1000) {
    return `${shortPriceFormatter.format(value / 1000)}k MAD`;
  }

  return `${shortPriceFormatter.format(value)} MAD`;
}

function normalizePropertyImage(imagePath) {
  if (!imagePath) return FALLBACK_PROPERTY_IMAGE;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  return buildApiUrl(imagePath.startsWith("/") ? imagePath : `/${imagePath}`);
}

function normalizeProperty(property) {
  return {
    id: property.id,
    title: property.title || "DarDarek listing",
    city: property.city || "Northern Morocco",
    location:
      property.location ||
      property.neighborhood ||
      property.address ||
      "Location not provided",
    neighborhood: property.neighborhood || "",
    address: property.address || "",
    image: normalizePropertyImage(property.image),
    propertyType: property.propertyType || "Appartement",
    pricePerNight: Number(property.pricePerNight) || 0,
    guests: Number(property.guests) || 0,
    bedrooms: Number(property.bedrooms) || 0,
    bathrooms: Number(property.bathrooms) || 0,
    beds: Number(property.beds) || 0,
    status: property.status || "pending",
    dbStatus: property.dbStatus || property.status || "pending",
    totalBookings: Number(property.totalBookings) || 0,
    upcomingBookings: Number(property.upcomingBookings) || 0,
    monthlyRevenue: Number(property.monthlyRevenue) || 0,
    rating:
      property.rating === null || property.rating === undefined
        ? null
        : Number(property.rating),
    reviewCount: Number(property.reviewCount) || 0,
    createdAt: property.createdAt || "",
    availability:
      property.availabilitySummary ||
      property.availability ||
      "Availability not set",
    availableFrom: property.availableFrom || "",
    availableTo: property.availableTo || "",
    checkIn: property.checkIn || "",
    checkOut: property.checkOut || "",
  };
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("T")[0].split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function isDateInRange(dateKey, range) {
  const current = parseDateKey(dateKey);
  const start = parseDateKey(range.startDate);
  const end = parseDateKey(range.endDate);

  return Boolean(current && start && end && current >= start && current < end);
}

function buildAvailabilityDays(startDateValue) {
  const start =
    parseDateKey(startDateValue) ||
    new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    return {
      key: toDateKey(date),
      day: date.getDate(),
      month: date.toLocaleDateString("en", { month: "short" }),
      weekday: date.toLocaleDateString("en", { weekday: "short" }),
    };
  });
}

function StatusBadge({ status }) {
  const meta = statusMeta[status] || statusMeta.pending;
  const Icon = meta.icon;

  return (
    <span className={`properties-status properties-status--${meta.tone}`}>
      <Icon aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function PropertyActions({
  property,
  onArchive,
  onDelete,
  onEdit,
  onFeedback,
  onManageAvailability,
  onPreview,
  onView,
}) {
  if (property.status === "active") {
    return (
      <>
        <button
          className="properties-btn properties-btn--primary"
          onClick={onView}
        >
          <FiEye aria-hidden="true" />
          View property
        </button>
        <button
          className="properties-btn properties-btn--ghost"
          onClick={onEdit}
        >
          <FiEdit3 aria-hidden="true" />
          Edit
        </button>
        <button
          className="properties-btn properties-btn--ghost"
          onClick={onManageAvailability}
        >
          <FiCalendar aria-hidden="true" />
          Manage availability
        </button>
        <button
          className="properties-btn properties-btn--danger"
          onClick={onArchive}
        >
          <FiArchive aria-hidden="true" />
          Archive
        </button>
      </>
    );
  }

  if (property.status === "pending") {
    return (
      <>
        <button
          className="properties-btn properties-btn--primary"
          onClick={onPreview}
        >
          <FiEye aria-hidden="true" />
          Preview
        </button>
        <button
          className="properties-btn properties-btn--ghost"
          onClick={onEdit}
        >
          <FiEdit3 aria-hidden="true" />
          Edit
        </button>
        <span className="properties-action-note">
          <FiClock aria-hidden="true" />
          Waiting approval
        </span>
      </>
    );
  }

  if (property.status === "draft") {
    return (
      <>
        <button
          className="properties-btn properties-btn--primary"
          onClick={onPreview}
        >
          <FiEdit3 aria-hidden="true" />
          Continue editing
        </button>
        <button
          className="properties-btn properties-btn--danger"
          onClick={onDelete}
        >
          <FiTrash2 aria-hidden="true" />
          Delete draft
        </button>
      </>
    );
  }

  return (
    <>
      <button
        className="properties-btn properties-btn--primary"
        onClick={onFeedback}
      >
        <FiMessageSquare aria-hidden="true" />
        View feedback
      </button>
        <button
          className="properties-btn properties-btn--ghost"
          onClick={onEdit}
        >
          <FiEdit3 aria-hidden="true" />
          Edit and resubmit
      </button>
    </>
  );
}

function ConfirmationModal({ action, property, onClose, onConfirm }) {
  if (!action || !property) return null;

  const isDelete = action === "delete";
  const title = isDelete ? "Delete this draft?" : "Archive this property?";
  const message = isDelete
    ? "This draft will be removed from your frontend preview list."
    : "Archive status is not part of the current database yet, so this action will not change the live listing.";
  const confirmLabel = isDelete ? "Delete draft" : "Archive listing";
  const Icon = isDelete ? FiTrash2 : FiArchive;

  return (
    <div
      className="properties-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="properties-modal properties-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="properties-confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="properties-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>
        <div className="properties-modal-icon properties-modal-icon--danger">
          <Icon aria-hidden="true" />
        </div>
        <p className="properties-kicker">Frontend preview</p>
        <h2 id="properties-confirm-title">{title}</h2>
        <p>
          {message} You can reconnect this action to backend ownership tools later.
        </p>
        <div className="properties-modal__actions">
          <button
            className="properties-btn properties-btn--ghost"
            onClick={onClose}
          >
            Keep listing
          </button>
          <button
            className="properties-btn properties-btn--danger"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function FeedbackModal({ property, onClose }) {
  if (!property) return null;

  return (
    <div
      className="properties-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="properties-modal properties-feedback-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="properties-feedback-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="properties-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>
        <div className="properties-modal-icon properties-modal-icon--warning">
          <FiAlertCircle aria-hidden="true" />
        </div>
        <p className="properties-kicker">{property.city} review note</p>
        <h2 id="properties-feedback-title">A few details need revision.</h2>
        <p>
          Our review team needs a clearer ownership document and one brighter
          main photo before this listing can be approved.
        </p>
        <div className="properties-feedback-list">
          <span>Upload a readable property document.</span>
          <span>
            Replace the cover image with a brighter room or facade photo.
          </span>
          <span>
            Confirm the guest capacity matches the sleeping arrangement.
          </span>
        </div>
        <div className="properties-modal__actions">
          <button
            className="properties-btn properties-btn--ghost"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="properties-btn properties-btn--primary"
            onClick={onClose}
          >
            <FiEdit3 aria-hidden="true" />
            Edit and resubmit
          </button>
        </div>
      </section>
    </div>
  );
}

function AvailabilityModal({
  state,
  onClose,
  onDateRangeChange,
  onSave,
  onToggleDate,
}) {
  if (!state) return null;

  const availabilityDays = buildAvailabilityDays(state.availableFrom);
  const blockedDateSet = new Set(state.unavailableDates || []);

  return (
    <div
      className="properties-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="properties-modal properties-availability-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="properties-availability-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="properties-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>

        <div>
          <p className="properties-kicker">Manage availability</p>
          <h2 id="properties-availability-title">
            {state.property?.title || "DarDarek listing"}
          </h2>
          <p className="properties-availability-subtitle">
            Adjust the public availability range and mark host-blocked days when
            the optional blocked-date table is available.
          </p>
        </div>

        {state.isLoading ? (
          <div className="properties-availability-loading">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <>
            <div className="properties-availability-range">
              <label>
                <span>Available from</span>
                <input
                  type="date"
                  value={state.availableFrom || ""}
                  onChange={(event) =>
                    onDateRangeChange("availableFrom", event.target.value)
                  }
                />
              </label>
              <label>
                <span>Available to</span>
                <input
                  type="date"
                  value={state.availableTo || ""}
                  min={state.availableFrom || undefined}
                  onChange={(event) =>
                    onDateRangeChange("availableTo", event.target.value)
                  }
                />
              </label>
            </div>

            {!state.supportsUnavailableDates ? (
              <div className="properties-availability-note">
                <FiInfo aria-hidden="true" />
                Host-blocked day saving needs the optional
                property_unavailable_dates table. Availability range updates are
                saved now.
              </div>
            ) : null}

            <div className="properties-availability-legend">
              <span>
                <i className="properties-legend-dot properties-legend-dot--open" />
                Open
              </span>
              <span>
                <i className="properties-legend-dot properties-legend-dot--blocked" />
                Host blocked
              </span>
              <span>
                <i className="properties-legend-dot properties-legend-dot--booked" />
                Guest booking
              </span>
            </div>

            <div className="properties-availability-grid">
              {availabilityDays.map((day) => {
                const bookedRange = state.bookedRanges.find((range) =>
                  isDateInRange(day.key, range),
                );
                const isBooked = Boolean(bookedRange);
                const isBlocked = blockedDateSet.has(day.key);

                return (
                  <button
                    className={[
                      "properties-availability-day",
                      isBooked ? "properties-availability-day--booked" : "",
                      isBlocked ? "properties-availability-day--blocked" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={day.key}
                    type="button"
                    disabled={isBooked || !state.supportsUnavailableDates}
                    onClick={() => onToggleDate(day.key)}
                    title={
                      isBooked
                        ? "Reserved by guest"
                        : isBlocked
                          ? "Host blocked"
                          : "Open day"
                    }
                  >
                    <span>{day.weekday}</span>
                    <strong>{day.day}</strong>
                    <em>{day.month}</em>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="properties-modal__actions">
          <button className="properties-btn properties-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="properties-btn properties-btn--primary"
            onClick={onSave}
            disabled={state.isLoading || state.isSaving}
          >
            <FiCheckCircle aria-hidden="true" />
            {state.isSaving ? "Saving..." : "Save availability"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function MyProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [feedbackProperty, setFeedbackProperty] = useState(null);
  const [availabilityState, setAvailabilityState] = useState(null);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const summary = useMemo(
    () => ({
      total: properties.length,
      active: properties.filter((property) => property.status === "active").length,
      pending: properties.filter((property) => property.status === "pending")
        .length,
      monthlyRevenue: properties.reduce(
        (total, property) => total + property.monthlyRevenue,
        0,
      ),
    }),
    [properties],
  );

  const tabCounts = useMemo(
    () =>
      propertyTabs.reduce((counts, tab) => {
        counts[tab.id] =
          tab.id === "all"
            ? properties.length
            : properties.filter((property) => property.status === tab.id)
                .length;

        return counts;
      }, {}),
    [properties],
  );

  const filteredProperties = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return properties
      .filter((property) => {
        const matchesTab = activeTab === "all" || property.status === activeTab;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          [property.title, property.city, property.location]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);

        return matchesTab && matchesSearch;
      })
      .sort((firstProperty, secondProperty) => {
        if (sortBy === "price-desc") {
          return secondProperty.pricePerNight - firstProperty.pricePerNight;
        }

        if (sortBy === "price-asc") {
          return firstProperty.pricePerNight - secondProperty.pricePerNight;
        }

        if (sortBy === "most-booked") {
          return secondProperty.totalBookings - firstProperty.totalBookings;
        }

        return (
          new Date(secondProperty.createdAt) - new Date(firstProperty.createdAt)
        );
      });
  }, [activeTab, properties, searchTerm, sortBy]);

  const currentEmptyState = emptyStateCopy[activeTab];
  const selectedSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label || "Newest";

  const fetchProperties = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Authentication", { replace: true });
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(buildApiUrl("/api/my-properties"), {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "We couldn't load your properties.");
      }

      setProperties(
        Array.isArray(data.properties)
          ? data.properties.map(normalizeProperty)
          : [],
      );
    } catch (error) {
      setErrorMessage(
        error.message || "We couldn't load your properties right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  function showToast(message, tone = "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2800);
  }

  function handleConfirmAction() {
    if (!confirmation) return;

    if (confirmation.action === "archive") {
      showToast(
        "Archive will be connected after archive status is added.",
        "info",
      );
      setConfirmation(null);
      return;
    }

    setProperties((currentProperties) =>
      currentProperties.filter(
        (property) => property.id !== confirmation.property.id,
      ),
    );

    showToast("Draft deleted from this preview.", "error");
    setConfirmation(null);
  }

  function handlePreview(property) {
    if (property.status === "draft") {
      navigate(`/new-listing?edit=${property.id}`);
      return;
    }

    navigate(`/property-details/${property.id}`);
  }

  function handleEditProperty(property) {
    navigate(`/new-listing?edit=${property.id}`);
  }

  async function handleOpenAvailability(property) {
    setAvailabilityState({
      property,
      isLoading: true,
      isSaving: false,
      availableFrom: property.availableFrom || "",
      availableTo: property.availableTo || "",
      unavailableDates: [],
      bookedRanges: [],
      supportsUnavailableDates: false,
    });

    try {
      const response = await fetch(
        buildApiUrl(`/api/my-properties/${property.id}/availability`),
        {
          headers: getAuthHeaders(),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load availability.");
      }

      setAvailabilityState({
        property: data.property || property,
        isLoading: false,
        isSaving: false,
        availableFrom: data.property?.availableFrom || "",
        availableTo: data.property?.availableTo || "",
        unavailableDates: Array.isArray(data.unavailableDates)
          ? data.unavailableDates.map((item) => item.date).filter(Boolean)
          : [],
        bookedRanges: Array.isArray(data.bookedRanges)
          ? data.bookedRanges
          : [],
        supportsUnavailableDates: Boolean(data.supportsUnavailableDates),
      });
    } catch (error) {
      setAvailabilityState(null);
      showToast(error.message || "Could not load availability.", "error");
    }
  }

  function handleAvailabilityRangeChange(field, value) {
    setAvailabilityState((currentState) =>
      currentState ? { ...currentState, [field]: value } : currentState,
    );
  }

  function handleToggleUnavailableDate(dateKey) {
    setAvailabilityState((currentState) => {
      if (!currentState || !currentState.supportsUnavailableDates) {
        return currentState;
      }

      const nextDates = currentState.unavailableDates.includes(dateKey)
        ? currentState.unavailableDates.filter((date) => date !== dateKey)
        : [...currentState.unavailableDates, dateKey];

      return { ...currentState, unavailableDates: nextDates };
    });
  }

  async function handleSaveAvailability() {
    if (!availabilityState?.property) return;

    setAvailabilityState((currentState) =>
      currentState ? { ...currentState, isSaving: true } : currentState,
    );

    try {
      const response = await fetch(
        buildApiUrl(
          `/api/my-properties/${availabilityState.property.id}/availability`,
        ),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            availableFrom: availabilityState.availableFrom || null,
            availableTo: availabilityState.availableTo || null,
            unavailableDates: availabilityState.unavailableDates,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save availability.");
      }

      setProperties((currentProperties) =>
        currentProperties.map((property) =>
          property.id === availabilityState.property.id
            ? {
                ...property,
                availableFrom: availabilityState.availableFrom,
                availableTo: availabilityState.availableTo,
                availability:
                  availabilityState.availableFrom && availabilityState.availableTo
                    ? `Available ${availabilityState.availableFrom} to ${availabilityState.availableTo}`
                    : "Availability not set",
              }
            : property,
        ),
      );
      setAvailabilityState(null);
      showToast(data.message || "Availability saved.");
    } catch (error) {
      setAvailabilityState((currentState) =>
        currentState ? { ...currentState, isSaving: false } : currentState,
      );
      showToast(error.message || "Could not save availability.", "error");
    }
  }

  return (
    <div className="my-properties-page">
      <Header />

      <main className="properties-shell">
        <section className="properties-hero-card">
          <div className="properties-hero__copy">
            <p className="properties-kicker">Host dashboard</p>
            <h1>My Properties</h1>
            <p>
              Manage your listed stays, track requests, and keep your homes
              ready for guests across Northern Morocco.
            </p>
            <button
              className="properties-hero-cta"
              type="button"
              onClick={() => navigate("/new-listing")}
            >
              <FiPlusCircle aria-hidden="true" />
              Add new property
            </button>
          </div>

          <div className="properties-summary" aria-label="Property summary">
            <article className="properties-summary-card">
              <span>
                <FiCheckCircle aria-hidden="true" />
              </span>
              <div>
                <strong>{summary.active}</strong>
                <p>Active listings</p>
              </div>
            </article>
            <article className="properties-summary-card">
              <span>
                <FiClock aria-hidden="true" />
              </span>
              <div>
                <strong>{summary.pending}</strong>
                <p>Pending approval</p>
              </div>
            </article>
            <article className="properties-summary-card properties-summary-card--wide">
              <span>
                <FiHome aria-hidden="true" />
              </span>
              <div>
                <strong>{summary.total}</strong>
                <p>Total properties</p>
              </div>
            </article>
            <article className="properties-summary-card properties-summary-card--wide">
              <span>
                <FiSliders aria-hidden="true" />
              </span>
              <div>
                <strong>{formatCompactPrice(summary.monthlyRevenue)}</strong>
                <p>Monthly revenue</p>
              </div>
            </article>
          </div>
        </section>

        <section className="properties-tabs-card">
          <div
            className="properties-tabs"
            role="tablist"
            aria-label="Property status filters"
          >
            {propertyTabs.map((tab) => (
              <button
                className={
                  activeTab === tab.id
                    ? "properties-tab properties-tab--active"
                    : "properties-tab"
                }
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
                aria-selected={activeTab === tab.id}
              >
                <span>{tab.label}</span>
                <strong>{tabCounts[tab.id] || 0}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="properties-content-section">
          <div className="properties-controls">
            <label className="properties-search">
              <span>Search properties</span>
              <FiSearch aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, city, or neighborhood"
              />
            </label>

            <div
              className={
                isSortOpen
                  ? "properties-sort properties-sort--open"
                  : "properties-sort"
              }
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsSortOpen(false);
                }
              }}
            >
              <span>Sort by</span>
              <div className="properties-select-wrap">
                <button
                  className="properties-sort-button"
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                  onClick={() => setIsSortOpen((currentState) => !currentState)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setIsSortOpen(false);
                    }
                  }}
                >
                  <span>{selectedSortLabel}</span>
                  <FiChevronDown aria-hidden="true" />
                </button>

                {isSortOpen ? (
                  <div
                    className="properties-sort-menu"
                    role="listbox"
                    aria-label="Sort properties"
                  >
                    {sortOptions.map((option) => (
                      <button
                        className={
                          sortBy === option.value
                            ? "properties-sort-option properties-sort-option--active"
                            : "properties-sort-option"
                        }
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={sortBy === option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                      >
                        <span>{option.label}</span>
                        {sortBy === option.value ? (
                          <FiCheckCircle aria-hidden="true" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="properties-loading" aria-live="polite">
              {[1, 2, 3, 4].map((item) => (
                <div className="properties-skeleton-card" key={item}>
                  <span className="properties-skeleton properties-skeleton--image" />
                  <div>
                    <span className="properties-skeleton properties-skeleton--title" />
                    <span className="properties-skeleton properties-skeleton--line" />
                    <span className="properties-skeleton properties-skeleton--line properties-skeleton--short" />
                  </div>
                </div>
              ))}
            </div>
          ) : errorMessage ? (
            <div className="properties-error">
              <div className="properties-empty__icon">
                <FiXCircle aria-hidden="true" />
              </div>
              <h2>Properties could not be loaded.</h2>
              <p>{errorMessage}</p>
              <button
                className="properties-btn properties-btn--primary"
                onClick={fetchProperties}
                type="button"
              >
                <FiClock aria-hidden="true" />
                Retry
              </button>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="properties-grid">
              {filteredProperties.map((property) => (
                <article className="properties-card" key={property.id}>
                  <div className="properties-card__image">
                    <img src={property.image} alt={property.title} />
                    <StatusBadge status={property.status} />
                    <span className="properties-image-chip">
                      {property.propertyType}
                    </span>
                  </div>

                  <div className="properties-card__content">
                    <div className="properties-card__header">
                      <div>
                        <p>
                          <FiMapPin aria-hidden="true" />
                          {property.city}, {property.location}
                        </p>
                        <h2>{property.title}</h2>
                      </div>
                      <strong>
                        {priceFormatter.format(property.pricePerNight)}
                        <span>/ night</span>
                      </strong>
                    </div>

                    <div className="properties-feature-row">
                      <span>
                        <FiUsers aria-hidden="true" />
                        {property.guests} guests
                      </span>
                      <span>{property.bedrooms} bedrooms</span>
                      <span>{property.beds} beds</span>
                      <span>{property.bathrooms} baths</span>
                    </div>

                    <div
                      className={
                        property.rating
                          ? "properties-card__rating"
                          : "properties-card__rating properties-card__rating--empty"
                      }
                    >
                      {property.rating ? (
                        <div className="properties-rating-badge">
                          <span>
                            <FiStar aria-hidden="true" />
                          </span>
                          <div>
                            <strong>{property.rating}</strong>
                            <p>
                              {property.reviewCount}{" "}
                              {property.reviewCount === 1
                                ? "review"
                                : "reviews"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="properties-rating-badge">
                          <span>
                            <FiInfo aria-hidden="true" />
                          </span>
                          <div>
                            <strong>No reviews yet</strong>
                            <p>Ready for first guests</p>
                          </div>
                        </div>
                      )}
                      <em>
                        <FiCalendar aria-hidden="true" />
                        {property.availability}
                      </em>
                    </div>

                    <div className="properties-mini-stats">
                      <div>
                        <strong>{property.totalBookings}</strong>
                        <span>Total bookings</span>
                      </div>
                      <div>
                        <strong>{property.upcomingBookings}</strong>
                        <span>Upcoming</span>
                      </div>
                      <div>
                        <strong>
                          {formatCompactPrice(property.monthlyRevenue)}
                        </strong>
                        <span>This month</span>
                      </div>
                    </div>

                    <div className="properties-card__actions">
                      <PropertyActions
                        property={property}
                        onArchive={() =>
                          setConfirmation({ action: "archive", property })
                        }
                        onDelete={() =>
                          setConfirmation({ action: "delete", property })
                        }
                        onEdit={() => handleEditProperty(property)}
                        onFeedback={() => setFeedbackProperty(property)}
                        onManageAvailability={() =>
                          handleOpenAvailability(property)
                        }
                        onPreview={() => handlePreview(property)}
                        onView={() =>
                          navigate(`/property-details/${property.id}`)
                        }
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="properties-empty">
              <div className="properties-empty__icon">
                <FiHome aria-hidden="true" />
              </div>
              <h2>{currentEmptyState.title}</h2>
              <p>{currentEmptyState.text}</p>
              <button
                className="properties-btn properties-btn--primary"
                onClick={() => navigate("/new-listing")}
              >
                <FiPlusCircle aria-hidden="true" />
                List a new property
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <ConfirmationModal
        action={confirmation?.action}
        property={confirmation?.property}
        onClose={() => setConfirmation(null)}
        onConfirm={handleConfirmAction}
      />
      <FeedbackModal
        property={feedbackProperty}
        onClose={() => setFeedbackProperty(null)}
      />
      <AvailabilityModal
        state={availabilityState}
        onClose={() => setAvailabilityState(null)}
        onDateRangeChange={handleAvailabilityRangeChange}
        onSave={handleSaveAvailability}
        onToggleDate={handleToggleUnavailableDate}
      />

      {toast ? (
        <div
          className={`properties-toast properties-toast--${toast.tone}`}
          role="status"
          aria-live="polite"
        >
          {toast.tone === "error" ? (
            <FiXCircle aria-hidden="true" />
          ) : toast.tone === "info" ? (
            <FiInfo aria-hidden="true" />
          ) : (
            <FiCheckCircle aria-hidden="true" />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}
