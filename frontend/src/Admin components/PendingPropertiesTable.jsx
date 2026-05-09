import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import NightlightIcon from '@mui/icons-material/Nightlight';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useThemeGlobal } from '../Contexts/ThemeContext';
import { useToken } from '../Contexts/TokenContext';
import axios from 'axios';
import { buildApiUrl, createAuthConfig } from '../lib/api';

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

    // Table data state
    const [pendingPropertiesFromServer, setPendingPropertiesFromServer] = useState([]);
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

    // Fetch pending properties for the table
    useEffect(() => {
        const extractPendingProperties = async () => {
            if (!token) {
                return;
            }

            try {
                const response = await axios.get(
                    buildApiUrl('/api/pendingProperties'),
                    createAuthConfig(token),
                );
                const fetchedProperties = response.data.pendingProperties;
                setPendingPropertiesFromServer(fetchedProperties);
                setPropertySummary(response.data.summary || {
                    all: fetchedProperties.length,
                    pending: fetchedProperties.length,
                    approved: 0,
                    rejected: 0,
                });
                localStorage.setItem('howManyPending', JSON.stringify(fetchedProperties.length));
            } catch (error) {
                if (error.response) {
                    console.log(`Error: ${error.response.data}`);
                } else {
                    console.log(error.message);
                }
            }
        };
        extractPendingProperties();
    }, [token]);

    // Open modal: fetch full property detail including all images
    const handleOpenModal = async (property) => {
        setModalOpen(true);
        setModalLoading(true);
        setModalData(null);
        try {
            const response = await axios.get(buildApiUrl(`/api/houses/${property.id_property}`));
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
            // Remove from state
            const updatedProperties = pendingPropertiesFromServer.filter(p => p.id_property !== id);
            setPendingPropertiesFromServer(updatedProperties);
            setPropertySummary((currentSummary) => ({
                ...currentSummary,
                pending: Math.max(0, currentSummary.pending - 1),
                approved: currentSummary.approved + 1,
            }));
            localStorage.setItem('howManyPending', JSON.stringify(updatedProperties.length));
            // Trigger a storage event to update AdminDashboard badge immediately
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error("Error approving property:", error);
            alert("Failed to approve property.");
        }
    };

    const handleReject = async (id) => {
        console.log(`Rejecting property with ID: ${id}`);
        try {
            await axios.post(
                buildApiUrl(`/api/admin/reject/${id}`),
                {},
                createAuthConfig(token),
            );
            // Remove from state
            const updatedProperties = pendingPropertiesFromServer.filter(p => p.id_property !== id);
            setPendingPropertiesFromServer(updatedProperties);
            setPropertySummary((currentSummary) => ({
                ...currentSummary,
                pending: Math.max(0, currentSummary.pending - 1),
                rejected: currentSummary.rejected + 1,
            }));
            localStorage.setItem('howManyPending', JSON.stringify(updatedProperties.length));
            // Trigger a storage event to update AdminDashboard badge immediately
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error("Error rejecting property:", error);
            alert("Failed to reject property.");
        }
    };

    console.log(modalData);

    const summaryCards = [
        {
            label: 'All Properties',
            value: propertySummary.all,
            icon: <InboxOutlinedIcon sx={{ color: '#11acc8', fontSize: '1.15rem' }} />,
            iconBg: 'rgba(17, 172, 200, 0.09)',
            valueColor: '#11acc8',
        },
        {
            label: 'Pending',
            value: propertySummary.pending,
            icon: <AccessTimeOutlinedIcon sx={{ color: '#f59e0b', fontSize: '1.15rem' }} />,
            iconBg: 'rgba(245, 158, 11, 0.1)',
            valueColor: '#f59e0b',
        },
        {
            label: 'Accepted',
            value: propertySummary.approved,
            icon: <CheckCircleOutlineOutlinedIcon sx={{ color: '#5aa65a', fontSize: '1.15rem' }} />,
            iconBg: 'rgba(90, 166, 90, 0.11)',
            valueColor: '#5aa65a',
        },
        {
            label: 'Rejected',
            value: propertySummary.rejected,
            icon: <CancelOutlinedIcon sx={{ color: '#ef4444', fontSize: '1.15rem' }} />,
            iconBg: 'rgba(239, 68, 68, 0.09)',
            valueColor: '#ef4444',
        },
    ];

    return (
        <>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        xl: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                {summaryCards.map((card) => (
                    <Box
                        key={card.label}
                        sx={{
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            border: '1px solid rgba(226,232,240,0.85)',
                            boxShadow: '0 10px 24px rgba(148, 163, 184, 0.08)',
                            padding: '16px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.6,
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
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
                                    fontSize: '1.7rem',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    mb: 0.45,
                                }}
                            >
                                {card.value}
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#344054',
                                    fontSize: '0.82rem',
                                    lineHeight: 1.35,
                                }}
                            >
                                {card.label}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* ---- TABLE ---- */}
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                    border: '1px solid #E2E8F0',
                }}
            >
                <Table sx={{ minWidth: { xs: 0, md: 650 } }} aria-label="pending properties table">
                    <TableHead sx={{ display: { xs: 'none', md: 'table-header-group' }, backgroundColor: '#F8FAFC' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Property</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Host</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingPropertiesFromServer.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#CBD5E1' }} />
                                        <Typography variant="h6" sx={{ color: '#64748B', fontWeight: 500 }}>
                                            No pending properties
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            pendingPropertiesFromServer.map((property) => (
                                <TableRow
                                    key={property.id_property}
                                    sx={{
                                        display: { xs: 'flex', md: 'table-row' },
                                        flexDirection: 'column',
                                        gap: { xs: 2, md: 0 },
                                        p: { xs: 2, md: 0 },
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': { backgroundColor: '#F8FAFC' },
                                        borderBottom: { xs: '1px solid #E2E8F0', md: 'none' },
                                    }}
                                >
                                    {/* Property column */}
                                    <TableCell component="th" scope="row" sx={{ display: { xs: 'block', md: 'table-cell' }, p: { xs: 0, md: 2 }, borderBottom: { xs: 'none', md: '1px solid rgba(224,224,224,1)' } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {/* Clickable image */}
                                            <Box
                                                onClick={() => handleOpenModal(property)}
                                                sx={{
                                                    width: 160, height: 110,
                                                    borderRadius: '8px', overflow: 'hidden',
                                                    flexShrink: 0, backgroundColor: '#E2E8F0',
                                                    cursor: 'pointer', position: 'relative',
                                                    '&:hover .overlay': { opacity: 1 },
                                                }}
                                            >
                                                {property.main_image ? (
                                                    <img
                                                        src={normalizeImageUrl(property.main_image)}
                                                        alt={property.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                    />
                                                ) : (
                                                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                                                        No Image
                                                    </Box>
                                                )}
                                                {/* Hover overlay hint */}
                                                <Box className="overlay" sx={{
                                                    position: 'absolute', inset: 0,
                                                    backgroundColor: 'rgba(15,23,42,0.45)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    opacity: 0, transition: 'opacity 0.2s ease',
                                                    color: 'white', fontSize: '0.78rem', fontWeight: 600,
                                                    letterSpacing: '0.3px', textAlign: 'center', px: 1,
                                                }}>
                                                    View Details
                                                </Box>
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                                    {property.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
                                                    ID: #{property.id_property}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    {/* Host column */}
                                    <TableCell sx={{ display: { xs: 'block', md: 'table-cell' }, p: { xs: 0, md: 2 }, borderBottom: { xs: 'none', md: '1px solid rgba(224,224,224,1)' } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: themeGlobal.colors.primary, fontSize: '1rem' }}>
                                                {property.host_name ? property.host_name.charAt(0).toUpperCase() : 'H'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                                                    {property.host_name || 'Unknown Host'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
                                                    {property.host_email || 'No email provided'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    {/* Actions column */}
                                    <TableCell align="center" sx={{ display: { xs: 'block', md: 'table-cell' }, p: { xs: 0, md: 2 }, pt: { xs: 1, md: 2 }, borderBottom: { xs: 'none', md: '1px solid rgba(224,224,224,1)' } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Button
                                                variant="outlined" color="error" size="small"
                                                startIcon={<HighlightOffIcon />}
                                                onClick={() => handleReject(property.id_property)}
                                                sx={{ textTransform: 'none', borderRadius: '8px' }}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="contained" size="small"
                                                startIcon={<CheckCircleOutlineIcon />}
                                                onClick={() => handleApprove(property.id_property)}
                                                sx={{
                                                    textTransform: 'none', borderRadius: '8px',
                                                    backgroundColor: '#10B981', boxShadow: 'none',
                                                    '&:hover': { backgroundColor: '#059669' },
                                                }}
                                            >
                                                Approve
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
                                            label={`$${modalData.price_per_day} / night`}
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
                                        { icon: <PeopleIcon sx={{ fontSize: '1.1rem', color: '#64748b' }} />, label: 'Guests', value: modalData.guests },
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
                                    Acess Details
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

                        {/* === Action buttons === */}
                        <DialogActions sx={{
                            p: '16px 32px',
                            borderTop: '1px solid #f1f5f9',
                            gap: 1.5,
                            justifyContent: 'flex-end',
                            backgroundColor: '#fafafa',
                        }}>
                            <Button
                                onClick={() => { handleReject(modalData.id_property); handleCloseModal(); }}
                                variant="outlined"
                                color="error"
                                startIcon={<HighlightOffIcon />}
                                sx={{ textTransform: 'none', borderRadius: '9px', px: 3, py: 1, fontWeight: 600 }}
                            >
                                Reject Property
                            </Button>
                            <Button
                                onClick={() => { handleApprove(modalData.id_property); handleCloseModal(); }}
                                variant="contained"
                                startIcon={<CheckCircleOutlineIcon />}
                                sx={{
                                    textTransform: 'none', borderRadius: '9px', px: 4, py: 1, fontWeight: 600,
                                    backgroundColor: '#10b981',
                                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                                    '&:hover': { backgroundColor: '#059669', boxShadow: '0 4px 16px rgba(16,185,129,0.45)' },
                                }}
                            >
                                Approve Property
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
}
