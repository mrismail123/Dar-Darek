import React, { useEffect, useState } from "react";
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

const SuccessAlert = ({ message, subMessage, onClose, type = "success" }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 50);

    const timer = setTimeout(() => {
      onClose && onClose();
    }, 200000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.overlay}>
      <style>
        {`
          @keyframes alertPopIn {
            0% { opacity: 0; transform: scale(0.9) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}
      </style>
      <div style={styles.modal}>
        <ClearOutlinedIcon 
          onClick={onClose} 
          sx={{
            cursor: "pointer",
            position: "absolute", 
            top: "16px", 
            right: "16px",
            color: "#8E8E8E",
            transition: "0.2s ease",
            "&:hover": { color: "#1A1A1A" }
          }}
        />
        <div
          style={{
            ...styles.iconWrapper,
            ...(animate ? (type === "error" ? styles.iconWrapperErrorActive : styles.iconWrapperActive) : {}),
          }}
        >
          {type === "error" ? (
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: animate ? 0 : 100,
                transition: "stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s",
              }}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: animate ? 0 : 100,
                transition: "stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s",
              }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        <h2 style={styles.title}>{message}</h2>
        {subMessage && <p style={styles.sub}>{subMessage}</p>}
        
        <button
          style={{
            ...styles.button,
            ...(type === "error" ? styles.buttonError : styles.buttonSuccess)
          }}
          onClick={onClose}
          onMouseOver={(e) => {
            e.target.style.opacity = "0.9";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.target.style.opacity = "1";
            e.target.style.transform = "none";
          }}
        >
          {type === "error" ? "Got it" : "Continue"}
        </button>
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
    background: "rgba(26, 26, 26, 0.4)", // Dark overlay based on #1A1A1A theme text color
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  modal: {
    background: "#FFFFFF", 
    padding: "32px 40px 40px",
    borderRadius: "24px", 
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    maxWidth: "400px",
    width: "90%",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "alertPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
  },

  iconWrapper: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    margin: "0 auto 24px",
    background: "#F7F4EB", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
    opacity: 0,
    transform: "scale(0.5)",
  },

  iconWrapperActive: {
    background: "#00A9B5", // Theme Primary
    opacity: 1,
    transform: "scale(1)",
    boxShadow: "0 10px 24px rgba(0, 169, 181, 0.3)",
  },

  iconWrapperErrorActive: {
    background: "#FF4D4D", // Red for error
    opacity: 1,
    transform: "scale(1)",
    boxShadow: "0 10px 24px rgba(255, 77, 77, 0.3)",
  },

  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1A1A1A", // Theme Text
    marginBottom: "12px",
    lineHeight: "1.4",
  },

  sub: {
    fontSize: "15px",
    color: "#8E8E8E", // Theme Gray
    lineHeight: "1.5",
    marginBottom: "8px",
  },
  
  button: {
    marginTop: "24px",
    padding: "14px 28px",
    borderRadius: "14px",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s ease",
    color: "#FFFFFF",
    outline: "none",
  },
  
  buttonSuccess: {
    background: "#00A9B5",
    boxShadow: "0 4px 12px rgba(0, 169, 181, 0.25)",
  },
  
  buttonError: {
    background: "#FF4D4D",
    boxShadow: "0 4px 12px rgba(255, 77, 77, 0.25)",
  }
};

export default SuccessAlert;