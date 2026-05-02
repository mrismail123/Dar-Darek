const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed."), false);
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

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({ message: "Database connection successful.", data: rows });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed.",
      details: error.message,
    });
  }
});

/* =========================
   AUTH ROUTES
   ========================= */

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  const cleanEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  try {
    if (!cleanEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: "Email format is not valide" });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [
      cleanEmail,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    const oneTimeActivationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const ResetingUrl = `http://localhost:5173/Authentication/reset-password?token=${oneTimeActivationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Dar Darek Support" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Reseting your password",
      html: `
        <h1>Welcome to Dar Darek!</h1>
        <p>Click the button below to reset your password:</p>
        <a href="${ResetingUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset My Password</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Please check your email to reset your password" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during verifying your account",
      details: error.message,
    });
  }
});

app.post("/api/change-password", async (req, res) => {
  const { password, confirmPassword, token } = req.body;
  const safePassword = typeof password === "string" ? password : "";
  const safeConfirmPassword =
    typeof confirmPassword === "string" ? confirmPassword : "";
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{10,50}$/;

  try {
    if (!safePassword || !safeConfirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password are required.",
      });
    }

    if (!passwordRegex.test(safePassword)) {
      return res.status(400).json({
        message:
          "Password must be 10 to 50 characters long and include at least one letter and one number.",
      });
    }

    if (safePassword !== safeConfirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password do not match.",
      });
    }

    if (!token) {
      return res.status(400).json({ message: "Token missing." });
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({
        message: "Reset link is invalid or has expired.",
      });
    }

    const email = decodedToken.email;

    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const hashedPassword = await bcrypt.hash(safePassword, 10);

    await db.execute("UPDATE users SET password=? WHERE email=?", [
      hashedPassword,
      email,
    ]);

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during try to change your password",
      details: error.message,
    });
  }
});

app.post("/api/signup", async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, phoneNumber } =
    req.body;

  const trimmedFirstName =
    typeof firstName === "string" ? firstName.trim() : "";
  const trimmedLastName = typeof lastName === "string" ? lastName.trim() : "";
  const cleanEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanPhoneNumber =
    typeof phoneNumber === "string" ? phoneNumber.trim() : "";
  const safePassword = typeof password === "string" ? password : "";
  const safeConfirmPassword =
    typeof confirmPassword === "string" ? confirmPassword : "";
  const name = `${trimmedFirstName} ${trimmedLastName}`.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{10,50}$/;

  try {
    if (!trimmedFirstName || !trimmedLastName) {
      return res.status(400).json({
        message: "First name and last name are required.",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!safePassword || !safeConfirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password are required.",
      });
    }

    if (!passwordRegex.test(safePassword)) {
      return res.status(400).json({
        message:
          "Password must be 10 to 50 characters long and include at least one letter and one number.",
      });
    }

    if (safePassword !== safeConfirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password do not match.",
      });
    }

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (!cleanPhoneNumber) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    if (!phoneRegex.test(cleanPhoneNumber)) {
      return res.status(400).json({
        message: "Please enter a valid phone number.",
      });
    }

    const hashedPassword = await bcrypt.hash(safePassword, 10);

    const query =
      "INSERT INTO users (name, email, password, phone_number) VALUES (?, ?, ?, ?)";
    const values = [name, cleanEmail, hashedPassword, cleanPhoneNumber];

    await db.execute(query, values);

    const oneTimeActivationToken = jwt.sign(
      { email: cleanEmail },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const activationUrl = `http://localhost:5000/api/activate-account?token=${oneTimeActivationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Dar Darek Support" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Activate your Dar Darek Account",
      html: `
        <h1>Welcome to Dar Darek!</h1>
        <p>Click the button below to verify your email and start hosting or renting apartments:</p>
        <a href="${activationUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Activate My Account</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Account created! Please check your email to activate it.",
      user: name,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    res.status(500).json({
      message: "Failed to create user account.",
      details: error.message,
    });
  }
});

app.get("/api/activate-account", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Token is missing!");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const [result] = await db.execute(
      "UPDATE users SET is_active=1 WHERE email=?",
      [email],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("User not found.");
    }

    res.redirect("http://localhost:5173/Authentication");
  } catch {
    res.status(400).send("Link expired or invalid. Please sign up again.");
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const safePassword = typeof password === "string" ? password : "";

  try {
    if (!cleanEmail) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!safePassword) {
      return res.status(400).json({ message: "Password is required." });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [
      cleanEmail,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Email or password is incorrect",
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(safePassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Email or password is incorrect",
      });
    }

    if (user.is_active === 0) {
      return res.status(401).json({
        message: "Please verify your account before logging in.",
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login successful.",
      user: { id: user.id, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during login.",
      details: error.message,
    });
  }
});

app.post("/api/google-auth", async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

    let user;

    if (rows.length === 0) {
      const [result] = await db.execute(
        "INSERT INTO users (name, email, role) VALUES (?, ?, 'user')",
        [name, email],
      );

      user = {
        id: result.insertId,
        name,
        email,
        role: "user",
      };
    } else {
      user = rows[0];
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Google authentication successful.",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Google authentication failed.",
      details: error.message,
    });
  }
});

/* =========================
   PROPERTY ROUTES
   ========================= */

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
      WHERE p.status IN ('approved', 'pending')
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

app.get("/api/extractCities", async (req, res) => {
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
      details: error.message,
    });
  }
});

app.get("/api/extractHomePageProperties", async (req, res) => {
  try {
    const [latestRows] = await db.query(`
      SELECT p.*, c.name AS city_name 
      FROM properties p 
      JOIN cities c ON p.id_city = c.id_city 
      ORDER BY p.created_at DESC 
      LIMIT 10
    `);

    const [tangierRows] = await db.query(`
      SELECT p.*, c.name AS city_name
      FROM properties p
      JOIN cities c ON p.id_city = c.id_city
      WHERE c.name = 'Tangier'
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    const [tetouanRows] = await db.query(`
      SELECT p.*, c.name AS city_name
      FROM properties p
      JOIN cities c ON p.id_city = c.id_city
      WHERE c.name = 'Tetouan'
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    const [chefchaouenRows] = await db.query(`
      SELECT p.*, c.name AS city_name
      FROM properties p
      JOIN cities c ON p.id_city = c.id_city
      WHERE c.name = 'Chefchaouen'
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    const [asilahRows] = await db.query(`
      SELECT p.*, c.name AS city_name
      FROM properties p
      JOIN cities c ON p.id_city = c.id_city
      WHERE c.name = 'Asilah'
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    const [alHoceimaRows] = await db.query(`
      SELECT p.*, c.name AS city_name
      FROM properties p
      JOIN cities c ON p.id_city = c.id_city
      WHERE c.name = 'Al Hoceima'
      ORDER BY p.created_at DESC
      LIMIT 10
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
      alHoceima: alHoceimaRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Extracting properties failed",
      details: error.message,
    });
  }
});

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
      await db.query(
        `
        INSERT INTO property_images (id_property, image_url, is_main)
        VALUES (?, ?, ?)
        `,
        [propertyId, uploadedImages[i], i === 0],
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
        await db.query(
          `
          INSERT INTO property_amenities (id_property, id_amenity)
          VALUES (?, ?)
          `,
          [propertyId, amenityRows[0].id_amenity],
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

/* =========================
   START SERVER
   ========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
