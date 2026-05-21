import React, { useState, useEffect } from "react";
import { useToken } from "../Contexts/TokenContext";
import { useThemeGlobal } from "../Contexts/ThemeContext";
import Header from "../Home components/Header";
import Footer from "../Footer";
import axios from "axios";
import { buildApiUrl } from "../lib/api";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import SuccessAlert from "../SuccessAlert";

import SupportAgentIcon from '@mui/icons-material/SupportAgent';


import "./Support.css";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Account Suspension",
  "Booking Issue",
  "Report a Property/User",
  "Feedback",
  "Other"
];

export default function Support() {
  const { user } = useToken();
  const themeGlobal = useThemeGlobal();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: "", subMessage: "", type: "error" });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setAlertInfo({
        show: true,
        message: "Missing Fields",
        subMessage: "Please fill out all required fields before submitting.",
        type: "error"
      });
      return;
    }

    setLoading(true);
    try {
      // Assuming buildApiUrl() prefixes with http://localhost:5000
      const apiUrl = buildApiUrl("/api/support");
      const response = await axios.post(apiUrl, formData);

      setAlertInfo({
        show: true,
        message: "Success",
        subMessage: "Your support request has been sent! We will get back to you shortly.",
        type: "success"
      });

      // Clear the message and subject, but keep name and email
      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: ""
      }));

    } catch (error) {
      console.error("Support submission error:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again later.";
      setAlertInfo({
        show: true,
        message: "Submission Failed",
        subMessage: errorMsg,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: themeGlobal.colors.background, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      
      <div className="support-page-container" style={{ flexGrow: 1 }}>
        <div className="support-card">
          <Box display="flex" justifyContent="center" mb={2}>
            <SupportAgentIcon
            sx={{ fontSize: 48, color: themeGlobal.colors.primary }}
            />
          </Box>
          <h1 className="support-title">Contact Support</h1>
          <p className="support-subtitle">
            Need help with your account or a booking? Have feedback? Reach out to us using the form below.
          </p>

          <form className="support-form" onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              variant="outlined"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              disabled={!!(user && user.name)}
            />

            <TextField
              label="Email Address"
              variant="outlined"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              disabled={!!(user && user.email)}
            />

            <TextField
              select
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              fullWidth
              required
            >
              {SUBJECT_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Message"
              variant="outlined"
              name="message"
              value={formData.message}
              onChange={handleChange}
              multiline
              rows={5}
              fullWidth
              required
              placeholder="Describe your issue or feedback in detail..."
            />

            <div className="submit-button-container">
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: themeGlobal.colors.primary,
                  color: "#fff",
                  padding: "10px 30px",
                  fontSize: "1rem",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: themeGlobal.colors.primaryDark || themeGlobal.colors.primary,
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Send Message"}
              </Button>
            </div>
          </form>

          <div className="support-info">
            <p><strong>Response Time:</strong> We typically reply within 24-48 hours.</p>
            <p><strong>Emergency:</strong> For urgent matters, please ensure you select the appropriate subject.</p>
          </div>
        </div>
      </div>

      <Footer />

      {alertInfo.show && (
        <SuccessAlert
          message={alertInfo.message}
          subMessage={alertInfo.subMessage}
          type={alertInfo.type}
          onClose={() => setAlertInfo({ ...alertInfo, show: false })}
        />
      )}
    </div>
  );
}
