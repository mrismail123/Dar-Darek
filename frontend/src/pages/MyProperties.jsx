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
import { FaBath, FaBed, FaUser } from "react-icons/fa";

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
  active: { label: "Active", tone: "success", icon: FiCheckCircle },
  pending: { label: "Pending approval", tone: "warning", icon: FiClock },
  rejected: { label: "Needs attention", tone: "danger", icon: FiXCircle },
  draft: { label: "Draft", tone: "muted", icon: FiEdit3 },
};

const emptyStateCopy = {
  all: { title: "No properties match this view.", text: "Try another search or start a fresh listing for your next Northern Morocco stay." },
  active: { title: "No active listings yet.", text: "Approved homes will appear here once they are ready for guests to book." },
  pending: { title: "No listings waiting for approval.", text: "Submitted homes under DarDarek review will be gathered here." },
  draft: { title: "No drafts in progress.", text: "Unfinished listings stay here until you are ready to submit them." },
  rejected: { title: "No rejected listings.", text: "Listings that need revisions will appear here with clear next steps." },
};

const FALLBACK_PROPERTY_IMAGE = tangierImage;

const priceFormatter = new Intl.NumberFormat("en-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 });
const shortPriceFormatter = new Intl.NumberFormat("en-MA", { maximumFractionDigits: 0 });

function formatCompactPrice(value) {
  if (value >= 1000) return `${shortPriceFormatter.format(value / 1000)}k MAD`;
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
    location: property.location || property.neighborhood || property.address || "Location not provided",
    image: normalizePropertyImage(property.image),
    propertyType: property.propertyType || "Appartement",
    pricePerNight: Number(property.pricePerNight) || 0,
    guests: Number(property.guests) || 0,
    bedrooms: Number(property.bedrooms) || 0,
    bathrooms: Number(property.bathrooms) || 0,
    beds: Number(property.beds) || 0,
    status: property.status || "pending",
    totalBookings: Number(property.totalBookings) || 0,
    upcomingBookings: Number(property.upcomingBookings) || 0,
    monthlyRevenue: Number(property.monthlyRevenue) || 0,
    rating: property.rating === null || property.rating === undefined ? null : Number(property.rating),
    reviewCount: Number(property.reviewCount) || 0,
    createdAt: property.createdAt || "",
    availability: property.availabilitySummary || property.availability || "Availability not set",
    availableFrom: property.availableFrom || "",
    availableTo: property.availableTo || "",
    adminNotes: property.adminNotes || property.admin_notes || "",
  };
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  const start = parseDateKey(startDateValue) || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
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
      <Icon aria-hidden="true" /> {meta.label}
    </span>
  );
}

function PropertyActions({ property, onArchive, onDelete, onEdit, onFeedback, onManageAvailability, onPreview, onView }) {
  if (property.status === "active") {
    return (
      <>
        <button className="action-btn action-btn--primary" onClick={onView}><FiEye /> View</button>
        <button className="action-btn action-btn--ghost" onClick={onEdit}><FiEdit3 /> Edit</button>
        <button className="action-btn action-btn--ghost" onClick={onManageAvailability}><FiCalendar /> Calendar</button>
        <button className="action-btn action-btn--danger" onClick={onArchive}><FiArchive /> Archive</button>
      </>
    );
  }
  if (property.status === "pending") {
    return (
      <>
        <button className="action-btn action-btn--primary" onClick={onPreview}><FiEye /> Preview</button>
        <button className="action-btn action-btn--ghost" onClick={onEdit}><FiEdit3 /> Edit</button>
      </>
    );
  }
  if (property.status === "draft") {
    return (
      <>
        <button className="action-btn action-btn--primary" onClick={onPreview}><FiEdit3 /> Continue editing</button>
        <button className="action-btn action-btn--danger" onClick={onDelete}><FiTrash2 /> Delete draft</button>
      </>
    );
  }
  return (
    <>
      <button className="action-btn action-btn--danger" onClick={onFeedback}><FiMessageSquare /> View feedback</button>
      <button className="action-btn action-btn--primary" onClick={onEdit}><FiEdit3 /> Edit & resubmit</button>
    </>
  );
}

function ConfirmationModal({ action, property, onClose, onConfirm }) {
  if (!action || !property) return null;
  const isDelete = action === "delete";
  const title = isDelete ? "Delete this draft?" : "Archive this property?";
  const message = isDelete ? "This draft will be removed." : "This will hide your property from search results.";
  const confirmLabel = isDelete ? "Delete draft" : "Archive listing";
  const Icon = isDelete ? FiTrash2 : FiArchive;

  return (
    <div className="properties-modal-overlay" onMouseDown={onClose}>
      <section className="properties-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="properties-modal__close" onClick={onClose}><FiX /></button>
        <div className="properties-modal-icon properties-modal-icon--danger"><Icon /></div>
        <h2 style={{fontFamily: 'Cormorant Garamond', fontSize: '1.8rem', margin: '0 0 12px'}}>{title}</h2>
        <p style={{color: 'var(--text-muted)', margin: '0 0 24px'}}>{message}</p>
        <div className="properties-modal__actions">
          <button className="action-btn action-btn--ghost" onClick={onClose} style={{width: 'auto'}}>Cancel</button>
          <button className="action-btn action-btn--danger" onClick={onConfirm} style={{width: 'auto'}}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

function FeedbackModal({ property, onClose }) {
  if (!property) return null;
  const feedbackNotes = String(property.adminNotes || "").trim();
  const feedbackItems = feedbackNotes ? feedbackNotes.split(/\r?\n/).map((item) => item.replace(/^[-•*]\s*/, "").trim()).filter(Boolean) : [];

  return (
    <div className="properties-modal-overlay" onMouseDown={onClose}>
      <section className="properties-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="properties-modal__close" onClick={onClose}><FiX /></button>
        <div className="properties-modal-icon properties-modal-icon--warning"><FiAlertCircle /></div>
        <h2 style={{fontFamily: 'Cormorant Garamond', fontSize: '1.8rem', margin: '0 0 12px'}}>
          {feedbackNotes ? "Revisions Needed" : "Feedback is being prepared."}
        </h2>
        <p style={{color: 'var(--text-muted)', margin: '0 0 24px'}}>
          {feedbackNotes ? "Please address these notes from our review team:" : "Check back soon for feedback."}
        </p>
        {feedbackItems.length > 0 && (
          <ul style={{textAlign: 'left', paddingLeft: 20, marginBottom: 24, color: 'var(--navy-900)'}}>
            {feedbackItems.map((item) => <li key={item} style={{marginBottom: 8}}>{item}</li>)}
          </ul>
        )}
        <div className="properties-modal__actions">
          <button className="action-btn action-btn--ghost" onClick={onClose} style={{width: 'auto'}}>Close</button>
        </div>
      </section>
    </div>
  );
}

function AvailabilityModal({ state, onClose, onDateRangeChange, onSave, onToggleDate }) {
  if (!state) return null;
  const availabilityDays = buildAvailabilityDays(state.availableFrom);
  const blockedDateSet = new Set(state.unavailableDates || []);

  return (
    <div className="properties-modal-overlay" onMouseDown={onClose}>
      <section className="properties-modal properties-availability-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="properties-modal__close" onClick={onClose}><FiX /></button>
        <h2 style={{fontFamily: 'Cormorant Garamond', fontSize: '1.8rem', margin: '0 0 8px'}}>{state.property?.title}</h2>
        <p style={{color: 'var(--text-muted)', margin: '0 0 24px'}}>Manage availability and block dates.</p>
        
        {state.isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="properties-availability-range">
              <label>
                Available from
                <input type="date" value={state.availableFrom || ""} onChange={(e) => onDateRangeChange("availableFrom", e.target.value)} />
              </label>
              <label>
                Available to
                <input type="date" value={state.availableTo || ""} min={state.availableFrom || undefined} onChange={(e) => onDateRangeChange("availableTo", e.target.value)} />
              </label>
            </div>
            <div className="properties-availability-grid">
              {availabilityDays.map((day) => {
                const isBooked = state.bookedRanges.some((r) => isDateInRange(day.key, r));
                const isBlocked = blockedDateSet.has(day.key);
                return (
                  <button
                    key={day.key}
                    className={`properties-availability-day ${isBooked ? 'properties-availability-day--booked' : ''} ${isBlocked ? 'properties-availability-day--blocked' : ''}`}
                    disabled={isBooked}
                    onClick={() => onToggleDate(day.key)}
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
          <button className="action-btn action-btn--ghost" onClick={onClose} style={{width: 'auto'}}>Cancel</button>
          <button className="action-btn action-btn--primary" onClick={onSave} disabled={state.isLoading || state.isSaving} style={{width: 'auto'}}>
            <FiCheckCircle /> {state.isSaving ? "Saving..." : "Save"}
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
  const [isLoading, setIsLoading] = useState(true);

  const summary = useMemo(() => ({
    total: properties.length,
    active: properties.filter((p) => p.status === "active").length,
    pending: properties.filter((p) => p.status === "pending").length,
    monthlyRevenue: properties.reduce((t, p) => t + p.monthlyRevenue, 0),
  }), [properties]);

  const tabCounts = useMemo(() => propertyTabs.reduce((counts, tab) => {
    counts[tab.id] = tab.id === "all" ? properties.length : properties.filter((p) => p.status === tab.id).length;
    return counts;
  }, {}), [properties]);

  const filteredProperties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return properties
      .filter((p) => (activeTab === "all" || p.status === activeTab) && (!term || p.title.toLowerCase().includes(term) || p.city.toLowerCase().includes(term)))
      .sort((a, b) => {
        if (sortBy === "price-desc") return b.pricePerNight - a.pricePerNight;
        if (sortBy === "price-asc") return a.pricePerNight - b.pricePerNight;
        if (sortBy === "most-booked") return b.totalBookings - a.totalBookings;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [activeTab, properties, searchTerm, sortBy]);

  const fetchProperties = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/Authentication", { replace: true });
    setIsLoading(true);
    try {
      const res = await fetch(buildApiUrl("/api/my-properties"), { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setProperties((data.properties || []).map(normalizeProperty));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleConfirmAction = async () => {
    if (!confirmation) return;
    if (confirmation.action === "archive") {
      alert("Archive not fully implemented on backend yet.");
      setConfirmation(null);
      return;
    }
    try {
      await fetch(buildApiUrl(`/api/my-properties/${confirmation.property.id}/draft`), { method: "DELETE", headers: getAuthHeaders() });
      setProperties((prev) => prev.filter((p) => p.id !== confirmation.property.id));
      setConfirmation(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAvailability = async (property) => {
    setAvailabilityState({ property, isLoading: true, isSaving: false, availableFrom: property.availableFrom || "", availableTo: property.availableTo || "", unavailableDates: [], bookedRanges: [], supportsUnavailableDates: false });
    try {
      const res = await fetch(buildApiUrl(`/api/my-properties/${property.id}/availability`), { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setAvailabilityState({
          property: data.property || property, isLoading: false, isSaving: false,
          availableFrom: data.property?.availableFrom || "", availableTo: data.property?.availableTo || "",
          unavailableDates: Array.isArray(data.unavailableDates) ? data.unavailableDates.map((item) => item.date).filter(Boolean) : [],
          bookedRanges: Array.isArray(data.bookedRanges) ? data.bookedRanges : [],
          supportsUnavailableDates: Boolean(data.supportsUnavailableDates),
        });
      }
    } catch (err) {
      setAvailabilityState(null);
    }
  };

  const handleSaveAvailability = async () => {
    if (!availabilityState?.property) return;
    setAvailabilityState((s) => s ? { ...s, isSaving: true } : s);
    try {
      await fetch(buildApiUrl(`/api/my-properties/${availabilityState.property.id}/availability`), {
        method: "PUT", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ availableFrom: availabilityState.availableFrom || null, availableTo: availabilityState.availableTo || null, unavailableDates: availabilityState.unavailableDates }),
      });
      setProperties((prev) => prev.map((p) => p.id === availabilityState.property.id ? { ...p, availableFrom: availabilityState.availableFrom, availableTo: availabilityState.availableTo } : p));
      setAvailabilityState(null);
    } catch (err) {
      setAvailabilityState((s) => s ? { ...s, isSaving: false } : s);
    }
  };

  return (
    <div className="my-properties-page">
      <Header />
      <div className="properties-shell">
        <div className="properties-header">
          <h1 className="properties-title">My Properties</h1>
          <p className="properties-subtitle">Manage your listed stays, track requests, and keep your homes ready for guests.</p>
          <div className="properties-header-actions">
            <button className="action-btn action-btn--primary" onClick={() => navigate("/new-listing")} style={{width: 'auto'}}>
              <FiPlusCircle /> Add new property
            </button>
          </div>
        </div>

        <div className="properties-stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon" style={{ color: "#157f57", backgroundColor: "rgba(21, 127, 87, 0.09)" }}><FiCheckCircle /></div>
            <div className="stat-card__content"><h3 className="stat-card__value" style={{ color: "#157f57" }}>{summary.active}</h3><p className="stat-card__label">Active</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon" style={{ color: "#c98517", backgroundColor: "rgba(201, 133, 23, 0.09)" }}><FiClock /></div>
            <div className="stat-card__content"><h3 className="stat-card__value" style={{ color: "#c98517" }}>{summary.pending}</h3><p className="stat-card__label">Pending</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon" style={{ color: "#00a9b5", backgroundColor: "rgba(0, 169, 181, 0.09)" }}><FiHome /></div>
            <div className="stat-card__content"><h3 className="stat-card__value" style={{ color: "#00a9b5" }}>{summary.total}</h3><p className="stat-card__label">Total</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon" style={{ color: "#2b52a1", backgroundColor: "rgba(43, 82, 161, 0.09)" }}><FiSliders /></div>
            <div className="stat-card__content"><h3 className="stat-card__value" style={{ color: "#2b52a1" }}>{formatCompactPrice(summary.monthlyRevenue)}</h3><p className="stat-card__label">Monthly</p></div>
          </div>
        </div>

        <div className="properties-tabs-card">
          <div className="properties-tabs">
            {propertyTabs.map((tab) => (
              <button key={tab.id} className={`properties-tab ${activeTab === tab.id ? "properties-tab--active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                <span>{tab.label}</span><strong>{tabCounts[tab.id] || 0}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="properties-content-section">
          <div className="properties-controls">
            <div className="properties-search">
              <FiSearch />
              <input type="text" placeholder="Search by title, city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="properties-sort">
              <span>Sort by</span>
              <button className="properties-sort-button" onClick={() => setIsSortOpen(!isSortOpen)}>
                <span>{sortOptions.find(o => o.value === sortBy)?.label}</span><FiChevronDown />
              </button>
              {isSortOpen && (
                <div className="properties-sort-menu">
                  {sortOptions.map((o) => (
                    <button key={o.value} className={`properties-sort-option ${sortBy === o.value ? 'properties-sort-option--active' : ''}`} onClick={() => { setSortBy(o.value); setIsSortOpen(false); }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="properties-loading">
              {[1, 2, 3].map((n) => (
                <div key={n} className="properties-skeleton-card">
                  <div className="properties-skeleton properties-skeleton--image" />
                  <div>
                    <div className="properties-skeleton properties-skeleton--title" />
                    <div className="properties-skeleton properties-skeleton--line" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="properties-empty">
              <div className="properties-empty__icon"><FiHome /></div>
              <h2>{emptyStateCopy[activeTab].title}</h2>
              <p>{emptyStateCopy[activeTab].text}</p>
              <button className="action-btn action-btn--primary" onClick={() => navigate("/new-listing")} style={{width: 'auto'}}>
                <FiPlusCircle /> List a new property
              </button>
            </div>
          ) : (
            <div className="properties-grid">
              {filteredProperties.map((property) => (
                <div key={property.id} className="property-row">
                  <div className="property-row__info">
                    <div className="property-row__img-wrap">
                      <img src={property.image} alt={property.title} className="property-row__img" />
                    </div>
                    <div className="property-row__details">
                      <h4>{property.title}</h4>
                      <p><FiMapPin /> {property.city}, {property.location}</p>
                      <StatusBadge status={property.status} />
                    </div>
                  </div>
                  
                  <div className="property-row__meta">
                    <span className="property-row__meta-badge"><FaUser /> {property.guests}</span>
                    <span className="property-row__meta-badge"><FaBed /> {property.bedrooms}</span>
                    <span className="property-row__meta-badge"><FaBath /> {property.bathrooms}</span>
                    <span className="property-row__meta-badge" style={{color: 'var(--warning)'}}><FiStar /> {property.rating || 'New'}</span>
                  </div>

                  <div className="property-row__stats">
                    <div className="property-row__stat-item"><span>Price</span><strong>{priceFormatter.format(property.pricePerNight)}</strong></div>
                    <div className="property-row__stat-item"><span>Bookings</span><strong>{property.totalBookings}</strong></div>
                    <div className="property-row__stat-item"><span>Monthly</span><strong>{formatCompactPrice(property.monthlyRevenue)}</strong></div>
                  </div>

                  <div className="property-row__actions">
                    <PropertyActions 
                      property={property}
                      onArchive={() => setConfirmation({ action: "archive", property })}
                      onDelete={() => setConfirmation({ action: "delete", property })}
                      onEdit={() => navigate(`/new-listing?edit=${property.id}`)}
                      onFeedback={() => setFeedbackProperty(property)}
                      onManageAvailability={() => handleOpenAvailability(property)}
                      onPreview={() => navigate(property.status === "draft" ? `/new-listing?edit=${property.id}` : `/property-details/${property.id}`)}
                      onView={() => navigate(`/property-details/${property.id}`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal action={confirmation?.action} property={confirmation?.property} onClose={() => setConfirmation(null)} onConfirm={handleConfirmAction} />
      <FeedbackModal property={feedbackProperty} onClose={() => setFeedbackProperty(null)} />
      <AvailabilityModal state={availabilityState} onClose={() => setAvailabilityState(null)} onDateRangeChange={(f, v) => setAvailabilityState(s => ({...s, [f]: v}))} onSave={handleSaveAvailability} onToggleDate={(d) => setAvailabilityState(s => ({...s, unavailableDates: s.unavailableDates.includes(d) ? s.unavailableDates.filter(x => x !== d) : [...s.unavailableDates, d]}))} />
    </div>
  );
}
