import { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    if (!imagePath) {
        return "";
    }

    if (imagePath.startsWith("http")) {
        return imagePath;
    }

    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return buildApiUrl(normalizedPath);
};

const getNightsCount = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end - start;

    if (Number.isNaN(diff) || diff <= 0) {
        return 0;
    }

    return Math.round(diff / (1000 * 60 * 60 * 24));
};

export default function RentalRequests() {
    const themeGlobal = useThemeGlobal();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);



    // a function to bring the requests from the backend and set them in the state
    useEffect(() => {
        const fetchRequests = async () => {
            const currentToken = localStorage.getItem("token");
            const currentUser = JSON.parse(localStorage.getItem("user"));

            try {

                const config = {
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                    },
                    params: {
                        id_user: currentUser.id
                    }
                };

                console.log(currentUser.id);
                const response = await axios.get(buildApiUrl('/api/rentalRequests'), config);

                console.log(response.data);                
                if(response.data && response.data.rentalRequests){
                    setRequests(response.data.rentalRequests);
                    console.log(requests);
                }

                // setRequests(response.data.rentalRequests);
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
    }, []);  






    const handleApprove = (requestId) => {
        
        setRequests((currentRequests) =>
            currentRequests.map((request) =>
                request.id === requestId
                    ? { ...request, status: "Approved" }
                    : request
            )
        );
    };

    const handleReject = (requestId) => {
        setRequests((currentRequests) =>
            currentRequests.map((request) =>
                request.id === requestId
                    ? { ...request, status: "Rejected" }
                    : request
            )
        );
    };

    const getStatusStyles = (status) => {
        const safeStatus = String(status || "").toLowerCase();

        if (safeStatus === "approved" || safeStatus === "accepted" || safeStatus === "confirmed") {
            return {
                color: "#1f7a41",
                backgroundColor: "rgba(34, 197, 94, 0.12)",
            };
        }

        if (safeStatus === "rejected" || safeStatus === "cancelled") {
            return {
                color: "#d14343",
                backgroundColor: "rgba(239, 68, 68, 0.11)",
            };
        }

        return {
            color: "#c07a00",
            backgroundColor: "rgba(245, 158, 11, 0.14)",
        };
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
                <Box
                    sx={{
                        width: "min(1380px, 100%)",
                        margin: "0 auto",
                    }}
                >
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
                            "&:hover": {
                                backgroundColor: "#ffffff",
                            },
                        }}
                    >
                        Back
                    </Button>
                    <Box sx={{marginBottom:"20px"}}>
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
                        <Typography
                            sx={{
                                color: "#667085",
                                maxWidth: "640px",
                                lineHeight: 1.7,
                                fontSize: "0.96rem",
                            }}
                        >
                            Review and respond to guest rental requests
                            {/* Review incoming stays, keep an eye on guest details,
                            and manage each booking request from one place. */}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                                lg: "repeat(4, minmax(0, 1fr))",
                            },
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
                                    <Typography
                                        sx={{
                                            color: card.valueColor,
                                            fontSize: "1.7rem",
                                            fontWeight: 700,
                                            lineHeight: 1,
                                            mb: 0.45,
                                        }}
                                    >
                                        {card.value}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: "#344054",
                                            fontSize: "0.82rem",
                                            lineHeight: 1.35,
                                        }}
                                    >
                                        {card.label}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
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
                                <Typography
                                    sx={{
                                        color: "#64748b",
                                        fontSize: { xs: "1rem", md: "1.1rem" },
                                        fontWeight: 500,
                                    }}
                                >
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
                                            <TableCell sx={{ fontWeight: 700, color: "#3c4a5d", fontSize: "0.78rem", py: 2.25, borderBottom: "1px solid rgba(226,232,240,0.9)" }}>
                                                Property
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: "#3c4a5d", fontSize: "0.78rem", py: 2.25, borderBottom: "1px solid rgba(226,232,240,0.9)" }}>
                                                Guest
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: "#3c4a5d", fontSize: "0.78rem", py: 2.25, borderBottom: "1px solid rgba(226,232,240,0.9)" }}>
                                                Dates
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: "#3c4a5d", fontSize: "0.78rem", py: 2.25, borderBottom: "1px solid rgba(226,232,240,0.9)" }}>
                                                Total Price
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: "#3c4a5d", fontSize: "0.78rem", py: 2.25, borderBottom: "1px solid rgba(226,232,240,0.9)" }}>
                                                Status
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, color: "#3c4a5d", fontSize: "0.78rem", py: 2.25, borderBottom: "1px solid rgba(226,232,240,0.9)" }}>
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {requests.map((request) => {
                                            const requestStatus = String(request.status || "").toLowerCase();
                                            const isPendingRequest = requestStatus === "pending";

                                            return (
                                            <TableRow
                                                key={request.id}
                                                sx={{
                                                    display: { xs: "flex", md: "table-row" },
                                                    flexDirection: "column",
                                                    gap: { xs: 2, md: 0 },
                                                    padding: { xs: 2, md: 0 },
                                                    "&:hover": {
                                                        backgroundColor: "rgba(248, 250, 252, 0.72)",
                                                    },
                                                    "&:last-child td": {
                                                        borderBottom: 0,
                                                    },
                                                    borderBottom: {
                                                        xs: "1px solid rgba(226, 232, 240, 0.9)",
                                                        md: "none",
                                                    },
                                                }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        display: { xs: "block", md: "table-cell" },
                                                        padding: { xs: 0, md: "18px 16px" },
                                                        borderBottom: {
                                                            xs: "none",
                                                            md: "1px solid rgba(226,232,240,0.88)",
                                                        },
                                                    }}
                                                >
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
                                                            <Typography
                                                                sx={{
                                                                    color: "#111827",
                                                                    fontWeight: 700,
                                                                    fontSize: "0.94rem",
                                                                    mb: 0.4,
                                                                    lineHeight: 1.3,
                                                                }}
                                                            >
                                                                {request.title}
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    color: "#8b5e3c",
                                                                    fontSize: "0.73rem",
                                                                    mb: 0.2,
                                                                    textTransform: "capitalize",
                                                                }}
                                                            >
                                                                {request.city_name || request.city || "Morocco"}
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    color: "#8c97a8",
                                                                    fontSize: "0.72rem",
                                                                }}
                                                            >
                                                                {request.property_type || "Entire stay"}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        display: { xs: "block", md: "table-cell" },
                                                        padding: { xs: 0, md: 2.25 },
                                                        borderBottom: {
                                                            xs: "none",
                                                            md: "1px solid rgba(226,232,240,0.88)",
                                                        },
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            display: { xs: "block", md: "none" },
                                                            color: "#94a3b8",
                                                            fontSize: "0.75rem",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.08em",
                                                            mb: 0.5,
                                                        }}
                                                    >
                                                        Guest name
                                                    </Typography>
                                                    <Typography sx={{ color: "#1f2937", fontWeight: 700, fontSize: "0.93rem", mb: 0.4 }}>
                                                        {request.guestName}
                                                    </Typography>
                                                    <Typography sx={{ color: "#8c97a8", fontSize: "0.74rem", mb: 0.2 }}>
                                                        {request.guestEmail || request.email || "guest@email.com"}
                                                    </Typography>
                                                    <Typography sx={{ color: "#8c97a8", fontSize: "0.74rem" }}>
                                                        {request.guestPhone || request.phone_number || "+212 6 00 00 00 00"}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        display: { xs: "block", md: "table-cell" },
                                                        padding: { xs: 0, md: "18px 16px" },
                                                        borderBottom: {
                                                            xs: "none",
                                                            md: "1px solid rgba(226,232,240,0.88)",
                                                        },
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            display: { xs: "block", md: "none" },
                                                            color: "#94a3b8",
                                                            fontSize: "0.75rem",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.08em",
                                                            mb: 0.5,
                                                        }}
                                                    >
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

                                                <TableCell
                                                    sx={{
                                                        display: { xs: "block", md: "table-cell" },
                                                        padding: { xs: 0, md: "18px 16px" },
                                                        borderBottom: {
                                                            xs: "none",
                                                            md: "1px solid rgba(226,232,240,0.88)",
                                                        },
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            display: { xs: "block", md: "none" },
                                                            color: "#94a3b8",
                                                            fontSize: "0.75rem",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.08em",
                                                            mb: 0.5,
                                                        }}
                                                    >
                                                        Total price
                                                    </Typography>
                                                    <Typography sx={{ color: "#1f2937", fontWeight: 700, fontSize: "0.92rem", mb: 0.45 }}>
                                                        {formatPrice(request.totalPrice)}
                                                    </Typography>
                                                    <Typography sx={{ color: "#8c97a8", fontSize: "0.72rem" }}>
                                                        (MAD {Math.round(Number(request.totalPrice || 0) / Math.max(getNightsCount(request.checkIn, request.checkOut), 1)).toLocaleString("en-US")} / night)
                                                    </Typography>
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        display: { xs: "block", md: "table-cell" },
                                                        padding: { xs: 0, md: "18px 16px" },
                                                        borderBottom: {
                                                            xs: "none",
                                                            md: "1px solid rgba(226,232,240,0.88)",
                                                        },
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            display: { xs: "block", md: "none" },
                                                            color: "#94a3b8",
                                                            fontSize: "0.75rem",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.08em",
                                                            mb: 0.5,
                                                        }}
                                                    >
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
                                                            "& .MuiChip-label": {
                                                                px: 1.1,
                                                            },
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        display: { xs: "block", md: "table-cell" },
                                                        padding: { xs: 0, md: 2.25 },
                                                        borderBottom: {
                                                            xs: "none",
                                                            md: "1px solid rgba(226,232,240,0.88)",
                                                        },
                                                    }}
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
                                                        ) : (
                                                            <Typography sx={{ color: "#94a3b8", fontWeight: 700 }}>
                                                                -
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
        </>
    );
}
