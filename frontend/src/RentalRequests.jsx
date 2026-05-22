import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    AccessTimeOutlined,
    CheckCircleOutlineOutlined,
    InboxOutlined,
    CancelOutlined,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Header from "./Home components/Header";
import { useThemeGlobal } from "./Contexts/ThemeContext";
import axios from "axios";
import { buildApiUrl } from "./lib/api";

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
    const [requestNotice, setRequestNotice] = useState(null);

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
                    setRequestNotice({ type: "warning", text: "Your session expired. Please sign in again." });
                    navigate("/Authentication", { state: { from: location.pathname } });
                } else if (error.response && error.response.data && error.response.data.message) {
                    setRequestNotice({ type: "warning", text: error.response.data.message });
                } else {
                    setRequestNotice({ type: "warning", text: "Could not load rental requests. Please try again." });
                }
            }
        };

        fetchRequests();
    }, []);

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
            setRequestNotice({ type: "warning", text: error.response?.data?.message || "Could not approve this request. Please try again." });
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
            setRequestNotice({ type: "warning", text: error.response?.data?.message || "Could not reject this request. Please try again." });
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
            setRequestNotice({ type: "warning", text: error.response?.data?.message || "Could not restore this request. Please try again." });
        }
    };

    const getStatusStyles = (status) => {
        const safeStatus = String(status || "").toLowerCase();
        if (safeStatus === "approved" || safeStatus === "accepted" || safeStatus === "confirmed") {
            return { color: "#1f7a41", backgroundColor: "rgba(34, 197, 94, 0.12)" };
        }
        if (safeStatus === "rejected" || safeStatus === "cancelled") {
            return { color: "#d14343", backgroundColor: "rgba(239, 68, 68, 0.11)" };
        }
        return { color: "#c07a00", backgroundColor: "rgba(245, 158, 11, 0.14)" };
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
            icon: <InboxOutlined sx={{ color: "#11acc8", fontSize: "1.15rem" }} />,
            iconBg: "rgba(17, 172, 200, 0.09)",
            valueColor: "#11acc8",
        },
        {
            label: "Pending",
            value: requestStats.pending,
            icon: <AccessTimeOutlined sx={{ color: "#f59e0b", fontSize: "1.15rem" }} />,
            iconBg: "rgba(245, 158, 11, 0.1)",
            valueColor: "#f59e0b",
        },
        {
            label: "Accepted",
            value: requestStats.accepted,
            icon: <CheckCircleOutlineOutlined sx={{ color: "#5aa65a", fontSize: "1.15rem" }} />,
            iconBg: "rgba(90, 166, 90, 0.11)",
            valueColor: "#5aa65a",
        },
        {
            label: "Rejected",
            value: requestStats.rejected,
            icon: <CancelOutlined sx={{ color: "#ef4444", fontSize: "1.15rem" }} />,
            iconBg: "rgba(239, 68, 68, 0.09)",
            valueColor: "#ef4444",
        },
    ];

    return (
        <>
            <Header />

            <Box
                sx={{
                    minHeight: "calc(100vh - 66px)",
                    background: themeGlobal.colors.white,
                    padding: { xs: "24px 14px 42px", md: "34px 28px 54px" },
                }}
            >
                <Box sx={{ width: "min(1380px, 100%)", margin: "0 auto" }}>
                    <Button
                        onClick={() => navigate(-1)}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            mb: 2.5,
                            color: "#33515e",
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "999px",
                            padding: "8px 14px",
                            backgroundColor: "rgba(255, 255, 255, 0.75)",
                            border: "1px solid rgba(185, 167, 138, 0.28)",
                            "&:hover": { backgroundColor: "#ffffff" },
                        }}
                    >
                        Back
                    </Button>

                    <Box sx={{ marginBottom: "20px" }}>
                        <Typography
                            className="font-luxury"
                            sx={{
                                color: "#1f2937",
                                fontSize: { xs: "2rem", md: "2.45rem" },
                                lineHeight: 1.08,
                                mb: 1,
                            }}
                        >
                            Rental requests
                        </Typography>
                        <Typography sx={{ color: "#667085", maxWidth: "640px", lineHeight: 1.7, fontSize: "0.96rem" }}>
                            Review and respond to guest rental requests
                        </Typography>
                    </Box>

                    {requestNotice && (
                        <Alert
                            severity={requestNotice.type}
                            sx={{ borderRadius: "16px", mb: 2.5 }}
                            onClose={() => setRequestNotice(null)}
                        >
                            {requestNotice.text}
                        </Alert>
                    )}

                    {/* Stats */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        {statsCards.map((card) => (
                            <Box
                                key={card.label}
                                sx={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: "16px",
                                    border: "1px solid rgba(226,232,240,0.85)",
                                    boxShadow: "0 10px 24px rgba(148, 163, 184, 0.08)",
                                    padding: "16px 18px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.6,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: card.iconBg,
                                        flexShrink: 0,
                                    }}
                                >
                                    {card.icon}
                                </Box>
                                <Box>
                                    <Typography sx={{ color: card.valueColor, fontSize: "1.7rem", fontWeight: 700, lineHeight: 1, mb: 0.45 }}>
                                        {card.value}
                                    </Typography>
                                    <Typography sx={{ color: "#344054", fontSize: "0.82rem", lineHeight: 1.35 }}>
                                        {card.label}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    {/* Table / Empty state */}
                    {requests.length === 0 ? (
                        <Box
                            sx={{
                                minHeight: "360px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                borderRadius: "20px",
                                backgroundColor: "rgba(255, 255, 255, 0.68)",
                                border: "1px dashed rgba(0, 169, 181, 0.28)",
                                padding: 3,
                            }}
                        >
                            <Typography sx={{ color: "#64748b", fontSize: { xs: "1rem", md: "1.1rem" }, fontWeight: 500 }}>
                                No rental requests available.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                                borderRadius: "24px",
                                overflow: "hidden",
                                border: "1px solid rgba(227, 232, 239, 0.95)",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 18px 40px rgba(148, 163, 184, 0.12)",
                            }}
                        >
                            <Table sx={{ minWidth: { xs: 0, md: 900 } }}>
                                <TableHead
                                    sx={{
                                        display: { xs: "none", md: "table-header-group" },
                                        backgroundColor: "#ffffff",
                                    }}
                                >
                                    <TableRow>
                                        {["Property", "Guest", "Dates", "Total Price", "Status", "Actions"].map((col, i) => (
                                            <TableCell
                                                key={col}
                                                align={i === 5 ? "center" : "left"}
                                                sx={{ fontWeight: 700, color: "#3c4a5d", fontSize: "0.78rem", py: 2.25, borderBottom: "1px solid rgba(226,232,240,0.9)" }}
                                            >
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {requests.map((request) => {
                                        const requestStatus = String(request.status || "").toLowerCase();
                                        const isPendingRequest = requestStatus === "pending";
                                        const isConfirmed = requestStatus === "approved" || requestStatus === "confirmed";
                                        const isRejected = requestStatus === "rejected";

                                        const cellBorder = { xs: "none", md: "1px solid rgba(226,232,240,0.88)" };
                                        const cellPadding = { xs: 0, md: "18px 16px" };

                                        return (
                                            <TableRow
                                                key={request.id}
                                                ref={request.id === highlightedId ? highlightRef : null}
                                                sx={{
                                                    display: { xs: "flex", md: "table-row" },
                                                    flexDirection: "column",
                                                    gap: { xs: 2, md: 0 },
                                                    padding: { xs: 2, md: 0 },
                                                    "&:hover": { backgroundColor: "rgba(248, 250, 252, 0.72)" },
                                                    "&:last-child td": { borderBottom: 0 },
                                                    borderBottom: { xs: "1px solid rgba(226, 232, 240, 0.9)", md: "none" },
                                                    opacity: isRejected ? 0.55 : 1,
                                                    transition: "opacity 0.3s, box-shadow 0.4s, background-color 0.4s",
                                                    ...(request.id === highlightedId && {
                                                        boxShadow: "inset 0 0 0 2px rgba(0,169,181,0.55), 0 0 18px rgba(0,169,181,0.18)",
                                                        backgroundColor: "rgba(0,169,181,0.05) !important",
                                                        borderRadius: { md: "12px" },
                                                    }),
                                                }}
                                            >
                                                {/* Property */}
                                                <TableCell sx={{ display: { xs: "block", md: "table-cell" }, padding: cellPadding, borderBottom: cellBorder }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
                                                        <Box
                                                            component="img"
                                                            src={getImageUrl(request.image)}
                                                            alt={request.title}
                                                            sx={{
                                                                width: { xs: "100%", sm: 66 },
                                                                maxWidth: { xs: "100%", sm: 66 },
                                                                height: { xs: 150, sm: 66 },
                                                                objectFit: "cover",
                                                                borderRadius: "14px",
                                                                flexShrink: 0,
                                                                border: "1px solid rgba(226,232,240,0.9)",
                                                                backgroundColor: "#f8fafc",
                                                            }}
                                                        />
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography sx={{ color: "#111827", fontWeight: 700, fontSize: "0.94rem", mb: 0.4, lineHeight: 1.3 }}>
                                                                {request.title}
                                                            </Typography>
                                                            <Typography sx={{ color: "#8b5e3c", fontSize: "0.73rem", mb: 0.2, textTransform: "capitalize" }}>
                                                                {request.city_name || request.city || "Morocco"}
                                                            </Typography>
                                                            <Typography sx={{ color: "#8c97a8", fontSize: "0.72rem" }}>
                                                                {request.property_type || "Entire stay"}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* Guest */}
                                                <TableCell sx={{ display: { xs: "block", md: "table-cell" }, padding: { xs: 0, md: 2.25 }, borderBottom: cellBorder }}>
                                                    <Typography sx={{ display: { xs: "block", md: "none" }, color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                                                        Guest name
                                                    </Typography>
                                                    <Typography sx={{ color: "#1f2937", fontWeight: 700, fontSize: "0.93rem", mb: 0.4 }}>
                                                        {request.guestName}
                                                    </Typography>
                                                    <Typography sx={{ color: "#8c97a8", fontSize: "0.74rem", mb: 0.2 }}>
                                                        {request.guestEmail || "—"}
                                                    </Typography>
                                                    <Typography sx={{ color: "#8c97a8", fontSize: "0.74rem" }}>
                                                        {request.tenant_phone || "—"}
                                                    </Typography>
                                                </TableCell>

                                                {/* Dates */}
                                                <TableCell sx={{ display: { xs: "block", md: "table-cell" }, padding: cellPadding, borderBottom: cellBorder }}>
                                                    <Typography sx={{ display: { xs: "block", md: "none" }, color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                                                        Dates
                                                    </Typography>
                                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.1 }}>
                                                        <CalendarTodayOutlinedIcon sx={{ fontSize: "0.95rem", color: "#7b8794", mt: 0.25 }} />
                                                        <Box>
                                                            <Typography sx={{ color: "#1f2937", fontWeight: 600, fontSize: "0.84rem", mb: 0.35 }}>
                                                                {formatDate(request.checkIn)}
                                                            </Typography>
                                                            <Typography sx={{ color: "#64748b", fontSize: "0.83rem", mb: 0.55 }}>
                                                                - {formatDate(request.checkOut)}
                                                            </Typography>
                                                            <Typography sx={{ color: "#8c97a8", fontSize: "0.74rem" }}>
                                                                {getNightsCount(request.checkIn, request.checkOut)} night{getNightsCount(request.checkIn, request.checkOut) === 1 ? "" : "s"}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* Total Price */}
                                                <TableCell sx={{ display: { xs: "block", md: "table-cell" }, padding: cellPadding, borderBottom: cellBorder }}>
                                                    <Typography sx={{ display: { xs: "block", md: "none" }, color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                                                        Total price
                                                    </Typography>
                                                    <Typography sx={{ color: "#1f2937", fontWeight: 700, fontSize: "0.92rem", mb: 0.45 }}>
                                                        {formatPrice(request.totalPrice)}
                                                    </Typography>
                                                    <Typography sx={{ color: "#8c97a8", fontSize: "0.72rem" }}>
                                                        (MAD {Math.round(Number(request.totalPrice || 0) / Math.max(getNightsCount(request.checkIn, request.checkOut), 1)).toLocaleString("en-US")} / night)
                                                    </Typography>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell sx={{ display: { xs: "block", md: "table-cell" }, padding: cellPadding, borderBottom: cellBorder }}>
                                                    <Typography sx={{ display: { xs: "block", md: "none" }, color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                                                        Status
                                                    </Typography>
                                                    <Chip
                                                        label={request.status}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: "0.73rem",
                                                            height: "28px",
                                                            borderRadius: "999px",
                                                            ...getStatusStyles(request.status),
                                                            "& .MuiChip-label": { px: 1.1 },
                                                        }}
                                                    />
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell
                                                    align="center"
                                                    sx={{ display: { xs: "block", md: "table-cell" }, padding: { xs: 0, md: 2.25 }, borderBottom: cellBorder }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: { xs: "flex-start", md: "center" },
                                                            flexDirection: { xs: "row", md: "column" },
                                                            alignItems: { xs: "stretch", md: "center" },
                                                            flexWrap: "wrap",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        {isPendingRequest ? (
                                                            <>
                                                                <Button
                                                                    variant="outlined"
                                                                    startIcon={<CheckCircleOutlineIcon sx={{ fontSize: "0.95rem" }} />}
                                                                    onClick={() => handleApprove(request.id)}
                                                                    sx={{
                                                                        minWidth: 108,
                                                                        textTransform: "none",
                                                                        borderRadius: "10px",
                                                                        padding: "6px 12px",
                                                                        fontWeight: 600,
                                                                        fontSize: "0.74rem",
                                                                        borderColor: "rgba(0, 169, 181, 0.35)",
                                                                        color: themeGlobal.colors.primary,
                                                                        backgroundColor: "rgba(255,255,255,0.98)",
                                                                        "&:hover": {
                                                                            borderColor: themeGlobal.colors.primary,
                                                                            backgroundColor: "rgba(0, 169, 181, 0.04)",
                                                                        },
                                                                    }}
                                                                >
                                                                    Approve
                                                                </Button>

                                                                <Button
                                                                    variant="outlined"
                                                                    startIcon={<HighlightOffIcon sx={{ fontSize: "0.95rem" }} />}
                                                                    onClick={() => handleReject(request.id)}
                                                                    sx={{
                                                                        minWidth: 108,
                                                                        textTransform: "none",
                                                                        borderRadius: "10px",
                                                                        padding: "6px 12px",
                                                                        fontWeight: 600,
                                                                        fontSize: "0.74rem",
                                                                        borderColor: "rgba(220, 38, 38, 0.35)",
                                                                        color: "#b91c1c",
                                                                        backgroundColor: "rgba(255,255,255,0.98)",
                                                                        "&:hover": {
                                                                            borderColor: "#dc2626",
                                                                            backgroundColor: "rgba(220, 38, 38, 0.05)",
                                                                        },
                                                                    }}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        ) : isConfirmed ? (
                                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8 }}>
                                                                <Box
                                                                    component="a"
                                                                    href={`https://wa.me/${String(request.tenant_phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${request.guestName || "there"}, your booking for "${request.title}" has been confirmed on Dar Darek! We look forward to welcoming you.`)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    sx={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: 0.8,
                                                                        textDecoration: "none",
                                                                        backgroundColor: "#25d366",
                                                                        color: "#ffffff",
                                                                        borderRadius: "10px",
                                                                        padding: "6px 13px",
                                                                        fontWeight: 600,
                                                                        fontSize: "0.74rem",
                                                                        whiteSpace: "nowrap",
                                                                        transition: "background-color 0.18s",
                                                                        "&:hover": { backgroundColor: "#1ebe5d" },
                                                                    }}
                                                                >
                                                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" style={{ flexShrink: 0 }}>
                                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                                    </svg>
                                                                    Contact Tenant
                                                                </Box>
                                                                <Chip
                                                                    label="Confirmed"
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        fontSize: "0.68rem",
                                                                        height: "22px",
                                                                        borderRadius: "999px",
                                                                        color: "#1f7a41",
                                                                        backgroundColor: "rgba(34, 197, 94, 0.12)",
                                                                        "& .MuiChip-label": { px: 1 },
                                                                    }}
                                                                />
                                                            </Box>
                                                        ) : isRejected ? (
                                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8 }}>
                                                                <Chip
                                                                    label="Declined"
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        fontSize: "0.71rem",
                                                                        height: "24px",
                                                                        borderRadius: "999px",
                                                                        color: "#b91c1c",
                                                                        backgroundColor: "rgba(220, 38, 38, 0.1)",
                                                                        border: "1px solid rgba(220, 38, 38, 0.22)",
                                                                        "& .MuiChip-label": { px: 1.1 },
                                                                    }}
                                                                />
                                                                {request._justRejected && (
                                                                    <Button
                                                                        size="small"
                                                                        onClick={() => handleUndo(request.id)}
                                                                        sx={{
                                                                            textTransform: "none",
                                                                            fontSize: "0.7rem",
                                                                            fontWeight: 600,
                                                                            color: "#64748b",
                                                                            padding: "2px 8px",
                                                                            borderRadius: "8px",
                                                                            border: "1px dashed rgba(100,116,139,0.35)",
                                                                            minWidth: 0,
                                                                            "&:hover": {
                                                                                backgroundColor: "rgba(100,116,139,0.06)",
                                                                                borderColor: "#64748b",
                                                                            },
                                                                        }}
                                                                    >
                                                                        ↩ Undo
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                        ) : (
                                                            <Typography sx={{ color: "#94a3b8", fontWeight: 700 }}>
                                                                —
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Box>
            {/* Reject Confirmation Dialog */}
            <Dialog
                open={rejectConfirm.open}
                onClose={cancelReject}
                PaperProps={{
                    sx: {
                        borderRadius: "18px",
                        padding: "8px 4px",
                        maxWidth: "400px",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.13)",
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#1f2937", pb: 0.5 }}>
                    Reject this request?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "#64748b", fontSize: "0.92rem", lineHeight: 1.65 }}>
                        Are you sure you want to reject this booking request?{" "}
                        <strong>This cannot be undone</strong> once you leave the page.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={cancelReject}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: "#64748b",
                            borderRadius: "10px",
                            px: 2,
                            "&:hover": { backgroundColor: "rgba(100,116,139,0.06)" },
                        }}
                    >
                        Keep it
                    </Button>
                    <Button
                        onClick={confirmReject}
                        variant="contained"
                        disableElevation
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "10px",
                            px: 2.5,
                            backgroundColor: "#dc2626",
                            "&:hover": { backgroundColor: "#b91c1c" },
                        }}
                    >
                        Yes, reject
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
