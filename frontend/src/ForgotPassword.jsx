import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useThemeGlobal } from "./Contexts/ThemeContext";
import "./App.css";
import "./Authentication.css";
import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
    // theme context
    const theme = useThemeGlobal();
    // form state
    const [accountEmail , setAccountEmail] = useState({
        email : ""
    });
    const [forgotLoading , setForgotLoading] = useState(false);

    // alert pop up if the email is not found.
    const [emailSearch , setEmailSearch] = useState("");
    
    

    // functions 
    
    const handleForgotPasswordSubmit = async (e)=>{
        e.preventDefault();
        if(forgotLoading){
            return;
        }
        const trimmedEmail = typeof accountEmail.email === "string" ? accountEmail.email.trim() : "";
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if(!emailRegex.test(trimmedEmail)){
            setEmailSearch("Please enter a valid email address.");
            return;
        }

        try {
            setForgotLoading(true);
            setEmailSearch("");
            const response = await axios.post("http://localhost:5000/api/forgot-password" , {
                email: trimmedEmail
            });
            alert(response.data.message || "Please check your email to reset your password.");
        } catch (error) {
            if (error.response) {
                setEmailSearch(error.response.data.message || error.response.data.error || "Unexpected behaviour!");
            } else if (error.request) { 
                setEmailSearch("Unable to reach the server. Please make sure it is running on port 5000.");
            } else {
                setEmailSearch("Request setup failed: " + error.message);
            }
        } finally {
            setForgotLoading(false);
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
                <p className="flow-eyebrow">Password recovery</p>
                <h1 className="flow-title">Forgot your password?</h1>
                <p className="flow-copy">
                    Enter the email address linked to your account and we will
                    send you a secure reset link.
                </p>

                <form onSubmit={handleForgotPasswordSubmit} className="flow-form">
                    <div className="flow-field">
                        <label htmlFor="forgot-email">Email address</label>
                        <input
                            id="forgot-email"
                            type="email"
                            placeholder="you@example.com"
                            value={accountEmail.email || ""}
                            disabled={forgotLoading}
                            onChange={(e)=>{
                                setAccountEmail({...accountEmail , email : e.currentTarget.value});
                                if (emailSearch) setEmailSearch("");
                            }}
                        />
                    </div>
                    {emailSearch && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="auth-inline-error"
                            role="alert"
                        >
                            {emailSearch}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        className="flow-submit auth-submit-button"
                        style={{ background: theme.colors.primary }}
                        disabled={forgotLoading}
                    >
                        {forgotLoading ? (
                            <span className="auth-loading-content">
                                <span className="auth-spinner" aria-hidden="true" />
                                Sending reset link...
                            </span>
                        ) : (
                            "Send reset link"
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
