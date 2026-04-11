// Importing the logo
import Logo from './assets/logo.png'
// Importing the css file 
import './Home.css'
// Importing theme


import { useThemeGlobal } from './Contexts/ThemeContext';
import React from "react";
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
import profilePicture1 from './assets/1.jpg'



export default function Header(){
    // theme
    const themeGlobal = useThemeGlobal();



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

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

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
        <MenuItem onClick={handleMenuClose}>My account</MenuItem>
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

    // Show or Hide Login 
    const [showLogin , setShowLogin] = React.useState(true)

    // Show or Hide notification & avatar
    const [showNotiAva, setShowNotiAva] = React.useState(false)


    // ##################### END ########################

    return (
            <>
                {/* Start header */}
                <Container sx={{margin:"0 auto",display:"flex", alignItems:"center" ,justifyContent:"space-between" , background:themeGlobal.colors.background}}>
                    <div className='font-luxury' style={{display:"flex" , alignItems:"center"}}>
                        <img style={{maxWidth:"100%", height:"70px"}} src={Logo} alt="" />
                        <h3 className='mb-0'>DarDarek</h3>                
                    </div>
                    <Box sx={{ flexGrow:1}}>
                        <Toolbar>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>

                            {
                                showLogin && !showNotiAva ?
                                    <IconButton>
                                        <Button sx={{background:themeGlobal.colors.primary}} variant='contained'>Login to become a host</Button>
                                    </IconButton>
                                : <></>
                            }
                                
                                {

                                    showNotiAva && !showLogin ?
                                    <>
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
                                            <Avatar alt="Remy Sharp" src={profilePicture1} />
                                        </Stack>
                                        </IconButton>

                                    </>
                                    : <></>
                                }    
                        </Box>
                        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
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