// States
import { useThemeGlobal } from "./Contexts/ThemeContext"
import { useState} from "react";
import { replace, useNavigate } from "react-router-dom";

// Google & Facebook login button
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from "@greatsumini/react-facebook-login";

// import icons 
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Phone number comp
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

// import animation materials
import { motion, AnimatePresence } from 'framer-motion';

// import axios for API calls
import axios from 'axios'


import { useToken } from "./Contexts/TokenContext";

import {jwtDecode} from "jwt-decode";


export default function LoginOrSignup(){


    // Contexts #################################

    // theme context
    const theme = useThemeGlobal();

    // token context
    const {token , setToken , user , setUser} = useToken();

    // Start states & their functions

    //navigation 
    const navigate = useNavigate();

    // mode signup or login
    const [mode , setMode] = useState("login")
       
    function changeMode(){
        mode==="login"
        ? setMode("signup")
        : setMode("login")
    }


    // sing up form state
    const [signUpInfo , setSignUpInfo] = useState({
        firstName : "",
        lastName : "",
        email : "",
        password : "",
        confirmPassword : "",
        phoneNumber : ""
    })

    // login form state
    const [loginInfo , setLoginInfo] = useState({
        email : "",
        password : ""
    })
    const [loginError , setLoginError] = useState("");
    const [loginLoading , setLoginLoading] = useState(false);
    const [signupLoading , setSignupLoading] = useState(false);
    const passwordValue = signUpInfo.password;
    const confirmPasswordValue = signUpInfo.confirmPassword;
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
        ? `form-control rounded-pill py-2 px-3 ${confirmMatches ? "confirm-password-match" : "confirm-password-mismatch"}`
        : "form-control rounded-pill py-2 px-3";

    // functions 
    const handleSubmitSingUp = async (e)=>{
        e.preventDefault();
        if(signupLoading){
            return;
        }
        const trimmedFirstName = signUpInfo.firstName.trim();
        const trimmedLastName = signUpInfo.lastName.trim();
        const trimmedEmail = signUpInfo.email.trim();
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{10,50}$/;

        if(!trimmedFirstName || !trimmedLastName){
            alert("First name and last name are required.");
            return;
        }
        if(!passwordRegex.test(signUpInfo.password)){
            alert("Password must be 10 to 50 characters long and include at least one letter and one number.");
            return;
        }
        if(signUpInfo.password!==signUpInfo.confirmPassword){
            alert("Password and confirm password do not match.");
            return;
        }
        try {
            setSignupLoading(true);
            const request = await axios.post('http://localhost:5000/api/signup' , {
                ...signUpInfo,
                firstName: trimmedFirstName,
                lastName: trimmedLastName,
                email: trimmedEmail
            })
            const response = request.data;
            alert(response.message);
            setLoginInfo({...loginInfo , email:trimmedEmail , password:signUpInfo.password});
            // changeMode();

            navigate("/Authentication/verify-account" , {replace:true});
            

        } catch (error) {
            console.error("FULL ERROR OBJECT:", error);
            if (error.response) {
                alert(error.response.data.message || error.response.data.error || "Something went wrong while creating your account.");
            } else if (error.request) { 
                alert("Unable to reach the server. Please make sure it is running on port 5000.");
            } else {
                alert("Request setup failed: " + error.message);
            }
        } finally {
            setSignupLoading(false);
        }
    }

    const handleSubmitLogin = async (e)=>{
        e.preventDefault()
        if(loginLoading){
            return;
        }
        const trimmedEmail = loginInfo.email.trim();

        if(!trimmedEmail){
            setLoginError("Please enter your email address.");
            return;
        }
        if(!loginInfo.password){
            setLoginError("Please enter your password.");
            return;
        }
        setLoginError("");
        setLoginLoading(true);
        try {
            // Searching the user in the database and store its data
            const request = await axios.post('http://localhost:5000/api/login' , {
                ...loginInfo,
                email: trimmedEmail
            });
            const response = request.data;

            // Save the token and the user in the local storage
            localStorage.setItem('token' , response.token);
            localStorage.setItem('user' , JSON.stringify(response.user));

            setToken(response.token);
            setUser(response.user);

            alert(`Welcome back, ${response.user.name}.`);
            navigate("/" , { replace: true });
        } catch (error) {
            console.error("Error :", error);
            if (error.response) {
                setLoginError(error.response.data.message || "Login failed.");
            } else if (error.request) {
                setLoginError("Unable to reach the server. Please make sure it is running on port 5000.");
            } else {
                setLoginError("Request setup failed. Please try again.");
            }
        } finally {
            setLoginLoading(false);
        }
    }


    return (
        <AnimatePresence mode="wait">
            {mode==="login" 
            ? (
                <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="auth-card card border-0 shadow-sm w-100"
                >
                    <div className="card-body p-4 p-sm-5">
                        <form onSubmit={handleSubmitLogin}  action="">
                            <h1 className='font-luxury text-center mb-1'>Welcome to DarDarek</h1>
                            <p className="text-center text-muted mb-4">Login or sign up</p>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="email">Email</label>
                                <input onChange={(e)=>{setLoginInfo({...loginInfo ,email:e.target.value}); if (loginError) setLoginError("");}} value={loginInfo.email} className="form-control rounded-pill py-2 px-3" type="email" name="email" id="email" required disabled={loginLoading}/>
                            </div>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="pass">Password</label>
                                <input onChange={(e)=>{setLoginInfo({...loginInfo ,password:e.target.value}); if (loginError) setLoginError("");}} value={loginInfo.password}  className="form-control rounded-pill py-2 px-3" type="password" name="password" id="pass" required disabled={loginLoading}/>
                                <p onClick={()=>{
                                    navigate("/Authentication/forgot-password");
                                }} className="auth-forgot-password mb-0">Forgot password?</p>
                            </div>

                            {loginError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="auth-inline-error"
                                    role="alert"
                                >
                                    {loginError}
                                </motion.div>
                            )}

                            <button
                                className="btn w-100 rounded-pill py-2 mb-3 text-white auth-submit-button"
                                style={{ background: theme.colors.primary }}
                                type="submit"
                                disabled={loginLoading}
                            >
                                {loginLoading ? (
                                    <span className="auth-loading-content">
                                        <span className="auth-spinner" aria-hidden="true" />
                                        Checking your account...
                                    </span>
                                ) : (
                                    "Login"
                                )}
                            </button>

                            <p
                                onClick={changeMode}
                                className="text-center auth-switch-link mb-3"
                            >
                                New to DarDarek? Create an account
                            </p>

                            <p className='auth-or mb-3'>or</p>


                            <GoogleLogin
                            onSuccess={ async credentialResponse => {                            
                                try {
                                    const response = await axios.post("http://localhost:5000/api/google-auth" , {
                                        idToken : credentialResponse.credential
                                    });
                                    
                                    const {token , user} = response.data;
                                    console.log(token);
                                    console.log(user);
                                    setToken(token);
                                    setUser(user);
                                    localStorage.setItem("token", token);
                                    localStorage.setItem("user" , JSON.stringify(user));
                                    navigate("/" , { replace: true });
                                } catch (error) {
                                    console.error(error);
                                }
                            }}
                            onError={() => {
                                console.log('Google login failed.');
                            }}
                            />

                            <FacebookLogin
                            appId="1453411473064303"
                            onSuccess={(response) => {
                                console.log("Facebook login success:", response);
                                alert("Facebook login is not fully connected to the server yet.");
                            }}
                            onFail={(error) => {
                                console.log("Facebook login failed:", error);
                            }}
                            render={({ onClick }) => (
                                <button
                                    type="button"
                                    onClick={onClick}
                                    className="facebook-auth-button"
                                >
                                    <span className="facebook-auth-button__icon">
                                        <FaFacebook size={20} />
                                    </span>
                                    <span className="facebook-auth-button__label">
                                        Sign in with Facebook
                                    </span>
                                    <span className="facebook-auth-button__spacer" />
                                </button>
                            )}
                            />
                        </form>
                    </div>
                </motion.div>
            )
            : (
               <motion.div
                    key="singup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="auth-card signup-card card border-0 shadow-sm w-100 position-relative"
               >
                    <div className="card-body p-3 p-sm-4">
                        <button type="button" onClick={changeMode} className="btn btn-link p-0 border-0 auth-back-btn">
                            <ArrowBackIcon sx={{ fontSize: "1.8rem", color: "#131313" }}/>
                        </button>

                        <form onSubmit={handleSubmitSingUp} action="" className="signup-form-compact">
                            <h1 className='font-luxury text-center mt-3 mb-1'>Welcome to DarDarek</h1>
                            <p className="text-center text-muted mb-3">Login or sign up</p>

                            <label className="form-label" htmlFor="fullName">Full name</label>
                            <input onChange={(e)=>setSignUpInfo({...signUpInfo , firstName:e.target.value })} value={signUpInfo.firstName} className="form-control rounded-top-4 rounded-bottom-0 py-2 px-3 mb-0" type="text" name="first name" id="firtName" placeholder="First Name" required disabled={signupLoading}/>
                            <input onChange={(e)=>setSignUpInfo({...signUpInfo , lastName:e.target.value})} value={signUpInfo.lastName} className="form-control rounded-bottom-4 rounded-top-0 py-2 px-3 mb-3" type="text" name="last name" id="lastName" placeholder="Last Name" required disabled={signupLoading}/>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="email">Email</label>
                                <input onChange={(e)=>setSignUpInfo({...signUpInfo , email : e.target.value})} value={signUpInfo.email} className="form-control rounded-pill py-2 px-3" type="email" name="email" id="email" placeholder="Email" pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$" required disabled={signupLoading}/>
                            </div>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="pass">Password</label>
                                <input onChange={(e)=>setSignUpInfo({...signUpInfo , password:e.target.value})} value={signUpInfo.password} minLength={10} maxLength={50} className="form-control rounded-pill py-2 px-3" type="password" name="password" id="pass" placeholder="Password" required disabled={signupLoading}/>
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

                            <div className="mb-3">
                                <label className="form-label" htmlFor="confirm">Confirm password</label>
                                <input onChange={(e)=>setSignUpInfo({...signUpInfo , confirmPassword:e.target.value})} value={signUpInfo.confirmPassword} className={confirmInputClass} type="password" name="confirm password" id="confirm" placeholder="Confirm password" required disabled={signupLoading}/>
                                {confirmTouched && (
                                    <div className={confirmMatches ? "confirm-password-hint confirm-password-hint--match" : "confirm-password-hint confirm-password-hint--mismatch"}>
                                        {confirmMatches ? "Passwords match." : "Passwords do not match yet."}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="phoneNumber">Phone number</label>
                                <PhoneInput
                                    id="phoneNumber"
                                    placeholder="Phone number"
                                    value={signUpInfo.phoneNumber}
                                    onChange={(e)=>setSignUpInfo({...signUpInfo , phoneNumber:e})}
                                    defaultCountry="MA"
                                    required
                                    disabled={signupLoading}
                                />
                            </div>

                            <button
                                className="btn w-100 rounded-pill py-2 text-white auth-submit-button"
                                style={{ background: theme.colors.primary }}
                                type="submit"
                                disabled={signupLoading}
                            >
                                {signupLoading ? (
                                    <span className="auth-loading-content">
                                        <span className="auth-spinner" aria-hidden="true" />
                                        Creating your account...
                                    </span>
                                ) : (
                                    "Create account"
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )


}
