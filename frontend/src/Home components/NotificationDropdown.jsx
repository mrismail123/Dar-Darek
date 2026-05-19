import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Typography from "@mui/material/Typography";

import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

import { buildApiUrl } from "../lib/api";
import { useToken } from "../Contexts/TokenContext";
import { useThemeGlobal } from "../Contexts/ThemeContext";

// ─── helpers ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000; // 30 s

const TYPE_CONFIG = {
  APPROVE: {
    color: "#166534",
    bg: "rgba(34, 197, 94, 0.08)",
    border: "#22c55e",
    Icon: CheckCircleOutlineIcon,
    iconColor: "#22c55e",
  },
  REJECT: {
    color: "#991b1b",
    bg: "rgba(239, 68, 68, 0.07)",
    border: "#ef4444",
    Icon: CancelOutlinedIcon,
    iconColor: "#ef4444",
  },
  general: {
    color: "#1e3a5f",
    bg: "rgba(99, 102, 241, 0.06)",
    border: "#a5b4fc",
    Icon: InfoOutlinedIcon,
    iconColor: "#6366f1",
  },
};

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function NotificationDropdown() {
  const { token } = useToken();
  const themeGlobal = useThemeGlobal();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const anchorRef = useRef(null);
  const intervalRef = useRef(null);

  // ── fetch ──────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) setLoading(true);
      try {
        const { data } = await axios.get(buildApiUrl("/api/notifications"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      } catch (_) {
        // silently fail — don't disrupt UX
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  // initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(() => fetchNotifications(true), POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifications]);

  // ── mark one as read ───────────────────────────────────────────────────
  const handleNotificationClick = async (notification) => {
    console.log(notification.id_notification)
    // optimistic update
    if (!notification.is_read) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id_notification === notification.id_notification ? { ...n, is_read: 1 } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        console.log(notification.id_notification);
        await axios.put(
          buildApiUrl(`/api/notifications/${notification.id_notification}/read`),
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (_) {
        // revert on failure
        setNotifications((prev) =>
          prev.map((n) =>
            n.id_notification === notification.id_notification ? { ...n, is_read: 0 } : n,
          ),
        );
        setUnreadCount((prev) => prev + 1);
      }
    }

    setOpen(false);

    // Navigate to rental-requests, passing the booking id so the page can highlight it
    if (notification.id_booking) {
      navigate(`/rental-requests?bookingId=${notification.id_booking}`);
    } else {
      navigate("/rental-requests");
    }
  };

  // ── mark all as read ───────────────────────────────────────────────────
  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);

    // optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnreadCount(0);

    try {
      await axios.put(
        buildApiUrl("/api/notifications/mark-all-read"),
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (_) {
      // revert
      fetchNotifications(true);
    } finally {
      setMarkingAll(false);
    }
  };

  // ── toggle dropdown ────────────────────────────────────────────────────
  const handleToggle = () => {
    setOpen((prev) => {
      if (!prev) fetchNotifications(); // refresh on open
      return !prev;
    });
  };

  const handleClose = (e) => {
    if (anchorRef.current && anchorRef.current.contains(e.target)) return;
    setOpen(false);
  };

  if (!token) return null;

  return (
    <Box sx={{ position: "relative" }}>
      {/* ── Bell button ── */}
      <IconButton
        ref={anchorRef}
        size="large"
        aria-label={`${unreadCount} new notifications`}
        onClick={handleToggle}
        sx={{ color: themeGlobal.colors.primary, mr: 1 }}
      >
        <Badge
          badgeContent={unreadCount > 99 ? "99+" : unreadCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.65rem",
              fontWeight: 700,
              minWidth: "18px",
              height: "18px",
              padding: "0 4px",
            },
          }}
        >
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

      {/* ── Dropdown ── */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        transition
        disablePortal
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow  {...TransitionProps} style={{ transformOrigin: "top right" }}>
            <Paper
              elevation={0}
              sx={{
                mt: 1.5,
                width: 380,
                maxHeight: 520,
                display: "flex",
                flexDirection: "column",
                borderRadius: "20px",
                border: "1px solid rgba(226,232,240,0.9)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box sx={{ overflowY: "scroll", display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* ── Header bar ── */}
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid rgba(226,232,240,0.8)",
                      background:
                        "linear-gradient(135deg, rgba(0,169,181,0.04) 0%, rgba(255,255,255,1) 60%)",
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "#111827",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Notifications
                      </Typography>
                      {unreadCount > 0 && (
                        <Box
                          sx={{
                            // overflowY: "scroll",
                            background: themeGlobal.colors.primary,
                            color: "#fff",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            borderRadius: "999px",
                            px: 0.85,
                            py: 0.1,
                            lineHeight: 1.6,
                          }}
                        >
                          {unreadCount}
                        </Box>
                      )}
                    </Box>

                    {unreadCount > 0 && (
                      <Button
                        size="small"
                        startIcon={
                          markingAll ? (
                            <CircularProgress size={12} />
                          ) : (
                            <DoneAllIcon sx={{ fontSize: "0.95rem" }} />
                          )
                        }
                        onClick={handleMarkAllRead}
                        disabled={markingAll}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: themeGlobal.colors.primary,
                          borderRadius: "8px",
                          px: 1.2,
                          py: 0.5,
                          "&:hover": {
                            backgroundColor: "rgba(0,169,181,0.06)",
                          },
                        }}
                      >
                        Mark all read
                      </Button>
                    )}
                  </Box>

                  {/* ── List ── */}
                  <Box
                    sx={{
                      overflowY: "auto",
                      flexGrow: 1,
                      "&::-webkit-scrollbar": { width: "4px" },
                      "&::-webkit-scrollbar-track": { background: "transparent" },
                      "&::-webkit-scrollbar-thumb": {
                        background: "rgba(0,169,181,0.25)",
                        borderRadius: "999px",
                      },
                    }}
                  >
                    {loading && notifications.length === 0 ? (
                      // Loading skeleton
                      <Box
                        sx={{

                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 6,
                          gap: 1.5,
                          flexDirection: "column",
                        }}
                      >
                        <CircularProgress
                          size={28}
                          sx={{ color: themeGlobal.colors.primary }}
                        />
                        <Typography sx={{ color: "#94a3b8", fontSize: "0.83rem" }}>
                          Loading notifications…
                        </Typography>
                      </Box>
                    ) : notifications.length === 0 ? (
                      // Empty state
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 6,
                          px: 3,
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            backgroundColor: "rgba(0,169,181,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <NotificationsNoneIcon
                            sx={{ fontSize: "1.8rem", color: themeGlobal.colors.primary }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            color: "#374151",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            textAlign: "center",
                          }}
                        >
                          No new notifications
                        </Typography>
                        <Typography
                          sx={{ color: "#94a3b8", fontSize: "0.82rem", textAlign: "center" }}
                        >
                          You're all caught up! Booking updates will appear here.
                        </Typography>
                      </Box>
                    ) : (
                      // Notification items
                      notifications.map((notif, idx) => {
                        const cfg =
                          TYPE_CONFIG[notif.type] || TYPE_CONFIG.general;
                        const { Icon } = cfg;
                        const isUnread = !notif.is_read;

                        return (
                          <Box
                            key={notif.id_notification}
                            onClick={() => handleNotificationClick(notif)}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                              px: 2.2,
                              py: 1.6,
                              cursor: "pointer",
                              borderLeft: `3px solid ${isUnread ? cfg.border : "transparent"}`,
                              backgroundColor: isUnread ? cfg.bg : "transparent",
                              borderBottom:
                                idx < notifications.length - 1
                                  ? "1px solid rgba(226,232,240,0.6)"
                                  : "none",
                              transition:
                                "background-color 0.18s ease, border-left-color 0.18s ease",
                              "&:hover": {
                                backgroundColor: isUnread
                                  ? `${cfg.bg}`
                                  : "rgba(248,250,252,0.9)",
                              },
                            }}
                          >
                            {/* Icon */}
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                backgroundColor: isUnread
                                  ? `${cfg.bg}`
                                  : "rgba(241,245,249,0.8)",
                                border: `1.5px solid ${isUnread ? cfg.border : "rgba(226,232,240,0.8)"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                mt: 0.2,
                              }}
                            >
                              <Icon
                                sx={{
                                  fontSize: "1.1rem",
                                  color: isUnread ? cfg.iconColor : "#94a3b8",
                                }}
                              />
                            </Box>

                            {/* Text */}
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.84rem",
                                  fontWeight: isUnread ? 600 : 400,
                                  color: isUnread ? cfg.color : "#4b5563",
                                  lineHeight: 1.45,
                                  mb: 0.4,
                                }}
                              >
                                {notif.notify_text}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "0.72rem",
                                  color: "#94a3b8",
                                  fontWeight: 500,
                                }}
                              >
                                {timeAgo(notif.created_at)}
                              </Typography>
                            </Box>

                            {/* Unread dot */}
                            {isUnread && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: cfg.iconColor,
                                  flexShrink: 0,
                                  mt: 0.7,
                                }}
                              />
                            )}
                          </Box>
                        );
                      })
                    )}
                  </Box>

                  {/* ── Footer ── */}
                  {notifications.length > 0 && (
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.4,
                        borderTop: "1px solid rgba(226,232,240,0.8)",
                        flexShrink: 0,
                        background: "rgba(248,250,252,0.6)",
                      }}
                    >
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => {
                          setOpen(false);
                          navigate("/rental-requests");
                        }}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: themeGlobal.colors.primary,
                          borderRadius: "10px",
                          py: 0.6,
                          "&:hover": {
                            backgroundColor: "rgba(0,169,181,0.06)",
                          },
                        }}
                      >
                        View all bookings →
                      </Button>
                    </Box>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
}
