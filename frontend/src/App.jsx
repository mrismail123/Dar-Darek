import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
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
import AccountSettings from "./pages/AccountSettings";
import MyBookings from "./pages/MyBookings";
import MyProperties from "./pages/MyProperties";
import Checkout from "./pages/Checkout";
import CookieBanner from "./pages/CookieBanner";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import { useToken } from "./Contexts/TokenContext";
import { useThemeGlobal } from "./Contexts/ThemeContext";

import MyFavorites from "./MyFavorites";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

function ClientRoute({ children }) {
  const { token, user } = useToken();

  if (token && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

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
          let storedUser = null;
          try {
            storedUser = JSON.parse(localStorage.getItem("user"));
          } catch (e) {
            console.error("Failed to parse stored user", e);
          }
          setUser(storedUser ? { ...storedUser, ...decodedToken } : decodedToken);
        }
      }
    } catch {
      console.error("Invalid token format");
      localStorage.removeItem("token");
    }
  }, [setToken, setUser]);

  return (
    <div style={{ background: themeGlobal.colors.background }}>
      <Routes>
        <Route
          path="/"
          element={
            <ClientRoute>
              <Home />
            </ClientRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ClientRoute>
              <Support />
            </ClientRoute>
          }
        />
        <Route
          path="/Authentication"
          element={
            <ClientRoute>
              <Authentication />
            </ClientRoute>
          }
        />
        <Route
          path="/Authentication/verify-account"
          element={
            <ClientRoute>
              <VerifyAccountPage />
            </ClientRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <ClientRoute>
              <PropertiesPage />
            </ClientRoute>
          }
        />

        <Route
          path="/property-details/:id"
          element={
            <ClientRoute>
              <PropertyDetails />
            </ClientRoute>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <ClientRoute>
              <PrivacyPolicy />
            </ClientRoute>
          }
        />

        <Route
          path="/checkout/:propertyId"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/publish"
          element={
            <ClientRoute>
              <Publish />
            </ClientRoute>
          }
        />

        <Route
          path="/new-listing"
          element={
            <ProtectedRoute>
              <Publish />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-favorites"
          element={
            <ProtectedRoute>
              <MyFavorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
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
          path="/account-settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-properties"
          element={
            <ProtectedRoute>
              <MyProperties />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Authentication/forgot-password"
          element={
            <ClientRoute>
              <ForgotPassword />
            </ClientRoute>
          }
        />
        <Route
          path="/Authentication/reset-password"
          element={
            <ClientRoute>
              <ResetPassword />
            </ClientRoute>
          }
        />

        {/* Catch-all 404 Route */}
        <Route
          path="*"
          element={
            <ClientRoute>
              <NotFound />
            </ClientRoute>
          }
        />
      </Routes>
      <CookieBanner />
    </div>
  );
}

export default App;
