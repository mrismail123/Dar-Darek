// 1. IMPORTING TOOLS

// express to facilitate the coding
const express = require('express');
const path = require('path');

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



const fs = require("fs");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. ROUTES (THE API)


// Test the database first
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ message: "Database connection successful.", data: rows })
    } catch (error) {
        res.status(500).json({ message: "Database connection failed.", details: error.message })
    }
})



// ########################## Start APIs for Login System ############################


// API for forgot-password form
app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    try {
        if (!cleanEmail) {
            return res.status(400).json({ message: "Email is required" });
        }
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ message: "Email format is not valide" });
        }

        // Verify if the email exists or not
        const [rows] = await db.query("SELECT * FROM users WHERE email=?", [cleanEmail]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = rows[0];

        // Create a one-time reset token
        const oneTimeActivationToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        )

        const ResetingUrl = `http://localhost:5173/Authentication/reset-password?token=${oneTimeActivationToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOptions = {
            from: `"Dar Darek Support" <${process.env.EMAIL_USER}>`,
            to: cleanEmail,
            subject: "Reseting your password",
            html: `
                <h1>Welcome to Dar Darek!</h1>
                <p>Click the button below to reset your password:</p>
                <a href="${ResetingUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Activate My Account</a>
                <p>This link will expire in 15 minutes.</p>
            `
        }

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Please check your email to reset your password" });

    } catch (error) {
        res.status(500).json({ message: "An error occurred during verifying your account", details: error.message });
    }
})

// API to change password
app.post("/api/change-password", async (req, res) => {
    const { password, confirmPassword, token } = req.body;
    const safePassword = typeof password === "string" ? password : "";
    const safeConfirmPassword = typeof confirmPassword === "string" ? confirmPassword : "";
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{10,50}$/;
    try {
        if (!safePassword || !safeConfirmPassword) {
            return res.status(400).json({ message: "Password and confirm password are required." });
        }
        if (!passwordRegex.test(safePassword)) {
            return res.status(400).json({ message: "Password must be 10 to 50 characters long and include at least one letter and one number." });
        }
        if (safePassword !== safeConfirmPassword) {
            return res.status(400).json({ message: "Password and confirm password do not match." });
        }
        if (!token) return res.status(400).json({ message: "Token missing." });

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({ message: "Reset link is invalid or has expired." });
        }
        const email = decodedToken.email;

        const [rows] = await db.query("select * from users where email=?", [email]);

        if (rows.length === 0) {
            return res.status(404).send("User not found");
        }

        const hashedPassword = await bcrypt.hash(safePassword, 10);

        await db.execute("update users set password=? where email=?", [hashedPassword, email]);

        return res.status(200).json({ message: "Password updated successfully." });

    } catch (error) {
        res.status(500).json({ message: "An error occurred during try to change your password", details: error.message });
    }
})

// API for sign up 
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, phoneNumber } = req.body;
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
        if (!trimmedFirstName || !trimmedLastName) {
            return res.status(400).json({ message: "First name and last name are required." });
        }
        if (!cleanEmail) {
            return res.status(400).json({ message: "Email is required." });
        }
        if (!safePassword || !safeConfirmPassword) {
            return res.status(400).json({ message: "Password and confirm password are required." });
        }
        if (!passwordRegex.test(safePassword)) {
            return res.status(400).json({ message: "Password must be 10 to 50 characters long and include at least one letter and one number." });
        }
        if (safePassword !== safeConfirmPassword) {
            return res.status(400).json({ message: "Password and confirm password do not match." });
        }
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }
        if (!cleanPhoneNumber) {
            return res.status(400).json({ message: "Phone number is required." });
        }
        if (!phoneRegex.test(cleanPhoneNumber)) {
            return res.status(400).json({ message: "Please enter a valid phone number." });
        }
        const hashedPassword = await bcrypt.hash(safePassword, 10);
        const query = "INSERT INTO users (name, email, password, phone_number)  VALUES (?,?,?,?)";
        const values = [name, cleanEmail, hashedPassword, cleanPhoneNumber]
        await db.execute(query, values);

        const oneTimeActivationToken = jwt.sign(
            { email: cleanEmail },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const activationUrl = `http://localhost:5000/api/activate-account?token=${oneTimeActivationToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
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
        res.status(201).json({ message: "Account created! Please check your email to activate it.", user: name })
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        res.status(500).json({ message: "Failed to create user account.", details: error.message })
    }
})

// API for activiting account after the user clicks on the email button
app.get("/api/activate-account", async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).send("Token is missing!")

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const [result] = await db.execute("UPDATE users SET is_active=1 WHERE email=?", [email]);
        if (result.affectedRows === 0) return res.status(404).send("User not found.");

        res.redirect("http://localhost:5173/Authentication");

    } catch (error) {
        res.status(400).send("Link expired or invalid. Please sign up again.");
    }

})

// API for login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const safePassword = typeof password === "string" ? password : "";
    try {
        if (!cleanEmail) {
            return res.status(400).json({ message: "Email is required." })
        }
        if (!safePassword) {
            return res.status(400).json({ message: "Password is required." })
        }

        const query = 'select * from users where email=?';
        const values = [cleanEmail];
        const [rows] = await db.query(query, values);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Email or password is incorrect" })
        }

        const user = rows[0];

        const hashedPassword = user.password;
        const isMatch = await bcrypt.compare(safePassword, hashedPassword)
        if (!isMatch) {
            return res.status(401).json({ message: "Email or password is incorrect" })
        }

        if (user.is_active === 0) {
            return res.status(401).json({ message: "Please verify your account before logging in." });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role }, // payload (info)
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        return res.status(200).json({
            message: "Login successful.",
            user: { id: user.id, name: user.name, role: user.role },
            token: token
        })

    } catch (error) {
        res.status(500).json({ message: "An error occurred during login.", details: error.message })
    }
})

// API to verify continue with google
app.post("/api/google-auth", async (req, res) => {
    const { idToken } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;
        const [rows] = await db.query("SELECT * FROM USERS WHERE EMAIL=?", [email]);

        let user;

        if (rows.length === 0) {
            const [result] = await db.execute("INSERT INTO USERS (name,email,role) VALUES (?,?,'user')", [name, email]);
            user = { id: result.id, name: result.name, email: result.email, role: "user" };
        } else {
            user = rows[0];
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.status(200).json({ message: "Google authentication successful.", token, user });

    } catch (error) {
        res.status(500).json({ message: "Google authentication failed.", details: error.message });
    }
})


// ########################## End APIs for Login System ############################



// ########################## Start APIs for Extracting properties System ############################

// API for extracting cities for the location select
app.get('/api/extractCities', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT id_city, name
            FROM cities
            ORDER BY name ASC
        `);

        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch cities.",
            details: error.message
        });
    }
});

// API for extracting properties for home page
app.get('/api/extractHomePageProperties', async (req, res) => {
    try {


        const [latestRows] = await db.query(`
        SELECT p.*, c.name AS city_name, img.image_url AS main_image
        FROM properties p 
        JOIN cities c ON p.id_city = c.id_city 
        LEFT JOIN property_images img ON img.id_property = p.id_property AND img.is_main = 1
        ORDER BY p.created_at DESC 
        LIMIT 10;
    `);

        // 2. Tangier
        const [tangierRows] = await db.query(`
        SELECT p.*, c.name AS city_name, img.image_url AS main_image
        FROM properties p
        JOIN cities c ON p.id_city = c.id_city
        LEFT JOIN property_images img ON img.id_property = p.id_property AND img.is_main = 1
        WHERE c.name = 'Tangier'
        ORDER BY p.created_at DESC
        LIMIT 10;
    `);

        // 3. Tetouan
        const [tetouanRows] = await db.query(`
        SELECT p.*, c.name AS city_name, img.image_url AS main_image
        FROM properties p
        JOIN cities c ON p.id_city = c.id_city
        LEFT JOIN property_images img ON img.id_property = p.id_property AND img.is_main = 1
        WHERE c.name = 'Tetouan'
        ORDER BY p.created_at DESC
        LIMIT 10;
    `);

        // 4. Chefchaouen
        const [chefchaouenRows] = await db.query(`
        SELECT p.*, c.name AS city_name, img.image_url AS main_image
        FROM properties p
        JOIN cities c ON p.id_city = c.id_city
        LEFT JOIN property_images img ON img.id_property = p.id_property AND img.is_main = 1
        WHERE c.name = 'Chefchaouen'
        ORDER BY p.created_at DESC
        LIMIT 10;
    `);

        // 5. Asilah
        const [asilahRows] = await db.query(`
        SELECT p.*, c.name AS city_name, img.image_url AS main_image
        FROM properties p
        JOIN cities c ON p.id_city = c.id_city
        LEFT JOIN property_images img ON img.id_property = p.id_property AND img.is_main = 1
        WHERE c.name = 'Asilah'
        ORDER BY p.created_at DESC
        LIMIT 10;
    `);

        // 6. Al Hoceima
        const [alHoceimaRows] = await db.query(`
        SELECT p.*, c.name AS city_name, img.image_url AS main_image
        FROM properties p
        JOIN cities c ON p.id_city = c.id_city
        LEFT JOIN property_images img ON img.id_property = p.id_property AND img.is_main = 1
        WHERE c.name = 'Al Hoceima'
        ORDER BY p.created_at DESC
        LIMIT 10;
    `);

        if (
            latestRows.length === 0 &&
            tangierRows.length === 0 &&
            tetouanRows.length === 0 &&
            chefchaouenRows.length === 0
        ) {
            return res.status(404).json({ message: "No properties found" });
        }

        res.status(200).json({
            message: "Extracted with success",
            latest: latestRows,
            tangier: tangierRows,
            tetouan: tetouanRows,
            chefchaouen: chefchaouenRows,
            asilah: asilahRows,
            alHoceima: alHoceimaRows
        });

    } catch (error) {
        res.status(500).json({ message: "Extracting properties failed", details: error.message });
    }
})

// API for extracting properties based on params
app.post('/api/propertiesBasedOnParams', async (req, res) => {
    const {
        city,
        checkIn,
        checkOut,
        guests,
        page = 1,
        minPrice,
        maxPrice,
        propertyType,
        bedrooms,
        sortBy } = req.body;
    const limit = 9;
    const offset = (page - 1) * limit;

    let properties;
    let totalCount;

    try {
        let queryParams = [city];
        let whereClauses = ['cities.name = ?'];

        // checkIn & checkOut
        if (checkIn && checkOut) {
            whereClauses.push('available_from <= ?');
            whereClauses.push('available_to >= ?');
            queryParams.push(checkIn, checkOut);
        }

        // guests
        if (guests) {
            whereClauses.push('guests_total >= ?');
            queryParams.push(guests);
        }

        // Price range
        if (minPrice && maxPrice) {
            whereClauses.push('price_per_day >= ?');
            whereClauses.push('price_per_day <= ?');
            queryParams.push(minPrice, maxPrice);
        }

        // Property type (comes as comma-separated string from the URL)
        if (propertyType) {
            const types = propertyType.split(',');
            if (types.length > 0) {
                const placeholders = types.map(() => '?').join(',');
                whereClauses.push(`property_type IN (${placeholders})`);
                queryParams.push(...types);
            }
        }

        // Bedrooms
        if (bedrooms) {
            if (bedrooms === '4+') {
                whereClauses.push('bedrooms >= ?');
                queryParams.push(4);
            } else {
                whereClauses.push('bedrooms = ?');
                queryParams.push(bedrooms);
            }
        }

        // Sorting
        let orderByClause = 'ORDER BY properties.created_at DESC'; // default
        if (sortBy) {
            if (sortBy === 'Price: Low to High') {
                orderByClause = 'ORDER BY price_per_day ASC';
            } else if (sortBy === 'Price: High to Low') {
                orderByClause = 'ORDER BY price_per_day DESC';
            } else if (sortBy === 'Newest') {
                orderByClause = 'ORDER BY properties.created_at DESC';
            }
        }

        // Combine clauses
        const whereString = whereClauses.join(' AND ');

        const propertiesQuery = `
            SELECT
                properties.*, 
                cities.name as city_name, 
                cities.description as city_description,
                property_images.image_url as main_image
                FROM properties 
                JOIN cities ON properties.id_city = cities.id_city
                LEFT JOIN property_images ON properties.id_property = property_images.id_property 
                AND property_images.is_main = 1
                WHERE ${whereString}
                ${orderByClause}
                LIMIT ? OFFSET ?;
        `;

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM properties 
            JOIN cities ON properties.id_city = cities.id_city
            
            WHERE ${whereString};
        `;

        [properties] = await db.query(propertiesQuery, [...queryParams, limit, offset]);
        [totalCount] = await db.query(countQuery, queryParams);

        const totalPages = Math.ceil(totalCount[0].total / limit);

        return res.status(200).json({
            properties,
            totalPages
            // currentPage: page
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API to extract city for about section 
app.post('/api/cityForAbout', async (req, res) => {
    const { city } = req.body;
    const sql = "select * from cities where name=?";
    const params = [city];
    try {
        const [result] = await db.query(sql, params);
        if (result.length === 0) {
            return res.status(404).json({ message: "No city found with that name!" });
        }
        res.status(200).json({
            cityName: result[0].name,
            cityDescription: result[0].description
        })
    } catch (error) {
        res.status(500).json({ message: "Error occured", details: error.message });
    }
})

// API to extract pending properties
app.get('/api/pendingProperties', async (req, res) => {
    try {
        const sql = `select properties.* , c.name as city_name , img.image_url as main_image
                    from properties 
                    join cities c on c.id_city = properties.id_city
                    left join property_images img on properties.id_property = img.id_property
                    where 
                    status='pending';`;
        const [result] = await db.query(sql);
        if (result.length === 0) {
            return res.status(404).json({ message: "No pending properties found" });
        }
        res.status(200).json({
            pendingProperties: result
        })
    } catch (error) {
        res.status(500).json({ details: error.message });
    }
})

// ########################## End APIs for Extracting properties System ############################


// ==================== MULTER CONFIGURATION ====================
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
        )}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed."), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        files: 12,
        fileSize: 5 * 1024 * 1024,
    },
});

const AMENITY_NAME_MAP = {
    wifi: "WiFi",
    hotWater: "hotWater",
    sheets: "sheets",
    towels: "towels",
    toiletries: "toiletries",
    refrigerator: "refrigerator",

    kitchen: "Kitchen",
    microwave: "microwave",
    oven: "oven",
    kettle: "kettle",
    coffeeMachine: "coffeeMachine",
    dishes: "dishes",

    airConditioning: "Air Conditioning",
    heating: "heating",
    washingMachine: "washingMachine",
    dryer: "dryer",
    tv: "tv",
    sofa: "sofa",

    workspace: "workspace",
    desk: "desk",
    fastWifi: "fastWifi",
    smartTv: "smartTv",

    balcony: "balcony",
    terrace: "terrace",
    seaView: "Sea View",
    mountainView: "mountainView",
    medinaView: "medinaView",
    natureView: "natureView",
    beachAccess: "beachAccess",
    pool: "Pool",
    bbq: "bbq",
    garden: "garden",

    breakfast: "breakfast",
    parking: "Parking",
    petFriendly: "petFriendly",
    housekeeping: "housekeeping",
    airportShuttle: "airportShuttle",
    reception: "reception",

    smokeDetector: "smokeDetector",
    fireExtinguisher: "fireExtinguisher",
    outdoorCamera: "outdoorCamera",
    safeBox: "safeBox",
};

// GET approved properties only
app.get("/api/houses", async (req, res) => {
    try {
        const [properties] = await db.query(`
      SELECT
        p.id_property,
        p.title,
        p.description,
        p.host_description,
        p.neighborhood_description,
        p.address,
        p.neighborhood,
        p.postal_code,
        p.access_instructions,
        p.latitude,
        p.longitude,
        p.property_type,
        p.price_per_day,
        p.guests_total,
        p.bedrooms,
        p.bathrooms,
        p.beds,
        p.check_in,
        p.check_out,
        p.available_from,
        p.available_to,
        p.status,
        c.name AS city,
        (
          SELECT image_url
          FROM property_images
          WHERE id_property = p.id_property AND is_main = true
          LIMIT 1
        ) AS main_image
      FROM properties p
      LEFT JOIN cities c ON p.id_city = c.id_city
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC
    `);

        for (const property of properties) {
            const [amenities] = await db.query(
                `
        SELECT a.name
        FROM property_amenities pa
        JOIN amenities a ON pa.id_amenity = a.id_amenity
        WHERE pa.id_property = ?
        `,
                [property.id_property],
            );

            property.amenities = amenities.map((a) => a.name);
        }

        res.json(properties);
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({
            message: "A server error occurred while fetching properties.",
        });
    }
});

// GET all cities
app.get("/api/cities", async (req, res) => {
    try {
        const [cities] = await db.query(
            "SELECT id_city, name FROM cities ORDER BY name ASC",
        );
        res.json(cities);
    } catch (error) {
        console.error("Error fetching cities:", error);
        res.status(500).json({
            message: "A server error occurred while fetching cities.",
        });
    }
});

// POST new property
app.post("/api/houses", upload.array("images", 12), async (req, res) => {
    try {
        const {
            title,
            description,
            hostDescription,
            neighborhoodDescription,
            city,
            address,
            neighborhood,
            postalCode,
            accessInstructions,
            latitude,
            longitude,
            propertyType,
            guests,
            bedrooms,
            bathrooms,
            beds,
            price,
            checkIn,
            checkOut,
            availableFrom,
            availableTo,
        } = req.body;

        const amenities = JSON.parse(req.body.amenities || "{}");
        const uploadedImages = req.files
            ? req.files.map((file) => `/uploads/${file.filename}`)
            : [];

        if (
            !title ||
            !description ||
            !city ||
            !address ||
            !price ||
            !guests ||
            !availableFrom ||
            !availableTo
        ) {
            return res.status(400).json({
                message: "Some required fields are missing.",
            });
        }

        if (availableTo < availableFrom) {
            return res.status(400).json({
                message: "The availability end date must be later than the start date.",
            });
        }

        if (uploadedImages.length < 4) {
            return res.status(400).json({
                message: "Please upload at least 4 images.",
            });
        }

        const [cities] = await db.query(
            "SELECT id_city FROM cities WHERE name = ?",
            [city.trim()],
        );

        if (cities.length === 0) {
            return res.status(400).json({
                message: "Invalid city. Please choose a valid city.",
            });
        }

        const id_city = cities[0].id_city;

        const [result] = await db.query(
            `
      INSERT INTO properties (
        title,
        description,
        host_description,
        neighborhood_description,
        address,
        neighborhood,
        postal_code,
        access_instructions,
        latitude,
        longitude,
        property_type,
        id_city,
        id_user,
        price_per_day,
        guests_total,
        bedrooms,
        bathrooms,
        beds,
        check_in,
        check_out,
        available_from,
        available_to,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                title?.trim() || null,
                description?.trim() || null,
                hostDescription?.trim() || null,
                neighborhoodDescription?.trim() || null,
                address?.trim() || null,
                neighborhood?.trim() || null,
                postalCode?.trim() || null,
                accessInstructions?.trim() || null,
                latitude ? Number(latitude) : null,
                longitude ? Number(longitude) : null,
                propertyType || null,
                id_city,
                null,
                Number(price),
                Number(guests),
                Number(bedrooms || 0),
                Number(bathrooms || 0),
                Number(beds || 0),
                checkIn || null,
                checkOut || null,
                availableFrom || null,
                availableTo || null,
                "pending",
            ],
        );

        const propertyId = result.insertId;

        for (let i = 0; i < uploadedImages.length; i++) {
            const imageUrl = uploadedImages[i];

            await db.query(
                `
        INSERT INTO property_images (id_property, image_url, is_main)
        VALUES (?, ?, ?)
        `,
                [propertyId, imageUrl, i === 0],
            );
        }

        const selectedAmenities = Object.keys(amenities).filter(
            (key) => amenities[key] === true,
        );

        for (const amenityKey of selectedAmenities) {
            const dbAmenityName = AMENITY_NAME_MAP[amenityKey] || amenityKey;

            const [amenityRows] = await db.query(
                "SELECT id_amenity FROM amenities WHERE name = ?",
                [dbAmenityName],
            );

            if (amenityRows.length > 0) {
                const id_amenity = amenityRows[0].id_amenity;

                await db.query(
                    `
          INSERT INTO property_amenities (id_property, id_amenity)
          VALUES (?, ?)
          `,
                    [propertyId, id_amenity],
                );
            }
        }

        res.status(201).json({
            message:
                "Your listing has been submitted successfully and is now awaiting approval.",
            propertyId,
        });
    } catch (error) {
        console.error("Error adding property:", error);
        res.status(500).json({
            message: "A server error occurred while creating the listing.",
        });
    }
});

// 5. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
