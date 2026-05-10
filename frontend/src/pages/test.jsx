import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import Footer from "../Footer";
import tangierImage from "../assets/Tangier2.jpg";
import chefchaouenImage from "../assets/chefchaouen.jpg";
import tetouanImage from "../assets/tetouan-hero.jpg";
import martilImage from "../assets/beach.jpg";
import asilahImage from "../assets/ChaouenStreets.jpg";
import "./MyBookings.css";

const bookingTabs = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const initialBookings = [
  {
    id: "BK-2048",
    propertyId: "1",
    propertyTitle: "Sea-view riad apartment near the Kasbah",
    city: "Tangier",
    location: "Kasbah, Tangier",
    image: tangierImage,
    checkIn: "2026-06-14",
    checkOut: "2026-06-19",
    guests: 3,
    totalPrice: 4250,
    status: "upcoming",
    hostName: "Youssef El Amrani",
  },
  {
    id: "BK-2051",
    propertyId: "2",
    propertyTitle: "Blue medina hideaway with mountain terrace",
    city: "Chefchaouen",
    location: "Outa El Hammam, Chefchaouen",
    image: chefchaouenImage,
    checkIn: "2026-07-03",
    checkOut: "2026-07-06",
    guests: 2,
    totalPrice: 2880,
    status: "pending",
    hostName: "Salma Benjelloun",
  },
  {
    id: "BK-1986",
    propertyId: "3",
    propertyTitle: "Elegant Tetouan suite beside the old medina",
    city: "Tetouan",
    location: "Ensanche, Tetouan",
    image: tetouanImage,
    checkIn: "2026-03-21",
    checkOut: "2026-03-25",
    guests: 2,
    totalPrice: 3150,
    status: "completed",
    hostName: "Nadia El Fassi",
  },
  {
    id: "BK-2012",
    propertyId: "4",
    propertyTitle: "Sunny beach flat steps from Martil corniche",
    city: "Martil",
    location: "Corniche, Martil",
    image: martilImage,
    checkIn: "2026-05-28",
    checkOut: "2026-06-01",
    guests: 4,
    totalPrice: 3600,
    status: "upcoming",
    hostName: "Hamza Ait Lahcen",
  },
  {
    id: "BK-1904",
    propertyId: "5",
    propertyTitle: "Calm Asilah house near the ramparts",
    city: "Asilah",
    location: "Medina walls, Asilah",
    image: asilahImage,
    checkIn: "2026-02-07",
    checkOut: "2026-02-10",
    guests: 2,
    totalPrice: 2460,
    status: "cancelled",
    hostName: "Meryem Chafik",
  },
];

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

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const priceFormatter = new Intl.NumberFormat("en-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

function formatDateRange(checkIn, checkOut) {
  return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
}

function formatGuests(guests) {
  return `${guests} ${guests === 1 ? "guest" : "guests"}`;
}

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [bookingToReview, setBookingToReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [toast, setToast] = useState("");

  const summary = useMemo(
    () => ({
      upcoming: bookings.filter((booking) => booking.status === "upcoming")
        .length,
      pending: bookings.filter((booking) => booking.status === "pending")
        .length,
      completed: bookings.filter((booking) => booking.status === "completed")
        .length,
    }),
    [bookings],
  );

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => booking.status === activeTab),
    [activeTab, bookings],
  );

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function handleCancelBooking() {
    if (!bookingToCancel) return;

    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingToCancel.id
          ? { ...booking, status: "cancelled" }
          : booking,
      ),
    );
    setBookingToCancel(null);
    showToast("Booking cancelled for preview.");
  }

  function handleOpenReview(booking) {
    setBookingToReview(booking);
    setReviewRating(5);
    setReviewText("");
  }

  function handleSubmitReview() {
    if (!bookingToReview) return;

    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingToReview.id
          ? { ...booking, reviewed: true }
          : booking,
      ),
    );
    setBookingToReview(null);
    setReviewText("");
    showToast("Review submitted for preview.");
  }

  function handleViewProperty() {
    if (!selectedBooking) return;

    navigate(`/property-details/${selectedBooking.propertyId}`);
  }

  return (
    <div className="bookings-page">
      <Header />

      <main className="bookings-shell">
        <section className="bookings-hero">
          <div className="bookings-hero__copy">
            <p className="bookings-kicker">Guest dashboard</p>
            <h1>My bookings</h1>
            <p>
              Manage your upcoming stays, past trips, and booking requests in
              one place.
            </p>
          </div>

          <div className="bookings-summary" aria-label="Booking summary">
            <article className="bookings-summary-card">
              <span>
                <FiCalendar aria-hidden="true" />
              </span>
              <div>
                <strong>{summary.upcoming}</strong>
                <p>Upcoming trips</p>
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
                <strong>{summary.completed}</strong>
                <p>Completed stays</p>
              </div>
            </article>
          </div>
        </section>

        <section className="bookings-panel">
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
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
                aria-selected={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredBookings.length > 0 ? (
            <div className="bookings-grid">
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
              <h2>No {activeTab} bookings yet</h2>
              <p>
                When a reservation lands here, it will appear with all the
                details you need.
              </p>
              <button
                className="bookings-btn bookings-btn--primary"
                onClick={() => navigate("/properties")}
              >
                <FiHome aria-hidden="true" />
                Explore stays
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />

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
