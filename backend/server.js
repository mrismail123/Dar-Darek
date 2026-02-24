const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Loads your .env file

// 1. Initialize the "Waiter" (Express App)
const app = express();

// 2. Give the Waiter some basic rules
app.use(cors()); // Allow React to talk to us
app.use(express.json()); // Allow the Waiter to read JSON data from React

// 3. Create our very first "Route" (A menu item the customer can order)
// When React asks for the homepage ("/"), the Waiter says hello!
app.get('/', (req, res) => {
    res.send('Hello from the Moroccan Airbnb Backend!');
});

// Example Route: This is where you will eventually fetch houses from MySQL
app.get('/api/houses', (req, res) => {
    // For now, we just send fake data. Later, we will use your db.js here!
    const fakeHouses = [
        { id: 1, title: 'Beautiful Villa in Tangier', price: 500 },
        { id: 2, title: 'Cozy Apartment in Martil', price: 250 }
    ];
    res.json(fakeHouses);
});

// 4. Start the server (Tell the Waiter to put on his uniform and start working)
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Waiter is ready and listening on http://localhost:${PORT}`);
});

