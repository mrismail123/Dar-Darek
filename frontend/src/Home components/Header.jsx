// Importing the logo
import Logo from "../assets/dardarek-logo.png";
// Importing the css file
import "../Home.css";
// Importing theme

import { Link, Navigate, replace, useNavigate } from "react-router-dom";

import { useThemeGlobal } from "../Contexts/ThemeContext";
import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import Button from "@mui/material/Button";

// Avatar
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Divider from "@mui/material/Divider";

// Avatar pictures
import profilePicture1 from "../assets/1.jpg";
import { useToken } from "../Contexts/TokenContext";
import NotificationDropdown from "./NotificationDropdown";

export default function Header() {
  // Contexts ######################

  // theme
  const themeGlobal = useThemeGlobal();

  // token context
  const { token, setToken, user, setUser } = useToken();

  // Navigate ########

  const navigate = useNavigate();

  // Start header things
  // ##################### START ########################

  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
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
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
          mt: 1.5,
          borderRadius: "12px",
          minWidth: "220px",
          "& .MuiAvatar-root": {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          "&:before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      }}
    >
      <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
        <Avatar src={user?.profilePicture || profilePicture1} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontWeight: "600",
              fontSize: "0.95rem",
              color: "#111827",
            }}
          >
            {user?.name || "User Profile"}
          </span>
          <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            {user?.email || "Account Settings"}
          </span>
        </div>
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/my-bookings");
        }}
        sx={{ py: 1.2, color: "#374151" }}
      >
        <ReceiptLongOutlinedIcon
          sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
        />
        My Bookings
      </MenuItem>

      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/rental-requests");
        }}
        sx={{ py: 1.2, color: "#374151" }}
      >
        <EventNoteOutlinedIcon
          sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
        />
        Rental Requests
      </MenuItem>

      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/my-properties");
        }}
        sx={{ py: 1.2, color: "#374151" }}
      >
        <HomeWorkOutlinedIcon
          sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
        />
        My properties
      </MenuItem>

      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/my-favorites");
        }}
        sx={{ py: 1.2, color: "#374151" }}
      >
        <FavoriteBorderOutlinedIcon
          sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
        />
        Saved Favorites
      </MenuItem>

      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/account-settings");
        }}
        sx={{ py: 1.2, color: "#374151" }}
      >
        <SettingsOutlinedIcon
          sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
        />
        Account Settings
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      <MenuItem onClick={handleSignOut} sx={{ py: 1.2, color: "#DC2626" }}>
        <LogoutOutlinedIcon
          sx={{ mr: 2, color: "#DC2626", fontSize: "1.3rem" }}
        />
        Sign out
      </MenuItem>
    </Menu>
  );

  // ##################### END ########################

  return (
    <>
      {/* Start header */}
      <Box
        component="header"
        sx={{
          width: "100%",
          height: "66px",
          backgroundColor: themeGlobal.colors.white,
          boxShadow:
            "0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
          position: "relative",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            justifyContent: "space-between",
          }}
        >
          <div
            className="font-luxury"
            style={{ display: "flex", alignItems: "center" }}
          >
            <img
              style={{ maxWidth: "100%", height: "70px" }}
              src={Logo}
              alt=""
            />
            <h3 className="mb-0">DarDarek</h3>
          </div>
          <Box sx={{ flexGrow: 1 }}>
            <Toolbar>
              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                {!token ? (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Button
                      className="savedFavourite"
                      sx={{
                        color: themeGlobal.colors.gray,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        textTransform: "none",
                        marginRight: "15px",
                        position: "relative",
                      }}
                    >
                      <FavoriteBorderOutlinedIcon />
                      Saved
                    </Button>
                    <Button
                      component={Link}
                      to="/Authentication"
                      sx={{
                        color: themeGlobal.colors.gray,
                        textTransform: "none",
                        marginRight: "20px",
                      }}
                    >
                      <PermIdentityOutlinedIcon sx={{ marginRight: "5px" }} />
                      Log in
                    </Button>
                    <Button
                      component={Link}
                      to="/Authentication"
                      sx={{
                        background: themeGlobal.colors.primary,
                        display: "flex",
                        gap: "10px",
                      }}
                      variant="contained"
                    >
                      <HomeOutlinedIcon />
                      List your property
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Button
                      component={Link}
                      to="/new-listing"
                      target="_blank"
                      sx={{
                        background: themeGlobal.colors.primary,
                        display: "flex",
                        gap: "10px",
                        marginRight: "20px",
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                      variant="contained"
                    >
                      <HomeOutlinedIcon />
                      List your property
                    </Button>

                    <NotificationDropdown />

                    <IconButton
                      size="large"
                      edge="end"
                      aria-label="account of current user"
                      aria-controls={menuId}
                      aria-haspopup="true"
                      onClick={handleProfileMenuOpen}
                      sx={{
                        padding: 0.5,
                        border: "1px solid #E5E7EB",
                        borderRadius: "30px",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ px: 1 }}
                      >
                        <MenuIcon
                          sx={{ color: "#6B7280", fontSize: "1.2rem" }}
                        />
                        <Avatar
                          alt="User Profile"
                          src={user?.profilePicture || profilePicture1}
                          sx={{ width: 32, height: 32 }}
                        />
                      </Stack>
                    </IconButton>
                  </div>
                )}
              </Box>
              <Box sx={{ display: { xs: "flex", md: "none" } }}>
                {token ? (
                  <IconButton
                    size="large"
                    aria-label="show more"
                    aria-controls={menuId}
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    <MoreIcon />
                  </IconButton>
                ) : (
                  <Button
                    component={Link}
                    to="/Authentication"
                    sx={{ background: themeGlobal.colors.primary }}
                    variant="contained"
                  >
                    Login to become a host
                  </Button>
                )}
              </Box>
            </Toolbar>
            {renderMenu}
          </Box>
        </Container>
      </Box>
      {/* End header */}
    </>
  );
}
