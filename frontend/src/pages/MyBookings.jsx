import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiHome,
  FiMapPin,
  FiMessageCircle,
  FiSend,
  FiStar,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import Header from "../Home components/Header";
import asilahImage from "../assets/ChaouenStreets.jpg";
import { buildApiUrl, createAuthConfig } from "../lib/api";
import "./MyBookings.css";
import { useThemeGlobal } from "../Contexts/ThemeContext";

const bookingTabs = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Pending" },
  { id: "cancelled", label: "Cancelled" },
  { id: "completed", label: "Completed" },
];

const FALLBACK_BOOKING_IMAGE = asilahImage;

const statusMeta = {
  upcoming: {
    label: "Confirmed",
    icon: FiCheckCircle,
    tone: "upcoming",
  },
  pending: {
    label: "Pending",
    icon: FiClock,
    tone: "pending",
  },
  completed: {
    label: "Completed",
    icon: FiCheckCircle,
    tone: "completed",
  },
  cancelled: {
    label: "Cancelled",
    icon: FiXCircle,
    tone: "cancelled",
  },
};

function normalizeBookingImage(imagePath) {
  if (!imagePath) return FALLBACK_BOOKING_IMAGE;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;
  return buildApiUrl(normalizedPath);
}

function normalizeBooking(booking) {
  return {
    id: booking.id,
    propertyId: booking.propertyId,
    propertyTitle: booking.propertyTitle || "DarDarek stay",
    city: booking.city || "Northern Morocco",
    location: booking.location || booking.city || "Northern Morocco",
    image: normalizeBookingImage(booking.image),
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: Number(booking.guests) || 1,
    totalPrice: Number(booking.totalPrice) || 0,
    status: booking.status || "pending",
    hostName: booking.hostName || "DarDarek host",
    reviewed: booking.reviewed === true || Number(booking.reviewed) === 1,
  };
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const priceFormatter = new Intl.NumberFormat("en-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});

function formatDate(value) {
  if (!value) return "Date not set";
  const cleanValue = String(value).split("T")[0];
  const date = new Date(`${cleanValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return dateFormatter.format(date);
}

function formatDateRange(checkIn, checkOut) {
  return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
}

const getNightsCount = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

function formatGuests(guests) {
  return `${guests} ${guests === 1 ? "guest" : "guests"}`;
}

function StatusBadge({ status }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span className={`booking-status-badge booking-status-badge--${meta.tone}`}>
      <Icon aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function BookingModal({ booking, onClose, onViewProperty }) {
  if (!booking) return null;
  const timelineStates = booking.status === "completed" ? ["done", "done", "done"] : 
                         booking.status === "upcoming" ? ["done", "active", "idle"] : 
                         booking.status === "cancelled" ? ["done", "cancelled", "idle"] : 
                         ["active", "idle", "idle"];
  
  const timelineLabels = ["Requested", "Confirmed", "Stay completed"];

  return (
    <div className="bookings-modal-overlay" onMouseDown={onClose}>
      <section className="bookings-modal bookings-details-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="bookings-modal__close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>
        <div className="bookings-modal__image">
          <img src={booking.image} alt={booking.propertyTitle} />
          <div style={{position: 'absolute', top: 16, left: 16, background: '#fff', borderRadius: 999, padding: '4px 8px'}}>
            <StatusBadge status={booking.status} />
          </div>
        </div>
        <div className="bookings-modal__body">
          <p className="bookings-kicker" style={{color: 'var(--teal-dark)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase'}}>{booking.city}</p>
          <h2 style={{fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', margin: '4px 0 16px', color: 'var(--navy-900)'}}>{booking.propertyTitle}</h2>
          <div className="bookings-detail-grid">
            <span><FiMapPin /> {booking.location}</span>
            <span><FiCalendar /> {formatDateRange(booking.checkIn, booking.checkOut)}</span>
            <span><FiUsers /> {formatGuests(booking.guests)}</span>
            <span><FiUser /> Hosted by {booking.hostName}</span>
          </div>
          <div className="bookings-price-panel">
            <span style={{fontWeight: 700}}>Total price</span>
            <strong style={{fontSize: '1.2rem'}}>{priceFormatter.format(booking.totalPrice)}</strong>
          </div>
          <div className="bookings-timeline">
            {timelineLabels.map((label, index) => (
              <div className={`bookings-timeline__step bookings-timeline__step--${timelineStates[index]}`} key={label}>
                <span>{index + 1}</span>
                <p style={{margin: 0, fontSize: '0.85rem', fontWeight: 600}}>{label}</p>
              </div>
            ))}
          </div>
          <div className="bookings-modal__actions">
            <button className="action-btn action-btn--ghost" onClick={onClose} style={{width: 'auto'}}>Close</button>
            <button className="action-btn action-btn--primary" onClick={onViewProperty} style={{width: 'auto'}}>
              <FiHome /> View property
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CancelModal({ booking, onClose, onConfirm }) {
  if (!booking) return null;
  return (
    <div className="bookings-modal-overlay" onMouseDown={onClose}>
      <section className="bookings-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="bookings-modal__close" onClick={onClose}>
          <FiX />
        </button>
        <div className="bookings-modal-icon bookings-modal-icon--danger">
          <FiXCircle />
        </div>
        <h2 style={{fontFamily: 'Cormorant Garamond', fontSize: '1.8rem', margin: '0 0 12px'}}>Cancel this booking?</h2>
        <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 24px'}}>
          Are you sure you want to cancel your reservation for <strong>{booking.propertyTitle}</strong>? This cannot be undone.
        </p>
        <div className="bookings-modal__actions">
          <button className="action-btn action-btn--ghost" onClick={onClose} style={{width: 'auto'}}>Keep booking</button>
          <button className="action-btn action-btn--danger" onClick={onConfirm} style={{width: 'auto'}}>Yes, cancel</button>
        </div>
      </section>
    </div>
  );
}

function ReviewModal({ booking, rating, reviewText, onRating, onText, onClose, onSubmit }) {
  if (!booking) return null;
  return (
    <div className="bookings-modal-overlay" onMouseDown={onClose}>
      <section className="bookings-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="bookings-modal__close" onClick={onClose}>
          <FiX />
        </button>
        <p className="bookings-kicker" style={{color: 'var(--teal-dark)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase'}}>Completed Stay</p>
        <h2 style={{fontFamily: 'Cormorant Garamond', fontSize: '1.8rem', margin: '4px 0 8px'}}>Leave a review</h2>
        <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 24px'}}>
          Share a quick note about your stay at {booking.propertyTitle}.
        </p>
        <div className="bookings-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} className={star <= rating ? "is-selected" : ""} onClick={() => onRating(star)}>
              <FiStar />
            </button>
          ))}
        </div>
        <label className="bookings-review-field">
          <span>Your review</span>
          <textarea
            value={reviewText}
            onChange={(e) => onText(e.target.value)}
            placeholder="What made this stay memorable?"
            rows="5"
          />
        </label>
        <div className="bookings-modal__actions">
          <button className="action-btn action-btn--ghost" onClick={onClose} style={{width: 'auto'}}>Close</button>
          <button 
            className="action-btn action-btn--primary" 
            onClick={onSubmit} 
            disabled={reviewText.trim().length < 10}
            style={{width: 'auto'}}
          >
            <FiSend /> Submit review
          </button>
        </div>
      </section>
    </div>
  );
}

export default function MyBookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const themeGlobal = useThemeGlobal();
  
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [bookingToReview, setBookingToReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (location.state?.successToast) {
      setActiveTab("pending");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  async function fetchBookings() {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(buildApiUrl("/api/my-bookings"), createAuthConfig(token));
      const apiBookings = Array.isArray(response.data?.bookings) ? response.data.bookings : [];
      setBookings(apiBookings.map(normalizeBooking));
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const summary = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "upcoming").length,
  }), [bookings]);

  const tabCounts = useMemo(() => bookingTabs.reduce((counts, tab) => {
    counts[tab.id] = bookings.filter((b) => b.status === tab.id).length;
    return counts;
  }, {}), [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => b.status === activeTab).sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
  }, [activeTab, bookings]);

  async function handleCancelBooking() {
    if (!bookingToCancel) return;
    const token = localStorage.getItem("token");
    try {
      await axios.patch(buildApiUrl(`/api/my-bookings/${bookingToCancel.id}/cancel`), {}, createAuthConfig(token));
      setBookings((prev) => prev.map((b) => b.id === bookingToCancel.id ? { ...b, status: "cancelled" } : b));
      setBookingToCancel(null);
      setActiveTab("cancelled");
    } catch (error) {
      alert(error.response?.data?.message || "Could not cancel booking.");
    }
  }

  async function handleSubmitReview() {
    if (!bookingToReview) return;
    const token = localStorage.getItem("token");
    try {
      await axios.post(buildApiUrl(`/api/my-bookings/${bookingToReview.id}/review`), {
        rating: reviewRating,
        comment: reviewText,
      }, createAuthConfig(token));
      setBookings((prev) => prev.map((b) => b.id === bookingToReview.id ? { ...b, reviewed: true } : b));
      setBookingToReview(null);
      setReviewText("");
    } catch (error) {
      alert(error.response?.data?.message || "Could not submit review.");
    }
  }

  return (
    <>
      <Header />
      <div className="bookings-page">
        <div className="bookings-wrapper">
          <div className="bookings-header">
            <h1 className="bookings-title">My Bookings</h1>
            <p className="bookings-subtitle">Manage your upcoming stays, pending requests, and past trips.</p>
          </div>

          <div className="bookings-stats-grid">
            <div className="stat-card">
              <div className="stat-card__icon" style={{ color: "#00a9b5", backgroundColor: "rgba(0, 169, 181, 0.09)" }}>
                <FiCalendar />
              </div>
              <div className="stat-card__content">
                <h3 className="stat-card__value" style={{ color: "#00a9b5" }}>{summary.total}</h3>
                <p className="stat-card__label">Total bookings</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon" style={{ color: "#c98517", backgroundColor: "rgba(201, 133, 23, 0.09)" }}>
                <FiClock />
              </div>
              <div className="stat-card__content">
                <h3 className="stat-card__value" style={{ color: "#c98517" }}>{summary.pending}</h3>
                <p className="stat-card__label">Pending requests</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon" style={{ color: "#157f57", backgroundColor: "rgba(21, 127, 87, 0.09)" }}>
                <FiCheckCircle />
              </div>
              <div className="stat-card__content">
                <h3 className="stat-card__value" style={{ color: "#157f57" }}>{summary.confirmed}</h3>
                <p className="stat-card__label">Confirmed stays</p>
              </div>
            </div>
          </div>

          <div className="bookings-tabs-card">
            <div className="bookings-tabs">
              {bookingTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`bookings-tab ${activeTab === tab.id ? "bookings-tab--active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.label}</span>
                  <strong>{tabCounts[tab.id]}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="bookings-content-section">
            <div className="bookings-list-toolbar">
              <h2>{bookingTabs.find((t) => t.id === activeTab)?.label} Bookings</h2>
            </div>
            
            <div className="bookings-list">
              {filteredBookings.length === 0 ? (
                <div className="bookings-empty">
                  <h3>No bookings found</h3>
                  <p>You don't have any {activeTab} bookings at the moment.</p>
                </div>
              ) : (
                filteredBookings.map((booking) => {
                  const nights = Math.max(getNightsCount(booking.checkIn, booking.checkOut), 1);
                  return (
                    <div key={booking.id} className={`booking-row ${booking.status === "cancelled" ? "booking-row--cancelled" : ""}`}>
                      <div className="booking-row__property">
                        <img src={booking.image} alt={booking.propertyTitle} className="booking-row__img" />
                        <div className="booking-row__prop-info">
                          <h4>{booking.propertyTitle}</h4>
                          <p style={{ textTransform: "capitalize", color: "#8b5e3c" }}>{booking.city}</p>
                          <p>Hosted by {booking.hostName}</p>
                        </div>
                      </div>

                      <div className="booking-row__dates">
                        <FiCalendar />
                        <div>
                          <h4>{formatDate(booking.checkIn)}</h4>
                          <p>- {formatDate(booking.checkOut)}</p>
                          <p>{nights} night{nights !== 1 ? "s" : ""}</p>
                        </div>
                      </div>

                      <div className="booking-row__price">
                        <h4>{priceFormatter.format(booking.totalPrice)}</h4>
                        <p>(MAD {Math.round(booking.totalPrice / nights).toLocaleString("en-US")} / night)</p>
                      </div>

                      <div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="booking-row__actions">
                        <button className="action-btn action-btn--primary" onClick={() => setSelectedBooking(booking)}>
                          <FiEye /> Details
                        </button>
                        
                        {booking.status === "upcoming" && (
                          <button className="action-btn action-btn--danger" onClick={() => setBookingToCancel(booking)}>
                            <FiXCircle /> Cancel
                          </button>
                        )}

                        {booking.status === "pending" && (
                          <button className="action-btn action-btn--danger" onClick={() => setBookingToCancel(booking)}>
                            <FiXCircle /> Cancel Request
                          </button>
                        )}

                        {booking.status === "completed" && (
                          <button className="action-btn action-btn--ghost" disabled={booking.reviewed} onClick={() => {
                            setBookingToReview(booking);
                            setReviewRating(5);
                            setReviewText("");
                          }}>
                            <FiStar /> {booking.reviewed ? "Reviewed" : "Leave Review"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedBooking && (
        <BookingModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
          onViewProperty={() => navigate(`/property-details/${selectedBooking.propertyId}`)}
        />
      )}

      {bookingToCancel && (
        <CancelModal 
          booking={bookingToCancel} 
          onClose={() => setBookingToCancel(null)} 
          onConfirm={handleCancelBooking} 
        />
      )}

      {bookingToReview && (
        <ReviewModal 
          booking={bookingToReview}
          rating={reviewRating}
          reviewText={reviewText}
          onRating={setReviewRating}
          onText={setReviewText}
          onClose={() => setBookingToReview(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </>
  );
}
