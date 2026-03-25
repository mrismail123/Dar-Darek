// 1. IMPORTING TOOLS

// express to facilitate the coding
const express = require('express'); 
// cors for security
const cors = require('cors');
// Our db
const db = require('./db');
// .env file
require('dotenv').config();

// bcrypt
const bcrypt = require('bcrypt');


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
        res.json({message : "Database is connected!" , data:rows})
    } catch (error) {
        res.status(500).json({message:"Database connection failed" , details : error.message})
    }
    })




// API for sign up 
app.post('/api/signup' , async (req , res)=>{
    const {firstName , lastName , email , password, confirmPassword, phoneNumber } = req.body;
    const name = `${firstName} ${lastName}`
    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password,10)
    const query = "INSERT INTO users (name, email, password, phone_number)  VALUES (?,?,?,?)";
    const values = [name , cleanEmail ,hashedPassword,phoneNumber]
    try {
        await db.execute(query , values);
        res.status(201).json({message : "User created successfunolly!"})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

// API for login
app.post('/api/login' , async (req ,res)=>{
    const {email , password} = req.body;
    console.log(email);
    console.log(password)
    const cleanEmail = email.trim().toLowerCase();
    const query = 'select * from users where email=?';
    const values = [cleanEmail];
    try {
        const [rows] = await db.query(query , values);
        if(rows.length===0){
            return res.status(401).json({message : "Email or password is incorrect"})
        }
        
        const user = rows[0];
        
        const hashedPassword = user.password ;
        const isMatch = await bcrypt.compare(password, hashedPassword)
        if(!isMatch){
            return res.status(401).json({message : "Email or password is incorrect"})
        }

        console.log("User found...");
        return res.status(201).json({id : user.id, name : user.name, email : user.email , role : user.role})
    } catch (error) {
        res.status(500).json({message : "Error while compiling..." , details:error.message})
    }
})


// 5. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

