// 1. IMPORTING TOOLS
const express = require('express'); 
const cors = require('cors');
require('dotenv').config();

// 2. INITIALIZATION
const app = express();

// 3. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 4. ROUTES (THE API)
app.get('/api/houses', (req, res) => {
    const fakeHouses = [
        { id: 1, title: 'Beautiful Villa in Tangier', price: 500 },
        { id: 2, title: 'Cozy Apartment in Martil', price: 250 }
    ];
    res.json(fakeHouses);
});

// 5. START SERVER
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});