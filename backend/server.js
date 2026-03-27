// 1. IMPORTING TOOLS

// express to facilitate the coding
const express = require('express'); 

// jwt 
const jwt = require('jsonwebtoken');

// cors for security
const cors = require('cors');
// bcrypt
const bcrypt = require('bcrypt');
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
        res.status(201).json({user : name})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

// API for login
app.post('/api/login' , async (req ,res)=>{
    const {email , password} = req.body;
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

        const token = jwt.sign(
            {id : user.id , name : user.name , role : user.role}, // payload (info)
            process.env.JWT_SECRET,
            {expiresIn : "1d"}
        )

        return res.status(200).json({
            message :  `welcome ${user.role}`,
            user : {id : user.id , name : user.name , role : user.role},
            token : token
        })

    }catch (error) {
        res.status(500).json({message : "Error while compiling..." , details:error.message})
    }
})


// 5. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

