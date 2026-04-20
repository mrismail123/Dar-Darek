import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useThemeGlobal } from "./Contexts/ThemeContext";
import "./App.css";

export default function VerifyAccountPage() {
    const theme = useThemeGlobal();

    return (
        <main className="flow-page">
            <motion.section
                className="flow-card flow-card--compact"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <div
                    className="flow-icon"
                    style={{ color: theme.colors.primary }}
                    aria-hidden="true"
                >
                    <span className="flow-icon-envelope" />
                </div>

                <p className="flow-eyebrow">Account verification</p>
                <h1 className="flow-title">Check your email</h1>
                <p className="flow-copy">
                    We sent you an activation email. Open it and click the
                    verification button to confirm your account and continue to
                    DarDarek.
                </p>

                <p className="flow-note">
                    If the email does not appear, check your spam folder.
                </p>

                <Link to="/Authentication" className="flow-back-link">
                    Return to login
                </Link>
            </motion.section>
        </main>
    );
}
