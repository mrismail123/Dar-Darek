import Logo from "../assets/dardarek-logo.png";
import "../Home.css";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useThemeGlobal } from "../Contexts/ThemeContext";
import { useToken } from "../Contexts/TokenContext";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";

import MenuIcon from "@mui/icons-material/Menu";
import MoreIcon from "@mui/icons-material/MoreVert";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

import profilePicture1 from "../assets/1.jpg";
import NotificationDropdown from "./NotificationDropdown";
import { buildApiUrl } from "../lib/api";
import axios from "axios";
import SuccessAlert from "../SuccessAlert";
const getProfilePictureSrc = (user) => {
  const picture = user?.profilePicture || user?.profile_picture;
  if (!picture) return profilePicture1;
  return String(picture).startsWith("/uploads") ? buildApiUrl(picture) : picture;
};

export default function Header() {
  const themeGlobal = useThemeGlobal();
  const { token, setToken, user, setUser } = useToken();
  const navigate = useNavigate();
  const userRole = user?.role;
  const isHost = userRole === "host" || userRole === "admin";
  const isAdmin = userRole === "admin";
  const profilePictureSrc = getProfilePictureSrc(user);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const [alertInfo, setAlertInfo] = React.useState({ show: false, message: "", subMessage: "", type: "error" });

  const menuId = "primary-search-account-menu";

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/Authentication", { replace: true });
  };

  const goTo = (path) => {
    handleMenuClose();
    navigate(path);
  };

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
            width: 38,
            height: 38,
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
      <MenuItem onClick={() => goTo("/account-settings")} sx={{ py: 1.5 }}>
        <Avatar
          src={profilePictureSrc}
          imgProps={{ style: { objectFit: "cover" } }}
        />
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

      {isAdmin && (
        <MenuItem
          onClick={() => goTo("/admin")}
          sx={{ py: 1.2, color: "#374151" }}
        >
          <AdminPanelSettingsOutlinedIcon
            sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
          />
          Admin Dashboard
        </MenuItem>
      )}

      <MenuItem
        onClick={() => goTo("/my-bookings")}
        sx={{ py: 1.2, color: "#374151" }}
      >
        <ReceiptLongOutlinedIcon
          sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
        />
        My Bookings
      </MenuItem>

      {isHost && (
        <MenuItem
          onClick={() => goTo("/rental-requests")}
          sx={{ py: 1.2, color: "#374151" }}
        >
          <EventNoteOutlinedIcon
            sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}

          />
          Rental Requests
        </MenuItem>
      )}

      {isHost && (
        <MenuItem
          onClick={() => goTo("/my-properties")}
          sx={{ py: 1.2, color: "#374151" }}
        >
          <HomeWorkOutlinedIcon
            sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
          />
          My properties
        </MenuItem>
      )}

      <MenuItem
        onClick={() => goTo("/my-favorites")}
        sx={{ py: 1.2, color: "#374151" }}
      >
        <FavoriteBorderOutlinedIcon
          sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
        />
        Saved Favorites
      </MenuItem>

      <MenuItem
        onClick={() => goTo("/account-settings")}
        sx={{ py: 1.2, color: "#374151" }}
      >
        <SettingsOutlinedIcon
          sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
        />
        Account Settings
      </MenuItem>

      {!isHost && (
        <MenuItem
          onClick={() => goTo("/account-settings")}
          sx={{ py: 1.2, color: "#374151" }}
        >
          <HomeOutlinedIcon
            sx={{ mr: 2, color: "#6B7280", fontSize: "1.3rem" }}
          />
          Become a host
        </MenuItem>
      )}

      <Divider sx={{ my: 0.5 }} />

      <MenuItem onClick={handleSignOut} sx={{ py: 1.2, color: "#DC2626" }}>
        <LogoutOutlinedIcon
          sx={{ mr: 2, color: "#DC2626", fontSize: "1.3rem" }}
        />
        Sign out
      </MenuItem>
    </Menu>
  );

  const handleListYourProperyFunction = async () => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user.role !== "host" && user.role !== "admin") {
        setAlertInfo({
          show: true,
          message: "Host Badge Required",
          subMessage: "You must enable host mode in your account settings to list a property.",
          type: "error"
        });
        return;
      }
      try {
        const response = await axios.post("http://localhost:5000/api/verifyHostMode", {
          id: user.id
        });
        if (response.data && response.data.message === "go ahead") {
          navigate("/new-listing", { replace: true });
          return;
        }
      } catch (error) {
        if (error.response) {
          setAlertInfo({
            show: true,
            message: "Error",
            subMessage: error.response.data.message || "Unknown error",
            type: "error"
          });
        } else {
          console.error(error);
        }
      }
    }
  };

  return (
    <>
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
          <Link
            to="/"
            className="font-luxury"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <img
              style={{ maxWidth: "100%", height: "70px" }}
              src={Logo}
              alt="DarDarek"
            />
            <h3 className="mb-0">DarDarek</h3>
          </Link>

          <Box sx={{ flexGrow: 1 }}>
            <Toolbar>
              <Box sx={{ flexGrow: 1 }} />

              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                {!token ? (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Button
                      component={Link}
                      to="/my-favorites"
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
                      // to="/new-listing"
                      sx={{
                        background: themeGlobal.colors.primary,
                        display: "flex",
                        gap: "10px",
                        marginRight: "20px",
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                      variant="contained"
                      onClick={handleListYourProperyFunction}
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
                          src={profilePictureSrc}
                          imgProps={{ style: { objectFit: "cover" } }}
                          sx={{ width: 38, height: 38 }}
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
      {alertInfo.show && (
        <SuccessAlert
          message={alertInfo.message}
          subMessage={alertInfo.subMessage}
          type={alertInfo.type}
          onClose={() => setAlertInfo({ ...alertInfo, show: false })}
        />
      )}
    </>
  );
}
