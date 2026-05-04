import Logo from '../assets/Logo.png';
import '../Home.css';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeGlobal } from '../Contexts/ThemeContext';
import React, { useState } from "react";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import profilePicture1 from '../assets/1.jpg';
import { useToken } from '../Contexts/TokenContext';

export default function AdminHeader() {
    const themeGlobal = useThemeGlobal();
    const { token, setToken, user, setUser } = useToken();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        navigate("/Authentication", { replace: true });
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    }

    const menuId = 'admin-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
            PaperProps={{
                elevation: 0,
                sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                    mt: 1.5,
                    borderRadius: '12px',
                    minWidth: '220px',
                    '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
                    '&:before': {
                        content: '""', display: 'block', position: 'absolute', top: 0, right: 14,
                        width: 10, height: 10, bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)', zIndex: 0,
                    },
                },
            }}
        >
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
                <Avatar src={user?.profilePicture || profilePicture1} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#111827' }}>{user?.name || "Admin"}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Administrator</span>
                </div>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleSignOut} sx={{ py: 1.2, color: '#DC2626' }}>
                <LogoutOutlinedIcon sx={{ mr: 2, color: '#DC2626', fontSize: '1.3rem' }} />
                Sign out
            </MenuItem>
        </Menu>
    );

    return (
        <Box
            component="header"
            sx={{
                width: "100%",
                height: "66px",
                backgroundColor: "#F8FAFC", // Slightly off-white/blue to distinguish from main site
                borderBottom: `2px solid ${themeGlobal.colors.primary}`, // Distinguishing border
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
                position: "relative",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Container
                maxWidth={false}
                disableGutters
                sx={{
                    width: "min(100%, 1510px)",
                    margin: "0 auto",
                    padding: "0 50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <div className='font-luxury' style={{ display: "flex", alignItems: "center" }}>
                    <img style={{ maxWidth: "100%", height: "50px", marginRight: "10px" }} src={Logo} alt="DarDarek Logo" />
                    <h3 className='mb-0' style={{ color: "#1E293B" }}>DarDarek <span style={{ color: themeGlobal.colors.primary, fontSize: "0.8em" }}>Admin</span></h3>
                </div>
                <Box sx={{ flexGrow: 1 }}>
                    <Toolbar>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <IconButton
                                    size="large"
                                    edge="end"
                                    aria-label="account of current user"
                                    aria-controls={menuId}
                                    aria-haspopup="true"
                                    onClick={handleProfileMenuOpen}
                                    sx={{ padding: 0.5, border: '1px solid #E5E7EB', borderRadius: '30px', backgroundColor: "#fff" }}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1 }}>
                                        <MenuIcon sx={{ color: '#6B7280', fontSize: '1.2rem' }} />
                                        <Avatar alt="User Profile" src={user?.profilePicture || profilePicture1} sx={{ width: 32, height: 32 }} />
                                    </Stack>
                                </IconButton>
                            </div>
                        </Box>
                    </Toolbar>
                    {renderMenu}
                </Box>
            </Container>
        </Box>
    )
}
