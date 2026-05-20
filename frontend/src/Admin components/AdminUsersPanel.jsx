import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useToken } from "../Contexts/TokenContext";
import { buildApiUrl, createAuthConfig } from "../lib/api";

const statusOptions = [
    { value: "all", label: "All Users" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "inactive", label: "Inactive" },
];

export default function AdminUsersPanel() {
    const { token } = useToken();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Pagination & Filters
    const [page, setPage] = useState(0); // MUI TablePagination uses 0-based indexing
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Suspension Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [suspendReason, setSuspendReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState("");

    const fetchUsers = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError("");
        try {
            // Convert 0-based page to 1-based for the API
            const params = new URLSearchParams({
                page: page + 1,
                limit: rowsPerPage,
            });
            if (searchQuery) params.append("search", searchQuery);
            if (statusFilter !== "all") params.append("status", statusFilter);

            const response = await axios.get(
                buildApiUrl(`/api/admin/users?${params.toString()}`),
                createAuthConfig(token)
            );
            
            setUsers(response.data.users || []);
            setTotalUsers(response.data.pagination?.total || 0);
        } catch (fetchError) {
            setError(fetchError.response?.data?.message || "Could not load users.");
        } finally {
            setLoading(false);
        }
    }, [token, page, rowsPerPage, searchQuery, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(0); // Reset to first page on search
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0); // Reset to first page on filter
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const openSuspendDialog = (user) => {
        setSelectedUser(user);
        setSuspendReason("");
        setDialogOpen(true);
    };

    const closeSuspendDialog = () => {
        setDialogOpen(false);
        setSelectedUser(null);
        setSuspendReason("");
    };

    const handleToggleSuspension = async () => {
        if (!selectedUser || !token) return;

        const willSuspend = !selectedUser.is_suspended;

        if (willSuspend && suspendReason.length < 8) {
            setError("A suspension reason of at least 8 characters is required.");
            return;
        }

        setActionLoading(true);
        setError("");
        setActionMessage("");

        try {
            await axios.patch(
                buildApiUrl(`/api/admin/users/${selectedUser.id_user}/suspension`),
                {
                    suspend: willSuspend,
                    reason: willSuspend ? suspendReason : null,
                },
                createAuthConfig(token)
            );
            
            setActionMessage(willSuspend ? "User suspended successfully." : "User unsuspended successfully.");
            closeSuspendDialog();
            fetchUsers(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.message || "Could not update user status.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Box>
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: "1px solid #E2E8F0" }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, width: '100%', maxWidth: '500px' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1 }} />
                            }}
                        />
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', md: 'auto' } }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={handleStatusFilterChange}
                        >
                            {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {actionMessage && <Alert severity="success" sx={{ mb: 2 }}>{actionMessage}</Alert>}

            <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #E2E8F0", overflow: 'hidden' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Joined</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Properties/Bookings</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748B' }}>
                                        No users found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id_user} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Typography sx={{ fontWeight: 500, color: '#0F172A' }}>{user.name}</Typography>
                                                <Typography variant="body2" sx={{ color: '#64748B' }}>{user.email}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ textTransform: 'capitalize', color: '#475569' }}>{user.role}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ color: '#475569' }}>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: '#475569' }}>
                                                {user.property_count} properties<br/>
                                                {user.booking_count} bookings
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_suspended ? (
                                                <Chip label="Suspended" color="error" size="small" />
                                            ) : user.is_active ? (
                                                <Chip label="Active" color="success" size="small" />
                                            ) : (
                                                <Chip label="Inactive" color="default" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color={user.is_suspended ? "success" : "error"}
                                                startIcon={user.is_suspended ? <CheckCircleOutlineIcon /> : <BlockIcon />}
                                                onClick={() => openSuspendDialog(user)}
                                            >
                                                {user.is_suspended ? "Unsuspend" : "Suspend"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalUsers}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Suspend/Unsuspend Dialog */}
            <Dialog open={dialogOpen} onClose={closeSuspendDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedUser?.is_suspended ? "Unsuspend User" : "Suspend User"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        {selectedUser?.is_suspended 
                            ? `Are you sure you want to restore access for ${selectedUser?.name}?`
                            : `You are about to suspend ${selectedUser?.name}. They will not be able to log in or use the platform.`
                        }
                    </DialogContentText>
                    
                    {!selectedUser?.is_suspended && (
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Reason for suspension"
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            helperText="Minimum 8 characters. This reason may be visible to the user."
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeSuspendDialog} color="inherit" disabled={actionLoading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleToggleSuspension} 
                        color={selectedUser?.is_suspended ? "success" : "error"} 
                        variant="contained"
                        disabled={actionLoading || (!selectedUser?.is_suspended && suspendReason.length < 8)}
                    >
                        {actionLoading ? <CircularProgress size={24} color="inherit" /> : (selectedUser?.is_suspended ? "Confirm Unsuspend" : "Confirm Suspend")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
