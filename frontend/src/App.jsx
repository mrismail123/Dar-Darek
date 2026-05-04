import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import Home from "./Home";
import Authentication from "./Authentication";
import ProtectedRoute from "./ProtectedRoute";
import VerifyAccountPage from "./VerifyAccountPage";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import PropertiesPage from "./PropertiesPage";
import AdminDashboard from "./AdminDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import Publish from "./pages/Publish";
import RentalRequests from "./RentalRequests";

import { useToken } from "./Contexts/TokenContext";
import { useThemeGlobal } from "./Contexts/ThemeContext";

function App() {
  const themeGlobal = useThemeGlobal();
  const { setToken, setUser } = useToken();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    try {
      if (savedToken) {
        const decodedToken = jwtDecode(savedToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          console.log("Token has expired.");
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          setToken(savedToken);
          setUser(decodedToken);
        }
      }
    } catch (error) {
      console.error("Invalid token format");
      localStorage.removeItem("token");
    }
  }, [setToken, setUser]);

  return (
    <div style={{ background: themeGlobal.colors.background }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Authentication" element={<Authentication />} />
        <Route
          path="/Authentication/verify-account"
          element={<VerifyAccountPage />}
        />
        <Route path="/properties" element={<PropertiesPage />} />

        <Route path="/property-details/:id" element={<PropertyDetails />} />

        <Route path="/publish" element={<Publish />} />
        <Route
          path="/new-listing"
          element={
            <ProtectedRoute>
              <Publish />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rental-requests"
          element={
            <ProtectedRoute>
              <RentalRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Authentication/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/Authentication/reset-password"
          element={<ResetPassword />}
        />
      </Routes>
    </div>
  );
}

export default App;
