import React from 'react';
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
    Avatar
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useThemeGlobal } from '../Contexts/ThemeContext';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

export default function PendingPropertiesTable({ properties, setProperties }) {
    // Pending properties state
    const [pendingPropertiesFromServer, setPendingPropertiesFromServer] = useState([]);

    // start storing pending properties from the server
    useEffect(() => {
        const extractPendingProperties = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/pendingProperties');

                // console.log(response.data.pendingProperties)
                const pendingProp = response.data.pendingProperties;
                localStorage.setItem("pendingProp", JSON.stringify(response.data.pendingProperties));
                setPendingPropertiesFromServer(JSON.parse(localStorage.getItem("pendingProp")));
            } catch (error) {
                if (error.response) {
                    alert("Error!");
                    console.log(`error occured:${error.response.details}`);
                } else {
                    alert("Unexpected behaviour occured....");
                    console.log(error.message);
                }

            }



        }
        extractPendingProperties();
    }, [])


    // // fill the table
    // const fillTableWithPendingProperties = pendingPropertiesFromServer?.map((property) => {
    //     return (
    //         <></>
    //     )
    // })


    // theme
    const themeGlobal = useThemeGlobal();

    // Placeholder functions for you to connect to the backend later
    const handleApprove = (id) => {
        console.log(`Approving property with ID: ${id}`);
        // TODO: Add axios.post call here to approve
        // e.g., await axios.post(`/api/admin/approve/${id}`);
        // Then filter the approved property out of state
    };

    const handleReject = (id) => {
        console.log(`Rejecting property with ID: ${id}`);
        // TODO: Add axios.post call here to reject
        // e.g., await axios.post(`/api/admin/reject/${id}`);
        // Then filter the rejected property out of state
    };

    console.log(pendingPropertiesFromServer.length)

    return (
        <TableContainer
            component={Paper}
            sx={{
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                overflow: "hidden",
                border: "1px solid #E2E8F0"
            }}
        >
            <Table sx={{ minWidth: { xs: 0, md: 650 } }} aria-label="pending properties table">
                <TableHead sx={{ display: { xs: 'none', md: 'table-header-group' }, backgroundColor: "#F8FAFC" }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Property</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Host</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: "#475569" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pendingPropertiesFromServer.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 60, color: "#CBD5E1" }} />
                                    <Typography variant="h6" sx={{ color: "#64748B", fontWeight: 500 }}>
                                        No pending properties
                                    </Typography>
                                    {/* <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                        All property submissions have been reviewed.
                                    </Typography> */}
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) :
                        (
                            pendingPropertiesFromServer?.map((property) => (
                                <TableRow
                                    key={property.id_property}
                                    sx={{
                                        display: { xs: 'flex', md: 'table-row' },
                                        flexDirection: 'column',
                                        gap: { xs: 2, md: 0 },
                                        p: { xs: 2, md: 0 },
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': { backgroundColor: "#F8FAFC" },
                                        borderBottom: { xs: '1px solid #E2E8F0', md: 'none' }
                                    }}
                                >
                                    <TableCell component="th" scope="row" sx={{ display: { xs: 'block', md: 'table-cell' }, p: { xs: 0, md: 2 }, borderBottom: { xs: 'none', md: '1px solid rgba(224, 224, 224, 1)' } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 60,
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    backgroundColor: '#E2E8F0'
                                                }}
                                            >
                                                {property.main_image ? (
                                                    <img
                                                        src={`http://localhost:5000${property.main_image}`}
                                                        alt={property.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>No Image</Box>
                                                )}
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1E293B" }}>
                                                    {property.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.8rem" }}>
                                                    ID: #{property.id_property}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ display: { xs: 'block', md: 'table-cell' }, p: { xs: 0, md: 2 }, borderBottom: { xs: 'none', md: '1px solid rgba(224, 224, 224, 1)' } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: themeGlobal.colors.primary, fontSize: "1rem" }}>
                                                {property.host_name ? property.host_name.charAt(0).toUpperCase() : 'H'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500, color: "#1E293B" }}>
                                                    {property.host_name || 'Unknown Host'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.8rem" }}>
                                                    {property.host_email || 'No email provided'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center" sx={{ display: { xs: 'block', md: 'table-cell' }, p: { xs: 0, md: 2 }, pt: { xs: 1, md: 2 }, borderBottom: { xs: 'none', md: '1px solid rgba(224, 224, 224, 1)' } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<HighlightOffIcon />}
                                                onClick={() => handleReject(property.id_property)}
                                                sx={{ textTransform: 'none', borderRadius: '8px' }}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<CheckCircleOutlineIcon />}
                                                onClick={() => handleApprove(property.id_property)}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '8px',
                                                    backgroundColor: "#10B981",
                                                    '&:hover': { backgroundColor: "#059669" },
                                                    boxShadow: 'none'
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
    );
}
