import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiClock,
  FiCheckCircle,
  FiInbox,
  FiXCircle,
  FiArrowLeft,
  FiCalendar,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Header from "./Home components/Header";
import { useThemeGlobal } from "./Contexts/ThemeContext";
import axios from "axios";
import { buildApiUrl } from "./lib/api";
import "./RentalRequests.css";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(price);
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return buildApiUrl(normalizedPath);
};

const getNightsCount = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

export default function RentalRequests() {
  const themeGlobal = useThemeGlobal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);

  // Notification-driven highlight
  const [highlightedId, setHighlightedId] = useState(() => {
    const raw = searchParams.get("bookingId");
    return raw ? Number(raw) : null;
  });
  const highlightRef = useRef(null);

  // Auto-clear highlight after 3.5 s
  useEffect(() => {
    if (!highlightedId) return;
    const t = setTimeout(() => setHighlightedId(null), 3500);
    return () => clearTimeout(t);
  }, [highlightedId]);

  // Scroll highlighted row into view once requests are loaded
  useEffect(() => {
    if (!highlightedId || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedId, requests]);

  useEffect(() => {
    const fetchRequests = async () => {
      const currentToken = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));

      try {
        const config = {
          headers: { Authorization: `Bearer ${currentToken}` },
          params: { id_user: currentUser.id },
        };
        const response = await axios.get(buildApiUrl("/api/rentalRequests"), config);
        if (response.data && response.data.rentalRequests) {
          setRequests(response.data.rentalRequests);
        }
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          alert("Session expired. Please login again.");
          navigate("/Authentication", { state: { from: location.pathname } });
        } else if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert(error.message || "An error occurred while fetching rental requests.");
        }
      }
    };

    fetchRequests();
  }, [navigate]);

  const handleApprove = async (requestId) => {
    const currentToken = localStorage.getItem("token");
    try {
      await axios.patch(
        buildApiUrl(`/api/rentalRequests/${requestId}/status`),
        { status: "approved" },
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "approved" } : r))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve request.");
    }
  };

  // --- Reject confirmation dialog state ---
  const [rejectConfirm, setRejectConfirm] = useState({ open: false, requestId: null });

  // Opens the confirmation dialog instead of rejecting immediately
  const handleReject = (requestId) => {
    setRejectConfirm({ open: true, requestId });
  };

  const cancelReject = () => setRejectConfirm({ open: false, requestId: null });

  // Actually performs the rejection after the host confirms
  const confirmReject = async () => {
    const { requestId } = rejectConfirm;
    setRejectConfirm({ open: false, requestId: null });
    const currentToken = localStorage.getItem("token");
    try {
      await axios.patch(
        buildApiUrl(`/api/rentalRequests/${requestId}/status`),
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "rejected", _justRejected: true } : r))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject request.");
    }
  };

  // Restores a session-rejected booking back to pending (undo safety net)
  const handleUndo = async (requestId) => {
    const currentToken = localStorage.getItem("token");
    try {
      await axios.patch(
        buildApiUrl(`/api/rentalRequests/${requestId}/status`),
        { status: "pending" },
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "pending", _justRejected: false } : r))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to undo rejection.");
    }
  };

  const requestStats = requests.reduce(
    (totals, request) => {
      const safeStatus = String(request.status || "").toLowerCase();
      totals.all += 1;
      if (safeStatus === "approved" || safeStatus === "accepted" || safeStatus === "confirmed") {
        totals.accepted += 1;
      } else if (safeStatus === "rejected" || safeStatus === "cancelled") {
        totals.rejected += 1;
      } else {
        totals.pending += 1;
      }
      return totals;
    },
    { all: 0, pending: 0, accepted: 0, rejected: 0 }
  );

  const statsCards = [
    {
      label: "All Requests",
      value: requestStats.all,
      icon: <FiInbox />,
      iconColor: "#00a9b5",
      iconBg: "rgba(0, 169, 181, 0.09)",
      valueColor: "#00a9b5",
    },
    {
      label: "Pending",
      value: requestStats.pending,
      icon: <FiClock />,
      iconColor: "#c98517",
      iconBg: "rgba(201, 133, 23, 0.09)",
      valueColor: "#c98517",
    },
    {
      label: "Accepted",
      value: requestStats.accepted,
      icon: <FiCheckCircle />,
      iconColor: "#157f57",
      iconBg: "rgba(21, 127, 87, 0.09)",
      valueColor: "#157f57",
    },
    {
      label: "Rejected",
      value: requestStats.rejected,
      icon: <FiXCircle />,
      iconColor: "#b73232",
      iconBg: "rgba(183, 50, 50, 0.09)",
      valueColor: "#b73232",
    },
  ];

  return (
    <>
      <Header />
      <div className="rental-requests-page">
        <div className="rental-requests-wrapper">
          <button className="requests-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>

          <div className="requests-header">
            <h1 className="requests-title">Rental requests</h1>
            <p className="requests-subtitle">Review and respond to guest rental requests</p>
          </div>

          <div className="requests-stats-grid">
            {statsCards.map((card) => (
              <div key={card.label} className="stat-card">
                <div
                  className="stat-card__icon"
                  style={{ color: card.iconColor, backgroundColor: card.iconBg }}
                >
                  {card.icon}
                </div>
                <div className="stat-card__content">
                  <h3 className="stat-card__value" style={{ color: card.valueColor }}>
                    {card.value}
                  </h3>
                  <p className="stat-card__label">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="requests-list">
            {requests.length === 0 ? (
              <div className="requests-empty">
                <p>No rental requests available.</p>
              </div>
            ) : (
              requests.map((request) => {
                const requestStatus = String(request.status || "").toLowerCase();
                const isPendingRequest = requestStatus === "pending";
                const isConfirmed = requestStatus === "approved" || requestStatus === "confirmed";
                const isRejected = requestStatus === "rejected" || requestStatus === "cancelled";

                const isHighlighted = request.id === highlightedId;

                return (
                  <div
                    key={request.id}
                    ref={isHighlighted ? highlightRef : null}
                    className={`request-row ${isHighlighted ? "request-row--highlighted" : ""} ${isRejected ? "request-row--rejected" : ""}`}
                  >
                    {/* Property Column */}
                    <div className="request-row__property">
                      <img
                        src={getImageUrl(request.image)}
                        alt={request.title}
                        className="request-row__img"
                      />
                      <div className="request-row__prop-info">
                        <h4>{request.title}</h4>
                        <p style={{ textTransform: "capitalize", color: "#8b5e3c" }}>
                          {request.city_name || request.city || "Morocco"}
                        </p>
                        <p>{request.property_type || "Entire stay"}</p>
                      </div>
                    </div>

                    {/* Guest Column */}
                    <div className="request-row__guest">
                      <h4>{request.guestName}</h4>
                      <p>{request.guestEmail || "No email"}</p>
                      <p>{request.tenant_phone || "No phone"}</p>
                    </div>

                    {/* Dates Column */}
                    <div className="request-row__dates">
                      <FiCalendar />
                      <div>
                        <h4>{formatDate(request.checkIn)}</h4>
                        <p>- {formatDate(request.checkOut)}</p>
                        <p>
                          {getNightsCount(request.checkIn, request.checkOut)} night
                          {getNightsCount(request.checkIn, request.checkOut) === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    {/* Price Column */}
                    <div className="request-row__price">
                      <h4>{formatPrice(request.totalPrice)}</h4>
                      <p>
                        (MAD{" "}
                        {Math.round(
                          Number(request.totalPrice || 0) /
                            Math.max(getNightsCount(request.checkIn, request.checkOut), 1)
                        ).toLocaleString("en-US")}{" "}
                        / night)
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div className="request-row__actions">
                      {isPendingRequest && (
                        <>
                          <button
                            className="action-btn action-btn--approve"
                            onClick={() => handleApprove(request.id)}
                          >
                            <FiCheckCircle /> Approve
                          </button>
                          <button
                            className="action-btn action-btn--reject"
                            onClick={() => handleReject(request.id)}
                          >
                            <FiXCircle /> Reject
                          </button>
                        </>
                      )}

                      {isConfirmed && (
                        <>
                          <span className="request-status-badge request-status-badge--approved">
                            Confirmed
                          </span>
                          {request.tenant_phone && (
                            <a
                              href={`https://wa.me/${String(request.tenant_phone).replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${request.guestName || "there"}, your booking for "${request.title}" has been confirmed on Dar Darek! We look forward to welcoming you.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-btn action-btn--contact"
                              style={{ textDecoration: "none" }}
                            >
                              <FaWhatsapp /> Contact
                            </a>
                          )}
                        </>
                      )}

                      {isRejected && (
                        <>
                          <span className="request-status-badge request-status-badge--rejected">
                            Declined
                          </span>
                          {request._justRejected && (
                            <button
                              className="action-btn action-btn--undo"
                              onClick={() => handleUndo(request.id)}
                            >
                              Undo Rejection
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Custom Modal for Reject Confirmation */}
      {rejectConfirm.open && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h3 className="custom-modal__title">Reject this request?</h3>
            <p className="custom-modal__text">
              Are you sure you want to reject this booking request? <strong>This cannot be undone</strong> once you leave the page.
            </p>
            <div className="custom-modal__actions">
              <button className="modal-btn modal-btn--cancel" onClick={cancelReject}>
                Keep it
              </button>
              <button className="modal-btn modal-btn--confirm" onClick={confirmReject}>
                Yes, reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
