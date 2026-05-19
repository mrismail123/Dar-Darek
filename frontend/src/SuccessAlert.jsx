// components/SuccessAlert.jsx

import React, { useEffect, useState } from "react";

import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
const SuccessAlert = ({ message, subMessage, onClose, type = "success" }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);

    const timer = setTimeout(() => {
      onClose && onClose();
    }, 200000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <ClearOutlinedIcon onClick={onClose} sx={{cursor:"pointer",position:"absolute", top: "10px", right: "10px"}}/>
        <div
          style={{
            ...styles.iconWrapper,
            ...(animate ? (type === "error" ? styles.iconWrapperErrorActive : styles.iconWrapperActive) : {}),
          }}
        >
          {type === "error" ? (
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: animate ? 0 : 100,
                transition: "stroke-dashoffset 0.6s ease",
              }}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: animate ? 0 : 100,
                transition: "stroke-dashoffset 0.6s ease",
              }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        <h2 style={styles.title}>{message}</h2>
        {subMessage && <p style={styles.sub}>{subMessage}</p>}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  modal: {
    background: "#F7F4EB",
    padding: "40px 50px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    transform: "scale(0.95)",
    animation: "pop 0.3s ease forwards",
  },

  iconWrapper: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    margin: "0 auto 20px",
    background: "#ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.5s ease",
  },

  iconWrapperActive: {
    background: "#22c55e", // green success
    transform: "scale(1.1)",
    boxShadow: "0 10px 30px rgba(34,197,94,0.4)",
  },

  iconWrapperErrorActive: {
    background: "#ef4444", // red error
    transform: "scale(1.1)",
    boxShadow: "0 10px 30px rgba(239,68,68,0.4)",
  },

  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
  },

  sub: {
    fontSize: "14px",
    color: "#6b7280",
  },
};

export default SuccessAlert;