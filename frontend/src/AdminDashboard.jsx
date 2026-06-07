import React, { useState } from 'react';
import AdminHeader from './Admin components/AdminHeader';
import PendingPropertiesTable from './Admin components/PendingPropertiesTable';
import AdminModerationPanel from './Admin components/AdminModerationPanel';
import AdminUsersPanel from './Admin components/AdminUsersPanel';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [activeView, setActiveView] = useState('properties');
    const navigate = useNavigate();

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
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                        marginBottom: "30px",
                        flexDirection: { xs: 'column', sm: 'row' },
                    }}
                >
                    <h2 className="font-luxury" style={{ color: "#1E293B", margin: 0 }}>
                        {activeView === 'properties' ? 'Pending Properties' : activeView === 'users' ? 'User Management' : 'Moderation Reports'}
                    </h2>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                        <Button
                            onClick={() => navigate('/')}
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 999,
                                px: 2.2,
                                backgroundColor: '#FFFFFF',
                                borderColor: '#CBD5E1',
                                color: '#1E293B',
                                fontWeight: 700,
                                '&:hover': {
                                    borderColor: '#00A9B5',
                                    backgroundColor: 'rgba(0, 169, 181, 0.08)',
                                },
                            }}
                        >
                            View website
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1, backgroundColor: '#E2E8F0', p: 0.5, borderRadius: 2 }}>
                            <Button
                                onClick={() => setActiveView('properties')}
                                variant={activeView === 'properties' ? 'contained' : 'text'}
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                            >
                                Properties
                            </Button>
                            <Button
                                onClick={() => setActiveView('reports')}
                                variant={activeView === 'reports' ? 'contained' : 'text'}
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                            >
                                Reports
                            </Button>
                            <Button
                                onClick={() => setActiveView('users')}
                                variant={activeView === 'users' ? 'contained' : 'text'}
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                            >
                                Users
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {activeView === 'properties' ? <PendingPropertiesTable /> : activeView === 'users' ? <AdminUsersPanel /> : <AdminModerationPanel />}
            </Container>
        </Box>
    );
}
