// Importing the logo
import Logo from '../assets/logo.png'
// Importing the css file 
import '../Home.css'
// Importing theme

import { Link, Navigate, replace , useNavigate } from 'react-router-dom';

import { useThemeGlobal } from '../Contexts/ThemeContext';
import React, { useEffect, useState } from "react";
import Container from '@mui/material/Container'
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import Button from '@mui/material/Button';

// Avatar 
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';

// Avatar pictures
import profilePicture1 from '../assets/1.jpg'
import { useToken } from '../Contexts/TokenContext';



export default function Header(){

    // Contexts ######################

    // theme
    const themeGlobal = useThemeGlobal();

    // token context
    const {token , setToken , user , setUser} = useToken();


    // Navigate ########

    const navigate = useNavigate(); 



    // Start header things
    // ##################### START ########################
    
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleProfileMenuOpen = (event) => { 

        
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleSignOut = () => {
        // remove the token and the user from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Update the states of token and the user
        setToken(null);
        setUser(null);
        // navigate to authentication
        navigate("/Authentication", { replace: true });
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    }

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        >

        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        {/* We will set the sign out here */}
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        
        <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        id={mobileMenuId}
        keepMounted
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        >
        <MenuItem>
            <IconButton size="large" aria-label="show 4 new mails" color="inherit">
            <Badge badgeContent={4} color="error">
                <MailIcon />
            </Badge>
            </IconButton>
            <p>Messages</p>
        </MenuItem>
        <MenuItem>
            <IconButton
            size="large"
            aria-label="show 17 new notifications"
            color="inherit"
            >
            <Badge badgeContent={17} color="error">
                <NotificationsIcon />
            </Badge>
            </IconButton>
            <p>Notifications</p>
        </MenuItem>
        <MenuItem onClick={handleProfileMenuOpen}>
            <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            color="inherit"
            >
            <AccountCircle />
            </IconButton>
            <p>Profile</p>
        </MenuItem>
        </Menu>
    );



    // ##################### END ########################

    return (
            <>
                {/* Start header */}
                <Container
                    maxWidth={false}
                    disableGutters
                    sx={{
                        width: "min(100%, 1480px)",
                        margin: "0 auto",
                        padding: { xs: "0 18px", sm: "0 24px", md: "0 32px" },
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"space-between",
                        background:themeGlobal.colors.background
                    }}
                >
                    <div className='font-luxury' style={{display:"flex" , alignItems:"center"}}>
                        <img style={{maxWidth:"100%", height:"70px"}} src={Logo} alt="" />
                        <h3 className='mb-0'>DarDarek</h3>                
                    </div>
                    <Box sx={{ flexGrow:1}}>
                        <Toolbar>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>

                            {
                                !token ?
                                    
                                    <Button
                                    component={Link}
                                    to="/Authentication"
                                    sx={{background:themeGlobal.colors.primary}}
                                    variant='contained'>
                                        Login to become a host
                                    </Button>
                                : <>
                                
                                    <IconButton
                                        size="large"
                                        aria-label="show 17 new notifications"
                                        sx={{color:themeGlobal.colors.primary}} 
                                        >
                                        <Badge sx={{marginRight:"10px"}} badgeContent={17} color="error">
                                            <NotificationsIcon/>
                                        </Badge>
                                        </IconButton>

                                        <IconButton
                                        size="large"
                                        edge="end"
                                        aria-label="account of current user"
                                        aria-controls={menuId}
                                        aria-haspopup="true"
                                        onClick={handleProfileMenuOpen}
                                        // color={}
                                        >
                                        <Stack direction="row" spacing={2}>
                                            <Avatar alt="Remy Sharp"/>
                                        </Stack>
                                    </IconButton>


                                </>
                            }
                                
                        </Box>
                        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                            {
                            token
                            ?
                            <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                            >
                            <MoreIcon />
                            </IconButton>
                            :
                            <Button
                                component={Link}
                                to="/Authentication"
                                sx={{background:themeGlobal.colors.primary}}
                                variant='contained'>
                                    Login to become a host
                            </Button>

                            }
                        </Box>
                        </Toolbar>
                    {renderMobileMenu}
                    {renderMenu}
                    </Box>
                </Container>
                {/* End header */}
            </>

    )
}
