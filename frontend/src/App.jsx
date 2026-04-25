import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'

// import components
import Home from './Home'

import Authentication from './Authentication'
import { useEffect } from 'react'
// import SignUp from './SignUp'


// import jwt-decode to decode the token string
import { jwtDecode } from "jwt-decode";
import { useToken } from './Contexts/TokenContext'
import ProtectedRoute from './ProtectedRoute'
import VerifyAccountPage from './VerifyAccountPage'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'
import { useThemeGlobal } from './Contexts/ThemeContext'
import PropertiesPage from './PropertiesPage'


function App() {

  const themeGlobal = useThemeGlobal();
  // token context 
  const { token, setToken, user, setUser } = useToken();


  // Make sure there is a token after login in and back to home.jsx
  // #################### START ###############################

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
  }, [])

  // #################### END #################################



  return (
    <div style={{ background: themeGlobal.colors.background }}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Authentication' element={<Authentication />} />
        <Route path='/Authentication/verify-account' element={<VerifyAccountPage />} />
        <Route path='/properties' element={<PropertiesPage />} />
        <Route path='/Create-New-Property' element={<ProtectedRoute></ProtectedRoute>} />
        <Route path='/Authentication/forgot-password' element={<ForgotPassword />} />
        <Route path='/Authentication/reset-password' element={<ResetPassword />} />
      </Routes>
    </div>
  )
}

export default App


