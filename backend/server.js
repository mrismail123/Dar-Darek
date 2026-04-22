const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
