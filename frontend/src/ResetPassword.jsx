import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useThemeGlobal } from "./Contexts/ThemeContext";
import "./App.css";
import "./Authentication.css";
import { useState } from "react";
import axios from "axios";
import { buildApiUrl } from "./lib/api";

import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    
    // theme context
    const theme = useThemeGlobal();

    // state for the form of change password
    const [changePasswordInfo, setChangePasswordInfo] = useState({
        password : "",
        confirmPassword : "",
        token : token || null
    });
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const passwordValue = changePasswordInfo.password;
    const confirmPasswordValue = changePasswordInfo.confirmPassword;
    const hasMinLength = passwordValue.length >= 10;
    const hasStrongLength = passwordValue.length >= 12;
    const hasLetter = /[A-Za-z]/.test(passwordValue);
    const hasNumber = /\d/.test(passwordValue);
    const hasSpecialCharacter = /[^A-Za-z0-9]/.test(passwordValue);
    const passwordScore = [hasMinLength, hasStrongLength, hasLetter, hasNumber, hasSpecialCharacter].filter(Boolean).length;
    const passwordStrength = passwordValue.length === 0
        ? ""
        : passwordScore <= 2
            ? "Weak"
            : passwordScore <= 4
                ? "Medium"
                : "Strong";
    const passwordStrengthClass = passwordStrength ? `password-strength password-strength--${passwordStrength.toLowerCase()}` : "password-strength";
    const confirmTouched = confirmPasswordValue.length > 0;
    const confirmMatches = passwordValue === confirmPasswordValue;
    const confirmInputClass = confirmTouched
        ? `confirm-password-input ${confirmMatches ? "confirm-password-match" : "confirm-password-mismatch"}`
        : "confirm-password-input";

    // functions 
    const handleChangePasswordSubmit = async (e)=>{
        e.preventDefault();
        if(resetLoading){
            return;
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{10,50}$/;
        if(!changePasswordInfo.token){
            setResetError("Reset link is missing or invalid.");
            setResetSuccess("");
            return;
        }
        if(!passwordRegex.test(changePasswordInfo.password)){
            setResetError("Password must be 10 to 50 characters long and include at least one letter and one number.");
            setResetSuccess("");
            return;
        }
        if(changePasswordInfo.password!==changePasswordInfo.confirmPassword){
            setResetError("Password and confirm password do not match.");
            setResetSuccess("");
            return;
        }
        try {
            setResetLoading(true);
            setResetError("");
            setResetSuccess("");
            const response = await axios.post(buildApiUrl("/api/change-password") , changePasswordInfo);
            setResetSuccess(response.data.message || "Password updated successfully. You can now sign in.");
            window.setTimeout(() => {
                navigate("/Authentication", { replace: true });
            }, 800);

        } catch (error) {
            if (error.response) {
                setResetError(error.response.data.message || error.response.data.error || "Could not update your password. Please try again.");
            } else if (error.request) { 
                setResetError("We could not reach the server. Please try again in a moment.");
            } else {
                setResetError("Could not start password reset. Please try again.");
            }
        } finally {
            setResetLoading(false);
        }


    }
    return (
        <main className="flow-page">
            <motion.section
                className="flow-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <p className="flow-eyebrow">Set a new password</p>
                <h1 className="flow-title">Create your new password</h1>
                <p className="flow-copy">
                    Choose a new password for your account. Make it secure and
                    easy for you to remember.
                </p>

                <form onSubmit={handleChangePasswordSubmit} className="flow-form">
                    <div className="flow-field">
                        <label htmlFor="new-password">New password</label>
                        <input
                            id="new-password"
                            type="password"
                            placeholder="Enter your new password"
                            disabled={resetLoading}
                            value={changePasswordInfo.password}
                            onChange={(e)=>{
                                setChangePasswordInfo({...changePasswordInfo , password:e.currentTarget.value });
                                if (resetError) setResetError("");
                                if (resetSuccess) setResetSuccess("");
                            }}
                        />
                        {passwordValue && (
                            <div className="password-strength-wrap">
                                <div className="password-strength-track">
                                    <span className={passwordScore >= 2 ? "password-strength-bar is-active" : "password-strength-bar"} />
                                    <span className={passwordScore >= 4 ? "password-strength-bar is-active" : "password-strength-bar"} />
                                    <span className={passwordScore >= 5 ? "password-strength-bar is-active" : "password-strength-bar"} />
                                </div>
                                <div className={passwordStrengthClass}>
                                    {`Password strength: ${passwordStrength}`}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flow-field">
                        <label htmlFor="confirm-new-password">
                            Confirm password
                        </label>
                        <input
                            id="confirm-new-password"
                            type="password"
                            placeholder="Confirm your new password"
                            className={confirmInputClass}
                            disabled={resetLoading}
                            value={changePasswordInfo.confirmPassword}
                            onChange={(e)=>{
                                setChangePasswordInfo({...changePasswordInfo , confirmPassword:e.currentTarget.value });
                                if (resetError) setResetError("");
                                if (resetSuccess) setResetSuccess("");
                            }}
                        />
                        {confirmTouched && (
                            <div className={confirmMatches ? "confirm-password-hint confirm-password-hint--match" : "confirm-password-hint confirm-password-hint--mismatch"}>
                                {confirmMatches ? "Passwords match." : "Passwords do not match yet."}
                            </div>
                        )}
                    </div>

                    {resetError && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="auth-inline-error"
                            role="alert"
                        >
                            {resetError}
                        </motion.div>
                    )}
                    {resetSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="auth-inline-success"
                            role="status"
                        >
                            {resetSuccess}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        className="flow-submit auth-submit-button"
                        style={{ background: theme.colors.primary }}
                        disabled={resetLoading}
                    >
                        {resetLoading ? (
                            <span className="auth-loading-content">
                                <span className="auth-spinner" aria-hidden="true" />
                                Updating password...
                            </span>
                        ) : (
                            "Update password"
                        )}
                    </button>
                </form>

                <Link to="/Authentication" className="flow-back-link">
                    Back to login
                </Link>
            </motion.section>
        </main>
    );
}
