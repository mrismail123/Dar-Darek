// 1. IMPORTING TOOLS

// express to facilitate the coding
const express = require('express'); 

// jwt 
const jwt = require('jsonwebtoken');

// cors for security
const cors = require('cors');
// bcrypt
const bcrypt = require('bcrypt');

// google auth
const { OAuth2Client, JWT } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// nodemailer
const nodemailer = require("nodemailer");

// Our db
const db = require('./db');
// .env file
require('dotenv').config();



// 2. INITIALIZATION
const app = express();

// 3. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 4. ROUTES (THE API)


// Test the database first
app.get('/api/test-db' , async (req , res)=>{
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({message : "Database connection successful." , data:rows})
    } catch (error) {
        res.status(500).json({message:"Database connection failed." , details : error.message})
    }
    })


// API for forgot-password form
app.post("/api/forgot-password", async (req , res)=>{
    const {email} = req.body;
    const cleanEmail = typeof email==="string" ? email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    try {
        if(!cleanEmail){
            return res.status(400).json({message:"Email is required"});
        }
        if(!emailRegex.test(cleanEmail)){
            return res.status(400).json({message:"Email format is not valide"});
        }
        
        // Verify if the email exists or not
        const [rows] = await db.query("SELECT * FROM users WHERE email=?",[cleanEmail]);
        
        if(rows.length===0){
            return res.status(404).json({message:"User not found"});
        }
        const user = rows[0];

        // Create a one-time reset token
        const oneTimeActivationToken = jwt.sign(
            {email : user.email},
            process.env.JWT_SECRET,
            {expiresIn:"15m"}
        )

        const ResetingUrl = `http://localhost:5173/Authentication/reset-password?token=${oneTimeActivationToken}`;

        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        })

        const mailOptions = {
            from: `"Dar Darek Support" <${process.env.EMAIL_USER}>`,
            to : cleanEmail ,
            subject: "Reseting your password",
            html: `
                <h1>Welcome to Dar Darek!</h1>
                <p>Click the button below to reset your password:</p>
                <a href="${ResetingUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Activate My Account</a>
                <p>This link will expire in 15 minutes.</p>
            `
        }

        await transporter.sendMail(mailOptions);

        res.status(200).json({message:"Please check your email to reset your password"});
        
    } catch (error) {
        res.status(500).json({message:"An error occurred during verifying your account" , details:error.message});
    }
})


// API to change password
app.post("/api/change-password", async (req , res)=>{
    const {password, confirmPassword , token} = req.body;
    const safePassword = typeof password === "string" ? password : "";
    const safeConfirmPassword = typeof confirmPassword === "string" ? confirmPassword : "";
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{10,50}$/;
    try {
        if(!safePassword || !safeConfirmPassword){
            return res.status(400).json({message:"Password and confirm password are required."});
        }
        if(!passwordRegex.test(safePassword)){
            return res.status(400).json({message:"Password must be 10 to 50 characters long and include at least one letter and one number."});
        }
        if(safePassword !== safeConfirmPassword){
            return res.status(400).json({message:"Password and confirm password do not match."});
        }
        if(!token) return res.status(400).json({message:"Token missing."});

        let decodedToken;
        try {
            decodedToken = jwt.verify(token , process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({message:"Reset link is invalid or has expired."});
        }
        const email = decodedToken.email;

        const [rows] = await db.query("select * from users where email=?" , [email]);

        if(rows.length===0){
            return res.status(404).send("User not found");
        }

        const hashedPassword = await bcrypt.hash(safePassword , 10);

        await db.execute("update users set password=? where email=?",[hashedPassword , email]);

        return res.status(200).json({message:"Password updated successfully."});  
             
    } catch (error) {
        res.status(500).json({message:"An error occurred during try to change your password" , details:error.message});
    }
})


// // API for reseting password
// app.get('api/reset-password', async (req , res)=>{
//     const {token} = req.query;
//     if(!token) return res.status(400).send('Token is missing.');
//     try {
//         const decoded = jwt.verify(token , process.env.JWT_SECRET);
//         const email = decoded.email;

//         res.redirect("http://localhost:5173/Authentication/change-password");
//     } catch (error) {
//         res.status(400).send("Link expired or invalid. Please sign up again.");
//     }
// })


// API for sign up 
app.post('/api/signup' , async (req , res)=>{
    const {firstName , lastName , email , password, confirmPassword, phoneNumber } = req.body;
    const trimmedFirstName = typeof firstName === "string" ? firstName.trim() : "";
    const trimmedLastName = typeof lastName === "string" ? lastName.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPhoneNumber = typeof phoneNumber === "string" ? phoneNumber.trim() : "";
    const safePassword = typeof password === "string" ? password : "";
    const safeConfirmPassword = typeof confirmPassword === "string" ? confirmPassword : "";
    const name = `${trimmedFirstName} ${trimmedLastName}`.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{10,50}$/;
    try {
        if(!trimmedFirstName || !trimmedLastName){
            return res.status(400).json({message:"First name and last name are required."});
        }
        if (!cleanEmail) {
            return res.status(400).json({ message: "Email is required." });
        }
        if(!safePassword || !safeConfirmPassword){
            return res.status(400).json({message:"Password and confirm password are required."});
        }
        if(!passwordRegex.test(safePassword)){
            return res.status(400).json({message:"Password must be 10 to 50 characters long and include at least one letter and one number."});
        }
        if(safePassword !== safeConfirmPassword){
            return res.status(400).json({message:"Password and confirm password do not match."});
        }
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }
        if(!cleanPhoneNumber){
            return res.status(400).json({message:"Phone number is required."});
        }
        if(!phoneRegex.test(cleanPhoneNumber)){
            return res.status(400).json({message: "Please enter a valid phone number."});
        }
        const hashedPassword = await bcrypt.hash(safePassword,10);
        const query = "INSERT INTO users (name, email, password, phone_number)  VALUES (?,?,?,?)";
        const values = [name , cleanEmail ,hashedPassword,cleanPhoneNumber]
        await db.execute(query , values);

        const oneTimeActivationToken = jwt.sign(
            {email : cleanEmail },
            process.env.JWT_SECRET,
            {expiresIn : "15m"}
        );

        const activationUrl = `http://localhost:5000/api/activate-account?token=${oneTimeActivationToken}`;
        
        const transporter = nodemailer.createTransport({
            service :'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: `"Dar Darek Support" <${process.env.EMAIL_USER}>`,
            to: cleanEmail,
            subject: 'Activate your Dar Darek Account',
            html: `
            <h1>Welcome to Dar Darek!</h1>
            <p>Click the button below to verify your email and start hosting or renting apartments:</p>
            <a href="${activationUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Activate My Account</a>
            <p>This link will expire in 15 minutes.</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        
        // Send message after ensuring the email is sent and the user stored in the DB.
        res.status(201).json({message:"Account created! Please check your email to activate it.", user : name})
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({message:"An account with this email already exists."});
        }
        res.status(500).json({message:"Failed to create user account.", details:error.message})
    }
})

// API for activiting account after the user clicks on the email button
app.get("/api/activate-account" , async (req , res)=>{
    const {token} = req.query;

    if(!token) return res.status(400).send("Token is missing!")

    try {

        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        const email = decoded.email;

        const [result] = await db.execute("UPDATE users SET is_active=1 WHERE email=?" , [email]);
        if(result.affectedRows===0) return res.status(404).send("User not found.");

        res.redirect("http://localhost:5173/Authentication");

    } catch (error) {
        res.status(400).send("Link expired or invalid. Please sign up again.");
    }

})

// API for login
app.post('/api/login' , async (req ,res)=>{
    const {email , password} = req.body;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const safePassword = typeof password === "string" ? password : "";
    try {
        if (!cleanEmail) {
            return res.status(400).json({message : "Email is required."})
        }
        if (!safePassword) {
            return res.status(400).json({message : "Password is required."})
        }

        const query = 'select * from users where email=?';
        const values = [cleanEmail];
        const [rows] = await db.query(query , values);
        if(rows.length===0){
            return res.status(401).json({message : "Email or password is incorrect"})
        }
        
        const user = rows[0];
        
        const hashedPassword = user.password ;
        const isMatch = await bcrypt.compare(safePassword, hashedPassword)
        if(!isMatch){
            return res.status(401).json({message : "Email or password is incorrect"})
        }
        
        if(user.is_active===0){
            return res.status(401).json({message: "Please verify your account before logging in."});
        }

        const token = jwt.sign(
            {id : user.id , name : user.name , role : user.role}, // payload (info)
            process.env.JWT_SECRET,
            {expiresIn : "1d"}
        )

        return res.status(200).json({
            message :  "Login successful.",
            user : {id : user.id , name : user.name , role : user.role},
            token : token
        })

    }catch (error) {
        res.status(500).json({message : "An error occurred during login." , details:error.message})
    }
})



// API to verify continue with google
app.post("/api/google-auth" , async (req, res)=>{
    const {idToken} = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload();
        const {email , name , sub:googleId} = payload;
        const [rows] = await db.query("SELECT * FROM USERS WHERE EMAIL=?" , [email]);
        
        let user;

        if(rows.length===0){
            const [result] = await db.execute("INSERT INTO USERS (name,email,role) VALUES (?,?,'user')" , [name , email]);
            user = {id:result.id , name : result.name , email : result.email , role : "user"};
        }else{
            user = rows[0];
        }

        const token = jwt.sign(
            {id : user.id , name : user.name, role : user.role},
            process.env.JWT_SECRET,
            {expiresIn : "1d"}
        )

        res.status(200).json({message:"Google authentication successful.",token,user});

    } catch (error) { 
        res.status(500).json({message : "Google authentication failed." , details : error.message});
    }
})



// API for extracting cities
app.get('/api/extractCities' , async (req , res)=>{
    try {
        const [rows] = await db.query('SELECT name FROM cities');
        res.json(rows)
    } catch (error) {
        res.status(500).json({message:"Failed to fetch cities." , details : error.message})
    }
})


// 5. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
