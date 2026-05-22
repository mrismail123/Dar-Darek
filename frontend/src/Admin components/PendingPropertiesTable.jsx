import React, { useState, useEffect, useMemo } from 'react';
import {
    Paper,
    Button,
    Typography,
    Box,
    Avatar,
    Dialog,
    DialogContent,
    DialogActions,
    IconButton,
    Divider,
    Chip,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import NightlightIcon from '@mui/icons-material/Nightlight';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useThemeGlobal } from '../Contexts/ThemeContext';
import { useToken } from '../Contexts/TokenContext';
import axios from 'axios';
import { buildApiUrl, createAuthConfig } from '../lib/api';




const statusOptions = [
    { value: 'pending', label: 'Pending', summaryKey: 'pending' },
    { value: 'approved', label: 'Accepted', summaryKey: 'approved' },
    { value: 'rejected', label: 'Rejected', summaryKey: 'rejected' },
    { value: 'all', label: 'All Properties', summaryKey: 'all' },
];

const statusColor = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
};

const normalizeImageUrl = (path) => {
    if (!path || typeof path !== 'string') return '';

    const clean = path.replace(/\\/g, '/').trim();
    if (!clean) return '';

    return clean.startsWith('http')
        ? clean
        : buildApiUrl(clean);
};

const normalizePropertyImages = (property) => {
    const rawImages = [];

    if (Array.isArray(property?.images)) {
        rawImages.push(...property.images);
    } else if (typeof property?.images === 'string' && property.images.trim()) {
        try {
            const parsedImages = JSON.parse(property.images);
            if (Array.isArray(parsedImages)) {
                rawImages.push(...parsedImages);
            } else {
                rawImages.push(property.images);
            }
        } catch {
            rawImages.push(property.images);
        }
    }

    if (Array.isArray(property?.property_images)) {
        rawImages.push(...property.property_images);
    }

    if (property?.main_image) {
        rawImages.unshift(property.main_image);
    }

    return [...new Set(
        rawImages
            .map((image) => {
                if (typeof image === 'string') {
                    return normalizeImageUrl(image);
                }

                return normalizeImageUrl(
                    image?.image_url || image?.url || image?.path || image?.src || ''
                );
            })
            .filter(Boolean)
    )];
};

// --- Image Gallery inside the modal ---
function ImageGallery({ images }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        setCurrent(0);
    }, [images]);

    if (!images || images.length === 0) {
        return (
            <Box sx={{
                width: '100%', height: 320,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#f1f5f9', color: '#94a3b8', fontSize: '0.9rem'
            }}>
                No images uploaded
            </Box>
        );
    }

    const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
    const next = () => setCurrent((c) => (c + 1) % images.length);

    return (
        <Box>
            {/* Main large image */}
            <Box sx={{ position: 'relative', width: '100%', height: 340, backgroundColor: '#0f172a', overflow: 'hidden' }}>
                <img
                    src={images[current]}
                    alt={`Photo ${current + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }}
                    onError={(e) => { e.target.style.opacity = 0; }}
                />

                {/* Counter badge */}
                <Box sx={{
                    position: 'absolute', bottom: 14, right: 16,
                    backgroundColor: 'rgba(0,0,0,0.55)', color: 'white',
                    borderRadius: '20px', px: 1.5, py: 0.4, fontSize: '0.82rem', fontWeight: 600
                }}>
                    {current + 1} / {images.length}
                </Box>

                {/* Prev / Next arrows */}
                {images.length > 1 && (
                    <>
                        <IconButton onClick={prev} sx={{
                            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(255,255,255,0.85)', width: 36, height: 36,
                            '&:hover': { backgroundColor: 'white' }
                        }}>
                            <ChevronLeftIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={next} sx={{
                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(255,255,255,0.85)', width: 36, height: 36,
                            '&:hover': { backgroundColor: 'white' }
                        }}>
                            <ChevronRightIcon fontSize="small" />
                        </IconButton>
                    </>
                )}
            </Box>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <Box sx={{
                    display: 'flex', gap: 1, p: '10px 16px',
                    overflowX: 'auto', backgroundColor: '#0f172a',
                    '&::-webkit-scrollbar': { height: '4px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }
                }}>
                    {images.map((img, i) => (
                        <Box
                            key={i}
                            onClick={() => setCurrent(i)}
                            sx={{
                                width: 64, height: 44, flexShrink: 0,
                                borderRadius: '6px', overflow: 'hidden', cursor: 'pointer',
                                border: i === current ? '2px solid #10b981' : '2px solid transparent',
                                opacity: i === current ? 1 : 0.55,
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <img
                                src={img}
                                alt={`thumb-${i}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

// --- Main Component ---
export default function PendingPropertiesTable() {
    const themeGlobal = useThemeGlobal();
    const { token } = useToken();

    // Property review queue state
    const [properties, setProperties] = useState([]);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [propertySummary, setPropertySummary] = useState({
        all: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [rejectDialogProperty, setRejectDialogProperty] = useState(null);
    const [rejectFeedback, setRejectFeedback] = useState('');
    const [rejectError, setRejectError] = useState('');
    const [rejectSubmitting, setRejectSubmitting] = useState(false);

    const selectedStatusLabel = useMemo(
        () => statusOptions.find((option) => option.value === statusFilter)?.label || 'Properties',
        [statusFilter],
    );

    const runOnEnterOrSpace = (event, action) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            action();
        }
    };

    const fetchProperties = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setErrorMessage('');
        try {
            const response = await axios.get(
                buildApiUrl(`/api/pendingProperties?status=${statusFilter}`),
                createAuthConfig(token),
            );
            const fetchedProperties = response.data.pendingProperties || [];
            const nextSummary = response.data.summary || {
                all: fetchedProperties.length,
                pending: fetchedProperties.length,
                approved: 0,
                rejected: 0,
            };

            setProperties(fetchedProperties);
            setPropertySummary(nextSummary);
            localStorage.setItem('howManyPending', JSON.stringify(nextSummary.pending || 0));
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Could not load properties.');
            if (error.response) {
                console.log(`Error: ${error.response.data}`);
            } else {
                console.log(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [token, statusFilter]);

    // Open modal: fetch full property detail including all images
    const handleOpenModal = async (property) => {
        setModalOpen(true);
        setModalLoading(true);
        setModalData(null);
        try {
            const response = await axios.get(
                buildApiUrl(`/api/houses/${property.id_property}`),
                createAuthConfig(token),
            );
            // Merge the host_email from the table row since /api/properties/:id doesn't return it separately
            const normalizedProperty = response.data?.property || {};

            setModalData({
                ...normalizedProperty,
                ...property,
                host_email: property.host_email,
                images: normalizePropertyImages(normalizedProperty),
            });
        } catch {
            // Fallback: use the table row data (no full images)
            setModalData({
                ...property,
                images: normalizePropertyImages(property),
            });
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalData(null);
    };

    const handleApprove = async (id) => {
        console.log(`Approving property with ID: ${id}`);
        try {
            await axios.post(
                buildApiUrl(`/api/admin/approve/${id}`),
                {},
                createAuthConfig(token),
            );
            await fetchProperties();
            // Trigger a storage event to update AdminDashboard badge immediately
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error("Error approving property:", error);
            setErrorMessage(error.response?.data?.message || "Could not approve this property. Please try again.");
        }
    };

    const handleOpenRejectDialog = (property) => {
        setRejectDialogProperty(property);
        setRejectFeedback(property?.admin_notes || '');
        setRejectError('');
    };

    const handleCloseRejectDialog = () => {
        if (rejectSubmitting) return;

        setRejectDialogProperty(null);
        setRejectFeedback('');
        setRejectError('');
    };

    const handleReject = async (id) => {
        const cleanFeedback = rejectFeedback.trim();

        if (cleanFeedback.length < 10) {
            setRejectError('Please add a helpful feedback note with at least 10 characters.');
            return;
        }

        console.log(`Rejecting property with ID: ${id}`);
        setRejectSubmitting(true);
        setRejectError('');

        try {
            await axios.post(
                buildApiUrl(`/api/admin/reject/${id}`),
                { admin_notes: cleanFeedback },
                createAuthConfig(token),
            );
            await fetchProperties();
            setRejectDialogProperty(null);
            setRejectFeedback('');
            setModalOpen(false);
            setModalData(null);
            // Trigger a storage event to update AdminDashboard badge immediately
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error("Error rejecting property:", error);
            setRejectError(error.response?.data?.message || "Failed to reject property.");
        } finally {
            setRejectSubmitting(false);
        }
    };

    const summaryCards = statusOptions.map((option) => ({
        ...option,
        filterValue: option.value,
        value: propertySummary[option.summaryKey] || 0,
        active: statusFilter === option.value,
    }));

    return (
        <>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                {summaryCards.map((card) => (
                    <Box
                        key={card.label}
                        component="div"
                        role="button"
                        tabIndex={0}
                        onClick={() => setStatusFilter(card.filterValue)}
                        onKeyDown={(event) => runOnEnterOrSpace(event, () => setStatusFilter(card.filterValue))}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #E2E8F0',
                            backgroundColor: card.active ? '#F0FDFA' : '#fff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                            '&:hover': {
                                borderColor: '#CBD5E1',
                                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
                                transform: 'translateY(-1px)',
                            },
                            '&:focus-visible': {
                                outline: '3px solid rgba(25, 118, 210, 0.25)',
                                outlineOffset: 2,
                            },
                        }}
                    >
                        <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                            {card.label}
                        </Typography>
                        <Typography sx={{ color: '#0F172A', fontSize: '1.8rem', fontWeight: 700 }}>
                            {card.value || 0}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                }}
            >
                <Box
                    sx={{
                        p: 2.5,
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' },
                    }}
                >
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {selectedStatusLabel} properties
                        </Typography>
                        <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>
                            Review submitted listings, inspect details, and approve or reject publication.
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
                    {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : properties.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 7, color: '#64748B' }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                            <Typography sx={{ fontWeight: 600 }}>
                                No {selectedStatusLabel.toLowerCase()} properties
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {properties.map((property) => {
                                const propertyStatus = property.status || 'pending';
                                const isPending = propertyStatus === 'pending';
                                const imageUrl = normalizeImageUrl(property.main_image);

                                return (
                                    <Paper
                                        key={property.id_property}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 2,
                                            backgroundColor: '#F8FAFC',
                                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                                            '&:hover': {
                                                borderColor: '#CBD5E1',
                                                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
                                                transform: 'translateY(-1px)',
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: { xs: '1fr', md: '180px minmax(0, 1fr) auto' },
                                                gap: 2,
                                                alignItems: { xs: 'stretch', md: 'center' },
                                            }}
                                        >
                                            <Box
                                                component="div"
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => handleOpenModal(property)}
                                                onKeyDown={(event) => runOnEnterOrSpace(event, () => handleOpenModal(property))}
                                                sx={{
                                                    width: '100%',
                                                    aspectRatio: { xs: '16 / 9', md: '4 / 3' },
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    backgroundColor: '#E2E8F0',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    border: '1px solid #E2E8F0',
                                                    p: 0,
                                                    appearance: 'none',
                                                    '&:hover .overlay, &:focus-visible .overlay': { opacity: 1 },
                                                    '&:focus-visible': {
                                                        outline: '3px solid rgba(25, 118, 210, 0.25)',
                                                        outlineOffset: 2,
                                                    },
                                                }}
                                                aria-label={`View details for ${property.title || `property ${property.id_property}`}`}
                                            >
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={property.title || 'Property'}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                    />
                                                ) : (
                                                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                                                        No image
                                                    </Box>
                                                )}
                                                <Box className="overlay" sx={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    backgroundColor: 'rgba(15,23,42,0.48)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s ease',
                                                    color: 'white',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    textAlign: 'center',
                                                    px: 1,
                                                }}>
                                                    View details
                                                </Box>
                                            </Box>

                                            <Box sx={{ minWidth: 0 }}>
                                                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                                    <Chip
                                                        size="small"
                                                        label={propertyStatus}
                                                        color={statusColor[propertyStatus] || 'default'}
                                                        sx={{ textTransform: 'capitalize' }}
                                                    />
                                                    <Chip size="small" label={`#${property.id_property}`} />
                                                    {property.property_type && <Chip size="small" label={property.property_type} />}
                                                    {property.city_name && <Chip size="small" label={property.city_name} />}
                                                </Stack>

                                                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem', mb: 0.5 }}>
                                                    {property.title || 'Untitled property'}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: themeGlobal.colors.primary, fontSize: '1rem' }}>
                                                        {property.host_name ? property.host_name.charAt(0).toUpperCase() : 'H'}
                                                    </Avatar>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.86rem' }}>
                                                            {property.host_name || 'Unknown Host'}
                                                        </Typography>
                                                        <Typography sx={{ color: '#64748B', fontSize: '0.82rem', wordBreak: 'break-word' }}>
                                                            {property.host_email || 'No email provided'}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Stack direction="row" spacing={2} sx={{ color: '#64748B', fontSize: '0.82rem', flexWrap: 'wrap', gap: 1 }}>
                                                    {property.price_per_day && (
                                                        <Typography sx={{ color: '#334155', fontSize: '0.84rem' }}>
                                                            {Number(property.price_per_day).toLocaleString('en-MA')} MAD / night
                                                        </Typography>
                                                    )}
                                                    {property.bedrooms != null && (
                                                        <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                                                            {property.bedrooms} bedrooms
                                                        </Typography>
                                                    )}
                                                    {property.guests != null && (
                                                        <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                                                            {property.guests} guests
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </Box>

                                            <Stack
                                                direction={{ xs: 'row', md: 'column' }}
                                                spacing={1}
                                                sx={{
                                                    justifyContent: { xs: 'flex-start', md: 'center' },
                                                    alignItems: { xs: 'stretch', md: 'flex-end' },
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleOpenModal(property)}
                                                    sx={{ textTransform: 'none', borderRadius: 1.5, minWidth: 112 }}
                                                >
                                                    Details
                                                </Button>
                                                {propertyStatus !== 'rejected' && (
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        startIcon={<HighlightOffIcon />}
                                                        onClick={() => handleOpenRejectDialog(property)}
                                                        sx={{ textTransform: 'none', borderRadius: 1.5, minWidth: 112 }}
                                                    >
                                                        Reject
                                                    </Button>
                                                )}
                                                {propertyStatus !== 'approved' && (
                                                    <Button
                                                        variant={isPending ? 'contained' : 'outlined'}
                                                        color="primary"
                                                        size="small"
                                                        startIcon={<CheckCircleOutlineIcon />}
                                                        onClick={() => handleApprove(property.id_property)}
                                                        sx={{
                                                            textTransform: 'none',
                                                            borderRadius: 1.5,
                                                            boxShadow: 'none',
                                                            minWidth: 112,
                                                        }}
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Paper>

            {/* ---- PROPERTY OVERVIEW MODAL ---- */}
            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
                scroll="paper"
                PaperProps={{
                    sx: {
                        borderRadius: '18px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                    },
                }}
            >
                {/* Close button always visible */}
                <IconButton
                    onClick={handleCloseModal}
                    sx={{
                        position: 'absolute', top: 12, right: 12, zIndex: 10,
                        backgroundColor: 'rgba(0,0,0,0.45)', color: 'white', width: 36, height: 36,
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.65)' },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                {/* Loading state */}
                {modalLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                        <CircularProgress sx={{ color: themeGlobal.colors.primary }} />
                    </Box>
                )}

                {/* Modal content */}
                {!modalLoading && modalData && (
                    <>
                        {/* === Image Gallery === */}
                        <ImageGallery images={modalData.images || []} />

                        <DialogContent sx={{ p: 0 }}>
                            <Box sx={{ p: '28px 32px 0' }}>
                                {/* Title row */}
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5, lineHeight: 1.3 }}>
                                    {modalData.title}
                                </Typography>

                                {/* City + type chips row */}
                                <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                    {modalData.city_name && (
                                        <Chip
                                            icon={<LocationOnIcon sx={{ fontSize: '0.85rem !important' }} />}
                                            label={modalData.city_name}
                                            size="small"
                                            sx={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 500 }}
                                        />
                                    )}
                                    {modalData.property_type && (
                                        <Chip
                                            label={modalData.property_type}
                                            size="small"
                                            sx={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 500 }}
                                        />
                                    )}
                                    {modalData.price_per_day && (
                                        <Chip
                                            icon={<NightlightIcon sx={{ fontSize: '0.85rem !important' }} />}
                                            label={`${Number(modalData.price_per_day).toLocaleString('en-MA')} MAD / night`}
                                            size="small"
                                            sx={{ backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 600 }}
                                        />
                                    )}
                                </Box>

                                {/* Stats row */}
                                <Box sx={{
                                    display: 'flex', gap: 3, mb: 3,
                                    p: '14px 20px', borderRadius: '12px',
                                    backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                    flexWrap: 'wrap',
                                }}>
                                    {[
                                        { icon: <BedIcon sx={{ fontSize: '1.1rem', color: '#64748b' }} />, label: 'Bedrooms', value: modalData.bedrooms },
                                        { icon: <BathtubIcon sx={{ fontSize: '1.1rem', color: '#64748b' }} />, label: 'Bathrooms', value: modalData.bathrooms },
                                        { icon: <PeopleIcon sx={{ fontSize: '1.1rem', color: '#64748b' }} />, label: 'Guests', value: modalData.guests ?? modalData.guests_total },
                                    ].map((stat) => (
                                        <Box key={stat.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {stat.icon}
                                            <Box>
                                                <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1 }}>{stat.label}</Typography>
                                                <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>
                                                    {stat.value ?? '—'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Address */}
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1 }}>
                                    Address
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75, mb: 3 }}>
                                    {modalData.address || 'No address provided by the host.'}
                                </Typography>

                                {/* Description */}
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1 }}>
                                    Description
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75, mb: 3 }}>
                                    {modalData.description || 'No description provided by the host.'}
                                </Typography>

                                {/* Access details */}
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1 }}>
                                    Access Details
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75, mb: 3 }}>
                                    {modalData.access_instructions || 'No access instructions provided by the host.'}
                                </Typography>

                                {/* neighborhood details */}
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1 }}>
                                    Neighborhood Details
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75, mb: 3 }}>
                                    {modalData.neighborhood_description || 'No neighborhood information provided by the host.'}
                                </Typography>

                                {/* Amenities */}
                                {Array.isArray(modalData.amenities) && modalData.amenities.length > 0 && (
                                    <>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1 }}>
                                            Amenities
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                            {modalData.amenities.map((amenity) => (
                                                <Chip
                                                    key={amenity}
                                                    label={amenity}
                                                    size="small"
                                                    sx={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.8rem' }}
                                                />
                                            ))}
                                        </Box>
                                    </>
                                )}

                                <Divider sx={{ mb: 3 }} />

                                {/* Host info */}
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1.5 }}>
                                    Host Information
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ width: 50, height: 50, bgcolor: themeGlobal.colors.primary, fontSize: '1.1rem', fontWeight: 600 }}>
                                        {modalData.host_name ? modalData.host_name.charAt(0).toUpperCase() : 'H'}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>
                                            {modalData.host_name || 'Unknown Host'}
                                        </Typography>
                                        <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                            {modalData.host_email || 'No email provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{
                            p: '16px 32px',
                            borderTop: '1px solid #f1f5f9',
                            gap: 1.5,
                            justifyContent: 'flex-end',
                            backgroundColor: '#fafafa',
                            flexWrap: 'wrap',
                        }}>
                            <Button
                                onClick={handleCloseModal}
                                variant="outlined"
                                color="inherit"
                                sx={{ textTransform: 'none', borderRadius: 1.5, px: 3, py: 1, fontWeight: 600 }}
                            >
                                Close
                            </Button>
                            {(modalData.status || 'pending') !== 'rejected' && (
                                <Button
                                    onClick={() => handleOpenRejectDialog(modalData)}
                                    variant="outlined"
                                    color="error"
                                    startIcon={<HighlightOffIcon />}
                                    sx={{ textTransform: 'none', borderRadius: 1.5, px: 3, py: 1, fontWeight: 600 }}
                                >
                                    Reject Property
                                </Button>
                            )}
                            {(modalData.status || 'pending') !== 'approved' && (
                                <Button
                                    onClick={async () => { await handleApprove(modalData.id_property); handleCloseModal(); }}
                                    variant="contained"
                                    startIcon={<CheckCircleOutlineIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 1.5,
                                        px: 4,
                                        py: 1,
                                        fontWeight: 600,
                                        boxShadow: 'none',
                                    }}
                                >
                                    Approve Property
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Dialog
                open={Boolean(rejectDialogProperty)}
                onClose={handleCloseRejectDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '22px',
                        overflow: 'hidden',
                        boxShadow: '0 28px 80px rgba(15, 23, 42, 0.28)',
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                    },
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: 'rgba(15, 23, 42, 0.42)',
                        backdropFilter: 'blur(8px)',
                    },
                }}
            >
                <Box
                    sx={{
                        p: { xs: 2.5, sm: 3.5 },
                        background:
                            'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
                    }}
                >
                    <IconButton
                        onClick={handleCloseRejectDialog}
                        disabled={rejectSubmitting}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: 38,
                            height: 38,
                            backgroundColor: '#F8FAFC',
                            color: '#334155',
                            boxShadow: '0 8px 22px rgba(15, 23, 42, 0.08)',
                            '&:hover': { backgroundColor: '#F1F5F9' },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>

                    <Box
                        sx={{
                            width: 58,
                            height: 58,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '18px',
                            border: '1px solid rgba(180, 83, 9, 0.22)',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            color: '#B45309',
                            mb: 2.5,
                        }}
                    >
                        <HighlightOffIcon />
                    </Box>

                    <Typography
                        sx={{
                            color: '#0D9488',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            mb: 1,
                        }}
                    >
                        Rejection feedback
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            color: '#0F172A',
                            fontFamily: '"Cormorant Garamond", serif',
                            fontSize: { xs: '2rem', sm: '2.35rem' },
                            lineHeight: 1.05,
                            mb: 1,
                        }}
                    >
                        Tell the host what needs revision.
                    </Typography>
                    <Typography sx={{ color: '#64748B', lineHeight: 1.7, mb: 2.5 }}>
                        These notes will appear in the host's My Properties feedback modal for{' '}
                        <strong>{rejectDialogProperty?.title || 'this listing'}</strong>.
                    </Typography>

                    {rejectError ? (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {rejectError}
                        </Alert>
                    ) : null}

                    <TextField
                        label="Feedback and revision notes"
                        value={rejectFeedback}
                        onChange={(event) => setRejectFeedback(event.target.value)}
                        placeholder={"Example:\nUpload a readable ownership document.\nReplace the cover image with a brighter room photo.\nConfirm the guest capacity matches the beds."}
                        multiline
                        minRows={6}
                        fullWidth
                        autoFocus
                        helperText="Tip: write each requested change on a new line so it appears as clear bullets to the host."
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                backgroundColor: '#FFFFFF',
                                alignItems: 'flex-start',
                            },
                            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                                borderColor: '#0D9488',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#0D9488',
                            },
                        }}
                    />
                </Box>

                <DialogActions
                    sx={{
                        px: { xs: 2.5, sm: 3.5 },
                        py: 2.25,
                        gap: 1.25,
                        flexWrap: 'wrap',
                        borderTop: '1px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                    }}
                >
                    <Button
                        onClick={handleCloseRejectDialog}
                        disabled={rejectSubmitting}
                        variant="outlined"
                        color="inherit"
                        sx={{ textTransform: 'none', borderRadius: 999, px: 3, fontWeight: 700 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleReject(rejectDialogProperty?.id_property)}
                        disabled={rejectSubmitting || !rejectDialogProperty}
                        variant="contained"
                        color="error"
                        startIcon={<HighlightOffIcon />}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 999,
                            px: 3,
                            fontWeight: 800,
                            boxShadow: '0 12px 24px rgba(220, 38, 38, 0.18)',
                        }}
                    >
                        {rejectSubmitting ? 'Saving feedback...' : 'Reject and send feedback'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
