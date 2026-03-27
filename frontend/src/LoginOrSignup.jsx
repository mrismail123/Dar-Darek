// States
import { useTheme } from "./ThemeContext"
import { useState} from "react";

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

export default function LoginOrSignup(){

    // Start states & their functions

    // mode signup or login
    const [mode , setMode] = useState("login")
       
    function changeMode(){
        mode==="login"
        ? setMode("signup")
        : setMode("login")
    }

    // theme state
    const theme = useTheme()

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


    // functions 
    const handleSubmitSingUp = async (e)=>{
        e.preventDefault()
        try {
            const request = await axios.post('http://localhost:5000/api/signup' , signUpInfo)
            const response = request.data;
            console.log(response)
            alert(`The dar-darek team wish you a good journey ${response.user}`)
            changeMode();
        } catch (error) {
            console.error("FULL ERROR OBJECT:", error);
            if (error.response) {
                
                alert(`Server Error: ${error.response.status} - ${error.response.data.error || "Unknown"}`);
            } else if (error.request) {
               
                alert("Cannot reach the server. Is Node.js running on port 5000?");
            } else {
                alert("Error setting up the request: " + error.message);
            }
        }
    }

    const handleSubmitLogin = async (e)=>{
        e.preventDefault()
        try {
            // Searching the user in the database and store its data
            const request = await axios.post('http://localhost:5000/api/login' , loginInfo);
            const response = request.data;

            // Save the token and the user in the local storage
            localStorage.setItem('token' , response.token);
            localStorage.setItem('user' , JSON.stringify(response.user));

        } catch (error) {
            console.error("Error :" + error)
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
                                <input onChange={(e)=>setLoginInfo({...loginInfo ,email:e.target.value})} value={loginInfo.email} className="form-control rounded-pill py-2 px-3" type="email" name="email" id="email"/>
                            </div>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="pass">Password</label>
                                <input onChange={(e)=>setLoginInfo({...loginInfo ,password:e.target.value})} value={loginInfo.password}  className="form-control rounded-pill py-2 px-3" type="password" name="password" id="pass"/>
                            </div>

                            <input
                                className="btn w-100 rounded-pill py-2 mb-3 text-white"
                                style={{ background: theme.colors.primary }}
                                type="submit"
                                value="Login"
                            />

                            <p
                                onClick={changeMode}
                                className="text-center auth-switch-link mb-3"
                            >
                                New to DarDarek? Create an account
                            </p>

                            <p className='auth-or mb-3'>or</p>


                            <GoogleLogin
                            onSuccess={credentialResponse => {
                                console.log("Google Token:", credentialResponse.credential);
                                // هنا سنرسل هذا التوكن لسيرفر Node.js (سنتعلمها في الخطوة القادمة)
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                            />

                            <FacebookLogin
                            appId="1453411473064303"
                            onSuccess={(response) => {
                                console.log("Facebook login success:", response);
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
                            <input onChange={(e)=>setSignUpInfo({...signUpInfo , firstName:e.target.value })} value={signUpInfo.firstName} className="form-control rounded-top-4 rounded-bottom-0 py-2 px-3 mb-0" type="text" name="first name" id="firtName" placeholder="First Name"/>
                            <input onChange={(e)=>setSignUpInfo({...signUpInfo , lastName:e.target.value})} value={signUpInfo.lastName} className="form-control rounded-bottom-4 rounded-top-0 py-2 px-3 mb-3" type="text" name="last name" id="lastName" placeholder="Last Name"/>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="email">Email</label>
                                <input onChange={(e)=>setSignUpInfo({...signUpInfo , email : e.target.value})} value={signUpInfo.email} className="form-control rounded-pill py-2 px-3" type="email" name="email" id="email" placeholder="Email"/>
                            </div>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="pass">Password</label>
                                <input onChange={(e)=>setSignUpInfo({...signUpInfo , password:e.target.value})} value={signUpInfo.password} className="form-control rounded-pill py-2 px-3" type="password" name="password" id="pass" placeholder="Password"/>
                            </div>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="confirm">Confirm password</label>
                                <input onChange={(e)=>setSignUpInfo({...signUpInfo , confirmPassword:e.target.value})} value={signUpInfo.confirmPassword} className="form-control rounded-pill py-2 px-3" type="password" name="confirm password" id="confirm" placeholder="Confirm password"/>
                            </div>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="phoneNumber">Phone number</label>
                                <PhoneInput
                                    id="phoneNumber"
                                    placeholder="Phone number"
                                    value={signUpInfo.phoneNumber}
                                    onChange={(e)=>setSignUpInfo({...signUpInfo , phoneNumber:e})}
                                    defaultCountry="MA"
                                />
                            </div>

                            <input
                                className="btn w-100 rounded-pill py-2 text-white"
                                style={{ background: theme.colors.primary }}
                                type="submit"
                                value="Create account"  
                            />
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )


}
