import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiChevronDown,
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
import { MdOutlineExplore } from "react-icons/md";

const bookingTabs = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Pending" },
  { id: "cancelled", label: "Cancelled" },
  { id: "completed", label: "Completed" },
];

const FALLBACK_BOOKING_IMAGE = asilahImage;

const statusMeta = {
  upcoming: {
    label: "Upcoming",
    icon: FiCheckCircle,
    tone: "success",
  },
  pending: {
    label: "Pending request",
    icon: FiClock,
    tone: "warning",
  },
  completed: {
    label: "Completed",
    icon: FiCheckCircle,
    tone: "blue",
  },
  cancelled: {
    label: "Cancelled",
    icon: FiXCircle,
    tone: "muted",
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

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
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

  if (Number.isNaN(date.getTime())) {
    return "Date not set";
  }

  return dateFormatter.format(date);
}

function getBookingDate(value) {
  return new Date(`${value}T12:00:00`);
}

function formatDateRange(checkIn, checkOut) {
  return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
}

function getMonthKey(value) {
  const date = getBookingDate(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(value) {
  const date = getBookingDate(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown month";
  }

  return monthFormatter.format(date);
}

function formatGuests(guests) {
  return `${guests} ${guests === 1 ? "guest" : "guests"}`;
}

const emptyStateCopy = {
  upcoming: {
    title: "No upcoming stays yet.",
    text: "Your confirmed trips will appear here once a host approves your stay.",
  },
  pending: {
    title: "No pending requests.",
    text: "Booking requests waiting for host approval will be gathered here.",
  },
  completed: {
    title: "No completed stays yet.",
    text: "Past trips will appear here after your stay is finished.",
  },
  cancelled: {
    title: "No cancelled bookings.",
    text: "Cancelled bookings and requests will stay here for reference.",
  },
};

function getTimelineSteps(status) {
  if (status === "completed") {
    return ["done", "done", "done"];
  }

  if (status === "upcoming") {
    return ["done", "active", "idle"];
  }

  if (status === "cancelled") {
    return ["done", "cancelled", "idle"];
  }

  return ["active", "idle", "idle"];
}

function StatusBadge({ status }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span className={`bookings-status bookings-status--${meta.tone}`}>
      <Icon aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function BookingActions({ booking, onDetails, onCancel, onReview, onMessage }) {
  if (booking.status === "upcoming") {
    return (
      <>
        <button
          className="bookings-btn bookings-btn--primary"
          onClick={onDetails}
        >
          <FiEye aria-hidden="true" />
          View details
        </button>
        <button
          className="bookings-btn bookings-btn--ghost"
          onClick={onMessage}
          type="button"
        >
          <FiMessageCircle aria-hidden="true" />
          Message host
        </button>
        <button
          className="bookings-btn bookings-btn--danger"
          onClick={onCancel}
        >
          <FiXCircle aria-hidden="true" />
          Cancel booking
        </button>
      </>
    );
  }

  if (booking.status === "pending") {
    return (
      <>
        <button
          className="bookings-btn bookings-btn--primary"
          onClick={onDetails}
        >
          <FiEye aria-hidden="true" />
          View request
        </button>
        <button
          className="bookings-btn bookings-btn--danger"
          onClick={onCancel}
        >
          <FiXCircle aria-hidden="true" />
          Cancel request
        </button>
      </>
    );
  }

  if (booking.status === "completed") {
    return (
      <>
        <button
          className="bookings-btn bookings-btn--primary"
          onClick={onDetails}
        >
          <FiEye aria-hidden="true" />
          View stay
        </button>
        <button
          className="bookings-btn bookings-btn--ghost"
          disabled={booking.reviewed}
          onClick={onReview}
        >
          <FiStar aria-hidden="true" />
          {booking.reviewed ? "Review sent" : "Leave review"}
        </button>
      </>
    );
  }

  return (
    <button className="bookings-btn bookings-btn--primary" onClick={onDetails}>
      <FiEye aria-hidden="true" />
      View details
    </button>
  );
}

function BookingModal({ booking, onClose, onViewProperty }) {
  if (!booking) return null;

  const timelineStates = getTimelineSteps(booking.status);
  const timelineLabels = ["Requested", "Confirmed", "Stay completed"];

  return (
    <div
      className="bookings-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="bookings-modal bookings-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="bookings-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>

        <div className="bookings-modal__image">
          <img src={booking.image} alt={booking.propertyTitle} />
          <StatusBadge status={booking.status} />
        </div>

        <div className="bookings-modal__body">
          <div>
            <p className="bookings-kicker">{booking.city}</p>
            <h2 id="booking-details-title">{booking.propertyTitle}</h2>
          </div>

          <div className="bookings-detail-grid">
            <span>
              <FiMapPin aria-hidden="true" />
              {booking.location}
            </span>
            <span>
              <FiCalendar aria-hidden="true" />
              {formatDateRange(booking.checkIn, booking.checkOut)}
            </span>
            <span>
              <FiUsers aria-hidden="true" />
              {formatGuests(booking.guests)}
            </span>
            <span>
              <FiUser aria-hidden="true" />
              Hosted by {booking.hostName}
            </span>
          </div>

          <div className="bookings-price-panel">
            <span>Total price</span>
            <strong>{priceFormatter.format(booking.totalPrice)}</strong>
          </div>

          <div className="bookings-timeline" aria-label="Booking timeline">
            {timelineLabels.map((label, index) => (
              <div
                className={`bookings-timeline__step bookings-timeline__step--${timelineStates[index]}`}
                key={label}
              >
                <span>{index + 1}</span>
                <p>{label}</p>
              </div>
            ))}
          </div>

          <div className="bookings-modal__actions">
            <button
              className="bookings-btn bookings-btn--ghost"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="bookings-btn bookings-btn--primary"
              onClick={onViewProperty}
            >
              <FiHome aria-hidden="true" />
              View property
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
    <div
      className="bookings-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="bookings-modal bookings-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-cancel-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="bookings-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>
        <div className="bookings-modal-icon bookings-modal-icon--danger">
          <FiXCircle aria-hidden="true" />
        </div>
        <h2 id="booking-cancel-title">Cancel this booking?</h2>
        <p>
          Your booking will be marked as cancelled for this frontend preview.
        </p>
        <div className="bookings-modal__actions">
          <button
            className="bookings-btn bookings-btn--ghost"
            onClick={onClose}
          >
            Keep booking
          </button>
          <button
            className="bookings-btn bookings-btn--danger"
            onClick={onConfirm}
          >
            Cancel booking
          </button>
        </div>
      </section>
    </div>
  );
}

function ReviewModal({
  booking,
  rating,
  reviewText,
  onRating,
  onText,
  onClose,
  onSubmit,
}) {
  if (!booking) return null;

  return (
    <div
      className="bookings-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="bookings-modal bookings-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-review-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="bookings-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>
        <p className="bookings-kicker">Completed stay</p>
        <h2 id="booking-review-title">Leave a review</h2>
        <p className="bookings-review-subtitle">
          Share a quick note about your stay at {booking.propertyTitle}.
        </p>

        <div className="bookings-stars" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              className={star <= rating ? "is-selected" : ""}
              key={star}
              onClick={() => onRating(star)}
              type="button"
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
            >
              <FiStar aria-hidden="true" />
            </button>
          ))}
        </div>

        <label className="bookings-review-field">
          <span>Your review</span>
          <textarea
            value={reviewText}
            onChange={(event) => onText(event.target.value)}
            placeholder="What made this stay memorable?"
            rows="5"
          />
        </label>

        <div className="bookings-modal__actions">
          <button
            className="bookings-btn bookings-btn--ghost"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bookings-btn bookings-btn--primary"
            onClick={onSubmit}
            disabled={reviewText.trim().length < 10}
          >
            <FiSend aria-hidden="true" />
            Submit review
          </button>
        </div>
      </section>
    </div>
  );
}

export default function MyBookings() {
  const MIN_LOADING_MS = 850;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [completedMonth, setCompletedMonth] = useState("all");
  const [isMonthFilterOpen, setIsMonthFilterOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [bookingToReview, setBookingToReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // theme 
  const themeGlobal = useThemeGlobal();

  async function fetchBookings() {
    const token = localStorage.getItem("token");
    const loadingStartedAt = Date.now();

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(
        buildApiUrl("/api/my-bookings"),
        createAuthConfig(token),
      );
      const apiBookings = Array.isArray(response.data?.bookings)
        ? response.data.bookings
        : [];

      setBookings(apiBookings.map(normalizeBooking));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        "We couldn't load your bookings right now.",
      );
    } finally {
      const elapsed = Date.now() - loadingStartedAt;
      const remaining = Math.max(MIN_LOADING_MS - elapsed, 0);

      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }

      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const summary = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "pending")
        .length,
      confirmed: bookings.filter((booking) => booking.status === "upcoming")
        .length,
    }),
    [bookings],
  );

  const tabCounts = useMemo(
    () =>
      bookingTabs.reduce((counts, tab) => {
        counts[tab.id] = bookings.filter(
          (booking) => booking.status === tab.id,
        ).length;

        return counts;
      }, {}),
    [bookings],
  );

  // const completedMonthOptions = useMemo(() => {
  //   const completedBookings = bookings
  //     .filter((booking) => booking.status === "completed")
  //     .sort((firstBooking, secondBooking) => {
  //       return (
  //         getBookingDate(secondBooking.checkOut) -
  //         getBookingDate(firstBooking.checkOut)
  //       );
  //     });

  //   const monthMap = new Map();

  //   completedBookings.forEach((booking) => {
  //     const key = getMonthKey(booking.checkOut);

  //     if (!monthMap.has(key)) {
  //       monthMap.set(key, formatMonth(booking.checkOut));
  //     }
  //   });

  //   return [
  //     { value: "all", label: "All months" },
  //     ...Array.from(monthMap, ([value, label]) => ({ value, label })),
  //   ];
  // }, [bookings]);
  const completedMonthOptions = useMemo(() => {
      // 1. تصفية الحجوزات المكتملة مع التأكد من وجود تاريخ checkOut صالح
      const completedBookings = bookings
        .filter((booking) => 
          booking.status === "completed" && 
          booking.checkOut && 
          !isNaN(new Date(booking.checkOut).getTime()) // تأكيد صلاحية التاريخ
        )
        .sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut));

      const monthMap = new Map();

      completedBookings.forEach((booking) => {
        // استخدم قيمة checkOut مباشرة
        const dateValue = booking.checkOut;
        const key = getMonthKey(dateValue);

        if (!monthMap.has(key)) {
          monthMap.set(key, formatMonth(dateValue));
        }
      });

      // تحويل الـ Map إلى مصفوفة خيارات (Options) إذا كنت تحتاجها لـ Select
      return [
        { value: "all", label: "All months" },
        ...Array.from(monthMap.entries()).map(([value, label]) => ({
          value,
          label,
        })),
      ];
  }, [bookings]);

    // تعديل الدالة لتكون دفاعية
    function _formatMonth(value) {
      const date = getBookingDate(value);
      
      // التحقق النهائي قبل التنسيق
      if (isNaN(date.getTime())) {
        console.error("FormatMonth received an invalid date:", value);
        return "Unknown Month";
      }
      
      return monthFormatter.format(date);
    }

  const filteredBookings = useMemo(() => {
    const currentBookings = bookings.filter(
      (booking) => booking.status === activeTab,
    );

    if (activeTab !== "completed") {
      return currentBookings;
    }

    return currentBookings
      .filter(
        (booking) =>
          completedMonth === "all" ||
          getMonthKey(booking.checkOut) === completedMonth,
      )
      .sort((firstBooking, secondBooking) => {
        return (
          getBookingDate(secondBooking.checkOut) -
          getBookingDate(firstBooking.checkOut)
        );
      });
  }, [activeTab, bookings, completedMonth]);

  const isDenseCompletedGrid =
    activeTab === "completed" && filteredBookings.length > 4;
  const currentEmptyState = emptyStateCopy[activeTab];
  const selectedMonthLabel =
    completedMonthOptions.find((option) => option.value === completedMonth)
      ?.label || "All months";

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function handleCancelBooking() {
    if (!bookingToCancel) return;

    const token = localStorage.getItem("token");

    try {
      await axios.patch(
        buildApiUrl(`/api/my-bookings/${bookingToCancel.id}/cancel`),
        {},
        createAuthConfig(token),
      );

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingToCancel.id
            ? { ...booking, status: "cancelled" }
            : booking,
        ),
      );
      setBookingToCancel(null);
      setActiveTab("cancelled");
      showToast("Booking cancelled.");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not cancel booking.");
    }
  }

  function handleOpenReview(booking) {
    setBookingToReview(booking);
    setReviewRating(5);
    setReviewText("");
  }

  async function handleSubmitReview() {
    if (!bookingToReview) return;

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        buildApiUrl(`/api/my-bookings/${bookingToReview.id}/review`),
        {
          rating: reviewRating,
          comment: reviewText,
        },
        createAuthConfig(token),
      );

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingToReview.id
            ? { ...booking, reviewed: true }
            : booking,
        ),
      );
      setBookingToReview(null);
      setReviewText("");
      showToast("Review submitted.");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not submit review.");
    }
  }

  function handleViewProperty() {
    if (!selectedBooking) return;

    navigate(`/property-details/${selectedBooking.propertyId}`);
  }

  function handleSelectCompletedMonth(value) {
    setCompletedMonth(value);
    setIsMonthFilterOpen(false);
  }

  return (
    <div style={{ background: themeGlobal.colors.white }} className="bookings-page">
      <Header />

      <main className="bookings-shell">
        <section className="bookings-hero-card">
          <div className="bookings-hero__copy">
            <p className="bookings-kicker">Guest dashboard</p>
            <h1>My Bookings</h1>
            <p>
              Manage your upcoming stays, pending requests, and past trips
              across Northern Morocco.
            </p>
          </div>

          <div className="bookings-summary" aria-label="Booking summary">
            <article className="bookings-summary-card">
              <span>
                <FiCalendar aria-hidden="true" />
              </span>
              <div>
                <strong>{summary.total}</strong>
                <p>Total bookings</p>
              </div>
            </article>
            <article className="bookings-summary-card">
              <span>
                <FiClock aria-hidden="true" />
              </span>
              <div>
                <strong>{summary.pending}</strong>
                <p>Pending requests</p>
              </div>
            </article>
            <article className="bookings-summary-card">
              <span>
                <FiCheckCircle aria-hidden="true" />
              </span>
              <div>
                <strong>{summary.confirmed}</strong>
                <p>Confirmed bookings</p>
              </div>
            </article>
          </div>
        </section>

        <section className="bookings-tabs-card">
          <div
            className="bookings-tabs"
            role="tablist"
            aria-label="Booking status filters"
          >
            {bookingTabs.map((tab) => (
              <button
                className={
                  activeTab === tab.id
                    ? "bookings-tab bookings-tab--active"
                    : "bookings-tab"
                }
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMonthFilterOpen(false);
                }}
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

        <section className="bookings-content-section">
          {activeTab === "completed" ? (
            <div className="bookings-list-toolbar">
              <div>
                <p className="bookings-kicker">Past trips</p>
                <h2>Completed stays</h2>
              </div>
              <div
                className={
                  isMonthFilterOpen
                    ? "bookings-month-filter bookings-month-filter--open"
                    : "bookings-month-filter"
                }
              >
                <span>Filter by month</span>
                <button
                  className="bookings-month-filter__button"
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isMonthFilterOpen}
                  onClick={() =>
                    setIsMonthFilterOpen((currentState) => !currentState)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setIsMonthFilterOpen(false);
                    }
                  }}
                >
                  <span>{selectedMonthLabel}</span>
                  <FiChevronDown aria-hidden="true" />
                </button>

                {isMonthFilterOpen ? (
                  <div
                    className="bookings-month-filter__menu"
                    role="listbox"
                    aria-label="Completed bookings month"
                  >
                    {completedMonthOptions.map((option) => (
                      <button
                        className={
                          completedMonth === option.value
                            ? "bookings-month-filter__option bookings-month-filter__option--active"
                            : "bookings-month-filter__option"
                        }
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={completedMonth === option.value}
                        onClick={() => handleSelectCompletedMonth(option.value)}
                      >
                        <span>{option.label}</span>
                        {completedMonth === option.value ? (
                          <FiCheckCircle aria-hidden="true" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <div className="bookings-loading" aria-live="polite">
              {[1, 2, 3, 4].map((item) => (
                <div className="bookings-skeleton-card" key={item}>
                  <span className="bookings-skeleton bookings-skeleton--image" />
                  <div>
                    <span className="bookings-skeleton bookings-skeleton--title" />
                    <span className="bookings-skeleton bookings-skeleton--line" />
                    <span className="bookings-skeleton bookings-skeleton--line bookings-skeleton--short" />
                  </div>
                </div>
              ))}
            </div>
          ) : errorMessage ? (
            <div className="bookings-error">
              <div className="bookings-empty__icon">
                <FiXCircle aria-hidden="true" />
              </div>
              <h2>Bookings could not be loaded.</h2>
              <p>{errorMessage}</p>
              <button
                className="bookings-btn bookings-btn--primary"
                onClick={fetchBookings}
              >
                <FiClock aria-hidden="true" />
                Retry
              </button>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div
              className={
                isDenseCompletedGrid
                  ? "bookings-grid bookings-grid--dense"
                  : "bookings-grid"
              }
            >
              {filteredBookings.map((booking) => (
                <article className="bookings-card" key={booking.id}>
                  <div className="bookings-card__image">
                    <img src={booking.image} alt={booking.propertyTitle} />
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="bookings-card__content">
                    <div className="bookings-card__header">
                      <div>
                        <p>{booking.city}</p>
                        <h2>{booking.propertyTitle}</h2>
                      </div>
                      <strong>
                        {priceFormatter.format(booking.totalPrice)}
                      </strong>
                    </div>

                    <div className="bookings-meta">
                      <span>
                        <FiMapPin aria-hidden="true" />
                        {booking.location}
                      </span>
                      <span>
                        <FiCalendar aria-hidden="true" />
                        {formatDateRange(booking.checkIn, booking.checkOut)}
                      </span>
                      <span>
                        <FiUsers aria-hidden="true" />
                        {formatGuests(booking.guests)}
                      </span>
                      <span>
                        <FiUser aria-hidden="true" />
                        Hosted by {booking.hostName}
                      </span>
                    </div>

                    <div className="bookings-card__actions">
                      <BookingActions
                        booking={booking}
                        onDetails={() => setSelectedBooking(booking)}
                        onCancel={() => setBookingToCancel(booking)}
                        onReview={() => handleOpenReview(booking)}
                        onMessage={() =>
                          showToast("Messaging host is frontend preview only.")
                        }
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bookings-empty">
              <div className="bookings-empty__icon">
                <FiCalendar aria-hidden="true" />
              </div>
              <h2>{currentEmptyState.title}</h2>
              <p>{currentEmptyState.text}</p>
              <button
                className="bookings-btn bookings-btn--primary"
                onClick={() => navigate("/properties?city=Tangier")}
              >
                <MdOutlineExplore size={18} />
                Explore properties
              </button>
            </div>
          )}
        </section>
      </main>

      {/* <Footer /> */}

      <BookingModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onViewProperty={handleViewProperty}
      />
      <CancelModal
        booking={bookingToCancel}
        onClose={() => setBookingToCancel(null)}
        onConfirm={handleCancelBooking}
      />
      <ReviewModal
        booking={bookingToReview}
        rating={reviewRating}
        reviewText={reviewText}
        onRating={setReviewRating}
        onText={setReviewText}
        onClose={() => setBookingToReview(null)}
        onSubmit={handleSubmitReview}
      />

      {toast ? (
        <div className="bookings-toast" role="status" aria-live="polite">
          <FiCheckCircle aria-hidden="true" />
          <span>{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
