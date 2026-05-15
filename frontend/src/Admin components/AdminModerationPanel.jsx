import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GavelIcon from "@mui/icons-material/Gavel";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { useToken } from "../Contexts/TokenContext";
import { buildApiUrl, createAuthConfig } from "../lib/api";

const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "dismissed", label: "Dismissed" },
    { value: "action_taken", label: "Action taken" },
];

const statusColor = {
    pending: "warning",
    reviewed: "info",
    dismissed: "default",
    action_taken: "success",
};

export default function AdminModerationPanel() {
    const { token } = useToken();
    const [reports, setReports] = useState([]);
    const [summary, setSummary] = useState({});
    const [statusFilter, setStatusFilter] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [notesByReport, setNotesByReport] = useState({});
    const [busyId, setBusyId] = useState(null);

    const selectedStatusLabel = useMemo(
        () => statusOptions.find((option) => option.value === statusFilter)?.label || "Reports",
        [statusFilter],
    );

    const fetchReports = async () => {
        if (!token) return;

        setLoading(true);
        setError("");
        try {
            const response = await axios.get(
                buildApiUrl(`/api/admin/reports?status=${statusFilter}`),
                createAuthConfig(token),
            );
            setReports(response.data.reports || []);
            setSummary(response.data.summary || {});
        } catch (fetchError) {
            setError(fetchError.response?.data?.message || "Could not load reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [token, statusFilter]);

    const updateReport = async (report, nextStatus) => {
        setBusyId(report.id_report);
        setMessage("");
        setError("");

        try {
            await axios.patch(
                buildApiUrl(`/api/admin/reports/${report.id_report}`),
                {
                    status: nextStatus,
                    admin_notes: notesByReport[report.id_report] || report.admin_notes || "",
                },
                createAuthConfig(token),
            );
            setMessage("Report updated.");
            await fetchReports();
        } catch (updateError) {
            setError(updateError.response?.data?.message || "Could not update report.");
        } finally {
            setBusyId(null);
        }
    };

    const updateSuspension = async (report, suspend) => {
        const userId = report.reported_user_id;
        if (!userId) return;

        const reason =
            notesByReport[report.id_report] ||
            report.admin_notes ||
            `Moderation action from report #${report.id_report}`;

        setBusyId(report.id_report);
        setMessage("");
        setError("");

        try {
            await axios.patch(
                buildApiUrl(`/api/admin/users/${userId}/suspension`),
                { suspend, reason },
                createAuthConfig(token),
            );
            if (suspend) {
                await updateReport(report, "action_taken");
            } else {
                setMessage("User suspension removed.");
                await fetchReports();
            }
        } catch (suspendError) {
            setError(suspendError.response?.data?.message || "Could not update user.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
                    gap: 2,
                    mb: 3,
                }}
            >
                {statusOptions.map((status) => (
                    <Paper
                        key={status.value}
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid #E2E8F0",
                            cursor: "pointer",
                            backgroundColor: statusFilter === status.value ? "#F0FDFA" : "#fff",
                        }}
                        onClick={() => setStatusFilter(status.value)}
                    >
                        <Typography sx={{ color: "#64748B", fontSize: "0.84rem" }}>
                            {status.label}
                        </Typography>
                        <Typography sx={{ color: "#0F172A", fontSize: "1.8rem", fontWeight: 700 }}>
                            {summary[status.value] || 0}
                        </Typography>
                    </Paper>
                ))}
            </Box>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: "1px solid #E2E8F0",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                }}
            >
                <Box
                    sx={{
                        p: 2.5,
                        borderBottom: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: { xs: "stretch", sm: "center" },
                        justifyContent: "space-between",
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                    }}
                >
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
                            {selectedStatusLabel} reports
                        </Typography>
                        <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
                            Review complaints, document decisions, and block unsafe accounts.
                        </Typography>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ p: 2.5 }}>
                    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : reports.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 7, color: "#64748B" }}>
                            <ReportProblemOutlinedIcon sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }} />
                            <Typography sx={{ fontWeight: 600 }}>No reports in this queue</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {reports.map((report) => {
                                const isBusy = busyId === report.id_report;
                                const isSuspended = Number(report.reported_user_suspended) === 1;

                                return (
                                    <Paper
                                        key={report.id_report}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            border: "1px solid #E2E8F0",
                                            borderRadius: 2,
                                            backgroundColor: "#F8FAFC",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                                            <Box>
                                                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                                                    <Chip
                                                        size="small"
                                                        label={report.status?.replace("_", " ") || "pending"}
                                                        color={statusColor[report.status] || "default"}
                                                    />
                                                    <Chip size="small" label={report.category?.replace("_", " ") || "other"} />
                                                </Stack>
                                                <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>
                                                    {report.property_title || "Property unavailable"}
                                                </Typography>
                                                <Typography sx={{ color: "#64748B", fontSize: "0.86rem" }}>
                                                    Reporter: {report.reporter_name || "Unknown"} ({report.reporter_email || "no email"})
                                                </Typography>
                                                <Typography sx={{ color: "#64748B", fontSize: "0.86rem" }}>
                                                    Reported user: {report.reported_user_name || "Unknown"}
                                                    {isSuspended ? " - suspended" : ""}
                                                </Typography>
                                            </Box>
                                            <Typography sx={{ color: "#94A3B8", fontSize: "0.82rem" }}>
                                                #{report.id_report}
                                            </Typography>
                                        </Box>

                                        <Typography sx={{ color: "#334155", my: 2, lineHeight: 1.6 }}>
                                            {report.reason}
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={2}
                                            label="Admin notes"
                                            value={notesByReport[report.id_report] ?? report.admin_notes ?? ""}
                                            onChange={(event) =>
                                                setNotesByReport((current) => ({
                                                    ...current,
                                                    [report.id_report]: event.target.value,
                                                }))
                                            }
                                            sx={{ mb: 2, backgroundColor: "#fff" }}
                                        />

                                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CheckCircleOutlineIcon />}
                                                disabled={isBusy}
                                                onClick={() => updateReport(report, "reviewed")}
                                            >
                                                Mark reviewed
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="inherit"
                                                disabled={isBusy}
                                                onClick={() => updateReport(report, "dismissed")}
                                            >
                                                Dismiss
                                            </Button>
                                            {report.reported_user_id && (
                                                <Button
                                                    variant="contained"
                                                    color={isSuspended ? "success" : "error"}
                                                    startIcon={isSuspended ? <GavelIcon /> : <BlockIcon />}
                                                    disabled={isBusy}
                                                    onClick={() => updateSuspension(report, !isSuspended)}
                                                >
                                                    {isSuspended ? "Unsuspend user" : "Suspend user"}
                                                </Button>
                                            )}
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
