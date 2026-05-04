const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");

const db = require("./db");

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key",
    );
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
};

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

/* =========================
   TEST DB
========================= */

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

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
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

    const resettingUrl = `http://localhost:5173/Authentication/reset-password?token=${oneTimeActivationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Dar Darek Support" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Resetting your password",
      html: `
        <h1>Dar Darek</h1>
        <p>Click the button below to reset your password:</p>
        <a href="${resettingUrl}" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset My Password</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    res.status(200).json({
      message: "Please check your email to reset your password",
    });
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
    } catch (error) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired.",
      });
    }

    const email = decodedToken.email;

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(safePassword, 10);

    await db.execute("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while changing your password",
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

    await db.execute(
      "INSERT INTO users (name, email, password, phone_number) VALUES (?, ?, ?, ?)",
      [name, cleanEmail, hashedPassword, cleanPhoneNumber],
    );

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

    await transporter.sendMail({
      from: `"Dar Darek Support" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Activate your Dar Darek Account",
      html: `
        <h1>Welcome to Dar Darek!</h1>
        <p>Click the button below to verify your email:</p>
        <a href="${activationUrl}" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Activate My Account</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

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

  if (!token) return res.status(400).send("Token is missing!");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const [result] = await db.execute(
      "UPDATE users SET is_active = 1 WHERE email = ?",
      [email],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("User not found.");
    }

    res.redirect("http://localhost:5173/Authentication");
  } catch (error) {
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

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
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
      { id: user.id_user, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id_user,
        name: user.name,
        role: user.role,
      },
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

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    let user;

    if (rows.length === 0) {
      const [result] = await db.execute(
        "INSERT INTO users (name, email, role) VALUES (?, ?, 'user')",
        [name, email],
      );

      user = {
        id_user: result.insertId,
        name,
        email,
        role: "user",
      };
    } else {
      user = rows[0];
    }

    const token = jwt.sign(
      { id: user.id_user, name: user.name, role: user.role },
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
        c.name AS city_name,
        (
          SELECT image_url
          FROM property_images
          WHERE id_property = p.id_property AND is_main = 1
          LIMIT 1
        ) AS main_image
      FROM properties p
      LEFT JOIN cities c ON p.id_city = c.id_city
      WHERE p.status IN ('approved', 'pending')
      ORDER BY p.created_at DESC
    `);

    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      message: "A server error occurred while fetching properties.",
    });
  }
});

app.get("/api/houses/:id", async (req, res) => {
  try {
    const propertyId = Number(req.params.id);

    if (!propertyId) {
      return res.status(400).json({
        message: "Invalid property id.",
      });
    }

    const [rows] = await db.query(
      `
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
        p.guests_total AS guests,
        p.bedrooms,
        p.bathrooms,
        p.beds,
        p.check_in,
        p.check_out,
        p.available_from,
        p.available_to,
        p.status,
        c.name AS city,
        c.name AS city_name,
        u.name AS host_name,
        SUBSTRING_INDEX(COALESCE(u.name, ''), ' ', 1) AS host_first_name,
        NULLIF(TRIM(SUBSTRING(COALESCE(u.name, ''), LENGTH(SUBSTRING_INDEX(COALESCE(u.name, ''), ' ', 1)) + 1)), '') AS host_last_name
      FROM properties p
      LEFT JOIN cities c ON p.id_city = c.id_city
      LEFT JOIN users u ON p.id_user = u.id_user
      WHERE p.id_property = ?
      LIMIT 1
      `,
      [propertyId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Property not found." });
    }

    const property = rows[0];

    const [images] = await db.query(
      `
      SELECT image_url, is_main
      FROM property_images
      WHERE id_property = ?
      ORDER BY is_main DESC, id_image ASC
      `,
      [propertyId],
    );

    const [amenities] = await db.query(
      `
      SELECT a.name
      FROM property_amenities pa
      JOIN amenities a ON pa.id_amenity = a.id_amenity
      WHERE pa.id_property = ?
      `,
      [propertyId],
    );

    property.images = images.map((image) => image.image_url);
    property.main_image = property.images[0] || null;
    property.amenities = amenities.map((a) => a.name);

    return res.status(200).json({ property });
  } catch (error) {
    console.error("Error fetching property details:", error);
    return res.status(500).json({
      message: "A server error occurred while fetching property details.",
    });
  }
});

app.get("/api/properties/:id", async (req, res) => {
  req.url = `/api/houses/${req.params.id}`;
  return app._router.handle(req, res);
});

app.get("/api/extractHomePageProperties", async (req, res) => {
  try {
    const cityQuery = (cityName) => `
      SELECT p.*, c.name AS city_name, img.image_url AS main_image
      FROM properties p
      JOIN cities c ON p.id_city = c.id_city
      LEFT JOIN property_images img ON img.id_property = p.id_property AND img.is_main = 1
      WHERE c.name = '${cityName}'
      AND p.status = 'approved'
      ORDER BY p.created_at DESC
      LIMIT 10
    `;

    const [latestRows] = await db.query(`
      SELECT p.*, c.name AS city_name, img.image_url AS main_image
      FROM properties p
      JOIN cities c ON p.id_city = c.id_city
      LEFT JOIN property_images img ON img.id_property = p.id_property AND img.is_main = 1
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    const [tangierRows] = await db.query(cityQuery("Tangier"));
    const [tetouanRows] = await db.query(cityQuery("Tetouan"));
    const [chefchaouenRows] = await db.query(cityQuery("Chefchaouen"));
    const [asilahRows] = await db.query(cityQuery("Asilah"));
    const [alHoceimaRows] = await db.query(cityQuery("Al Hoceima"));

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

app.post("/api/propertiesBasedOnParams", async (req, res) => {
  const {
    city,
    checkIn,
    checkOut,
    guests,
    page = 1,
    limit: requestedLimit,
    minPrice,
    maxPrice,
    propertyType,
    bedrooms,
    sortBy,
  } = req.body;

  const limit = Math.max(1, Math.min(Number(requestedLimit) || 9, 24));
  const offset = (Number(page) - 1) * limit;

  try {
    const queryParams = [];
    const whereClauses = ["properties.status = 'approved'"];

    if (city) {
      whereClauses.push("cities.name = ?");
      queryParams.push(city);
    }

    if (checkIn && checkOut) {
      whereClauses.push("available_from <= ?");
      whereClauses.push("available_to >= ?");
      queryParams.push(checkIn, checkOut);
    }

    if (guests) {
      whereClauses.push("guests_total >= ?");
      queryParams.push(guests);
    }

    if (minPrice && maxPrice) {
      whereClauses.push("price_per_day >= ?");
      whereClauses.push("price_per_day <= ?");
      queryParams.push(minPrice, maxPrice);
    }

    if (propertyType) {
      const types = propertyType.split(",");
      const placeholders = types.map(() => "?").join(",");
      whereClauses.push(`property_type IN (${placeholders})`);
      queryParams.push(...types);
    }

    if (bedrooms) {
      if (bedrooms === "4+") {
        whereClauses.push("bedrooms >= ?");
        queryParams.push(4);
      } else {
        whereClauses.push("bedrooms = ?");
        queryParams.push(bedrooms);
      }
    }

    let orderByClause = "ORDER BY properties.created_at DESC";

    if (sortBy === "Price: Low to High") {
      orderByClause = "ORDER BY price_per_day ASC";
    } else if (sortBy === "Price: High to Low") {
      orderByClause = "ORDER BY price_per_day DESC";
    } else if (sortBy === "Newest") {
      orderByClause = "ORDER BY properties.created_at DESC";
    }

    const whereString = whereClauses.join(" AND ");

    const propertiesQuery = `
      SELECT
        properties.*, 
        cities.name AS city_name, 
        cities.description AS city_description,
        property_images.image_url AS main_image
      FROM properties 
      JOIN cities ON properties.id_city = cities.id_city
      LEFT JOIN property_images 
        ON properties.id_property = property_images.id_property 
        AND property_images.is_main = 1
      WHERE ${whereString}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM properties 
      JOIN cities ON properties.id_city = cities.id_city
      WHERE ${whereString}
    `;

    const [properties] = await db.query(propertiesQuery, [
      ...queryParams,
      limit,
      offset,
    ]);

    const [totalCount] = await db.query(countQuery, queryParams);

    const totalPages = Math.ceil(totalCount[0].total / limit);

    return res.status(200).json({
      properties,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cityForAbout", async (req, res) => {
  const { city } = req.body;

  try {
    const [result] = await db.query("SELECT * FROM cities WHERE name = ?", [
      city,
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No city found with that name!" });
    }

    res.status(200).json({
      cityName: result[0].name,
      cityDescription: result[0].description,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occured",
      details: error.message,
    });
  }
});

app.post(
  "/api/publishProperty",
  upload.array("images", 12),
  async (req, res) => {
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
        idUser,
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
          message:
            "The availability end date must be later than the start date.",
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
          idUser || null,
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
  },
);

app.post("/api/houses", upload.array("images", 12), async (req, res) => {
  req.url = "/api/publishProperty";
  return app._router.handle(req, res);
});

/* =========================
   ADMIN ROUTES
========================= */

app.get("/api/pendingProperties", async (req, res) => {
    try {
      const [result] = await db.query(`
        SELECT 
          p.*, 
        c.name AS city_name, 
        users.name AS host_name,
        users.email AS host_email,
        (
          SELECT image_url 
          FROM property_images 
          WHERE id_property = p.id_property 
          ORDER BY is_main DESC 
          LIMIT 1
        ) AS main_image
      FROM properties p
      JOIN cities c ON c.id_city = p.id_city
      LEFT JOIN users ON users.id_user = p.id_user
        WHERE p.status = 'pending'
      `);

      const [statusCounts] = await db.query(`
        SELECT status, COUNT(*) AS total
        FROM properties
        GROUP BY status
      `);

      const summary = statusCounts.reduce(
        (acc, row) => {
          const safeStatus = String(row.status || "").toLowerCase();
          const total = Number(row.total) || 0;

          acc.all += total;

          if (safeStatus === "approved") {
            acc.approved += total;
          } else if (safeStatus === "rejected") {
            acc.rejected += total;
          } else if (safeStatus === "pending") {
            acc.pending += total;
          }

          return acc;
        },
        { all: 0, pending: 0, approved: 0, rejected: 0 },
      );
  
      res.status(200).json({
        pendingProperties: result,
        summary,
      });
    } catch (error) {
      res.status(500).json({ details: error.message });
    }
  });

app.post("/api/admin/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(
      "UPDATE properties SET status = 'approved' WHERE id_property = ?",
      [id],
    );
    res.status(200).json({ message: "Property approved successfully." });
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
});

app.post("/api/admin/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(
      "UPDATE properties SET status = 'rejected' WHERE id_property = ?",
      [id],
    );
    res.status(200).json({ message: "Property rejected successfully." });
  } catch (error) {
    res.status(500).json({ details: error.message });
  }
});

/* =========================
   BOOKING ROUTES
========================= */

app.post("/api/bookingProperty", verifyToken, async (req, res) => {
  const { id_property, checkIn, checkOut, total_price, id_user } = req.body;

  try {
    if (!id_property || !checkIn || !checkOut || !total_price || !id_user) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date.",
      });
    }

    const [bookingConflict] = await db.query(
      `
      SELECT id_booking 
      FROM bookings 
      WHERE id_property = ? 
      AND status IN ('pending', 'confirmed')
      AND (start_date < ? AND end_date > ?)
      `,
      [id_property, checkOut, checkIn],
    );

    if (bookingConflict.length > 0) {
      return res.status(400).json({
        message: "Property is already booked for these dates.",
      });
    }

    await db.query(
      `
      INSERT INTO bookings 
      (id_property, id_user, start_date, end_date, total_price, status) 
      VALUES (?, ?, ?, ?, ?, 'pending')
      `,
      [id_property, id_user, checkIn, checkOut, total_price],
    );

    res.status(201).json({
      message: "Booking request submitted successfully!",
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({
      message: "Server error while processing your booking.",
    });
  }
});

app.get("/api/rentalRequests", verifyToken, async (req, res) => {
  const tokenUserId = Number(req.user?.id);
  const queryUserId = Number(req.query?.id_user);
  const id_user =
    Number.isFinite(tokenUserId) && tokenUserId > 0 ? tokenUserId : queryUserId;

  try {
    if (!id_user) {
      return res.status(400).json({ message: "User id is required." });
    }

    const [rentalRequests] = await db.query(
      `
      SELECT 
        b.id_booking AS id,
        b.start_date AS checkIn,
        b.end_date AS checkOut,
        b.total_price AS totalPrice,
        b.status AS status,
        p.title AS title,
        u.name AS guestName,
        (
          SELECT image_url 
          FROM property_images 
          WHERE id_property = p.id_property 
          LIMIT 1
        ) AS image
      FROM bookings b
      JOIN properties p ON b.id_property = p.id_property
      JOIN users u ON b.id_user = u.id_user
      WHERE p.id_user = ? 
      AND b.id_user != ?
      ORDER BY b.created_at DESC
      `,
      [id_user, id_user],
    );

    res.status(200).json({ rentalRequests });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching rental requests.",
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
