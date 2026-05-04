import React, { useState } from 'react';
import AdminHeader from './Admin components/AdminHeader';
import PendingPropertiesTable from './Admin components/PendingPropertiesTable';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useThemeGlobal } from './Contexts/ThemeContext';

export default function AdminDashboard() {
    const themeGlobal = useThemeGlobal();

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#F1F5F9" }}>
            <AdminHeader />
            <Container
                maxWidth={false}
                sx={{
                    width: "min(100%, 1510px)",
                    margin: "0 auto",
                    padding: "40px 50px",
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "30px" }}>
                    <h2 className="font-luxury" style={{ color: "#1E293B", margin: 0 }}>Pending Properties</h2>

                    {/* The Total Pending Widget */}
                    <Box sx={{
                        backgroundColor: "#FFFFFF",
                        padding: "12px 24px 12px 16px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        border: "1px solid #E2E8F0"
                    }}>
                        <Box sx={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            border: `2px solid rgba(217, 161, 27, 0.2)`, // Gold subtle border
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#FFFAF0"
                        }}>
                            <AssignmentOutlinedIcon sx={{ color: themeGlobal.colors.primary, fontSize: "1.5rem" }} />
                        </Box>
                        <Box>
                            <Typography sx={{ color: "#64748B", fontSize: "0.85rem", fontWeight: 500, lineHeight: 1 }}>Total Pending</Typography>
                            <Typography sx={{ color: "#0D9488", fontSize: "1.8rem", fontWeight: 600, lineHeight: 1.2 }}>
                                {localStorage.getItem("howManyPending")}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <PendingPropertiesTable />
            </Container>
        </Box>
    );
}
