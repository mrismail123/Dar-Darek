import React, { useState } from 'react';
import AdminHeader from './Admin components/AdminHeader';
import PendingPropertiesTable from './Admin components/PendingPropertiesTable';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function AdminDashboard() {
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
                </Box>

                <PendingPropertiesTable />
            </Container>
        </Box>
    );
}
