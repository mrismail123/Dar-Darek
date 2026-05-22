const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");

const db = require("./db");

const app = express();
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const CORS_ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || FRONTEND_URL)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "1053795619331-gldssns0qs9dol9j9rrfouf8ajkqkmj6.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CORS_ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

let moderationSchemaReady = false;

const ensureModerationSchema = async () => {
  if (moderationSchemaReady) return;

  const [userColumns] = await db.query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('is_suspended', 'suspension_reason', 'suspended_at')
    `,
  );

  const existingUserColumns = new Set(
    userColumns.map((column) => column.COLUMN_NAME),
  );

  if (!existingUserColumns.has("is_suspended")) {
    await db.query(
      "ALTER TABLE users ADD COLUMN is_suspended TINYINT(1) NOT NULL DEFAULT 0",
    );
  }

  if (!existingUserColumns.has("suspension_reason")) {
    await db.query(
      "ALTER TABLE users ADD COLUMN suspension_reason VARCHAR(255) DEFAULT NULL",
    );
  }

  if (!existingUserColumns.has("suspended_at")) {
    await db.query(
      "ALTER TABLE users ADD COLUMN suspended_at TIMESTAMP NULL DEFAULT NULL",
    );
  }

  const [propertyColumns] = await db.query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'properties'
      AND COLUMN_NAME IN ('admin_notes', 'reviewed_by')
    `,
  );

  const existingPropertyColumns = new Set(
    propertyColumns.map((column) => column.COLUMN_NAME),
  );

  if (!existingPropertyColumns.has("admin_notes")) {
    await db.query(
      "ALTER TABLE properties ADD COLUMN admin_notes TEXT DEFAULT NULL",
    );
  }

  if (!existingPropertyColumns.has("reviewed_by")) {
    await db.query(
      "ALTER TABLE properties ADD COLUMN reviewed_by INT DEFAULT NULL",
    );
  }

  const [statusColumns] = await db.query(
    `
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'properties'
      AND COLUMN_NAME = 'status'
    LIMIT 1
    `,
  );

  const propertyStatusType = statusColumns[0]?.COLUMN_TYPE || "";

  if (
    propertyStatusType.includes("enum") &&
    !propertyStatusType.includes("'draft'")
  ) {
    await db.query(
      "ALTER TABLE properties MODIFY COLUMN status ENUM('draft','pending','approved','rejected') NOT NULL DEFAULT 'pending'",
    );
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id_report INT NOT NULL AUTO_INCREMENT,
      reporter_id INT NOT NULL,
      reported_user_id INT DEFAULT NULL,
      id_property INT DEFAULT NULL,
      id_booking INT DEFAULT NULL,
      category VARCHAR(50) NOT NULL DEFAULT 'other',
      reason TEXT NOT NULL,
      status ENUM('pending', 'reviewed', 'dismissed', 'action_taken') NOT NULL DEFAULT 'pending',
      admin_notes TEXT DEFAULT NULL,
      reviewed_by INT DEFAULT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id_report),
      KEY idx_reports_status (status),
      KEY idx_reports_property (id_property),
      KEY idx_reports_reporter (reporter_id),
      KEY idx_reports_reported_user (reported_user_id),
      CONSTRAINT reports_reporter_fk FOREIGN KEY (reporter_id) REFERENCES users (id_user) ON DELETE CASCADE,
      CONSTRAINT reports_reported_user_fk FOREIGN KEY (reported_user_id) REFERENCES users (id_user) ON DELETE SET NULL,
      CONSTRAINT reports_property_fk FOREIGN KEY (id_property) REFERENCES properties (id_property) ON DELETE SET NULL,
      CONSTRAINT reports_booking_fk FOREIGN KEY (id_booking) REFERENCES bookings (id_booking) ON DELETE SET NULL,
      CONSTRAINT reports_reviewer_fk FOREIGN KEY (reviewed_by) REFERENCES users (id_user) ON DELETE SET NULL
    )
  `);

  moderationSchemaReady = true;
};

let notificationsSchemaReady = false;

const ensureNotificationsSchema = async () => {
  if (notificationsSchemaReady) return;

  const [notificationColumns] = await db.query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'notifications'
      AND COLUMN_NAME IN ('is_read', 'type', 'created_at', 'id_booking')
    `,
  );

  const existingNotificationColumns = new Set(
    notificationColumns.map((column) => column.COLUMN_NAME),
  );

  if (!existingNotificationColumns.has("is_read")) {
    await db.query(
      "ALTER TABLE notifications ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0",
    );
  }

  if (!existingNotificationColumns.has("type")) {
    await db.query(
      "ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT NULL",
    );
  }

  if (!existingNotificationColumns.has("created_at")) {
    await db.query(
      "ALTER TABLE notifications ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
    );
  }

  if (!existingNotificationColumns.has("id_booking")) {
    await db.query(
      "ALTER TABLE notifications ADD COLUMN id_booking INT DEFAULT NULL",
    );
    await db.query(
      "ALTER TABLE notifications ADD CONSTRAINT notifications_booking_fk FOREIGN KEY (id_booking) REFERENCES bookings (id_booking) ON DELETE SET NULL",
    );
  }

  notificationsSchemaReady = true;
};

let reviewsSchemaReady = false;

const ensureReviewsSchema = async () => {
  if (reviewsSchemaReady) return;

  try {
    const [indexes] = await db.query(
      `SELECT INDEX_NAME
       FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'reviews'
         AND INDEX_NAME = 'uq_reviews_booking_user'
       LIMIT 1`,
    );

    if (indexes.length === 0) {
      // Remove any existing duplicates before adding the constraint
      await db.query(
        `DELETE r1 FROM reviews r1
         INNER JOIN reviews r2
         ON r1.id_booking = r2.id_booking
           AND r1.id_user = r2.id_user
           AND r1.id_review > r2.id_review`,
      );

      await db.query(
        `ALTER TABLE reviews ADD UNIQUE INDEX uq_reviews_booking_user (id_booking, id_user)`,
      );
    }

    reviewsSchemaReady = true;
  } catch (schemaErr) {
    console.error("Failed to migrate reviews schema:", schemaErr.message);
  }
};

let bookingsSchemaReady = false;

const ensureBookingsSchema = async () => {
  if (bookingsSchemaReady) return;

  try {
    const [bookingColumns] = await db.query(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'bookings'
        AND COLUMN_NAME IN ('guest_full_name', 'guest_id_number', 'guest_phone', 'agreed_to_terms')
      `,
    );

    const existingBookingColumns = new Set(
      bookingColumns.map((col) => col.COLUMN_NAME),
    );

    if (!existingBookingColumns.has("guest_full_name")) {
      await db.query(
        "ALTER TABLE bookings ADD COLUMN guest_full_name VARCHAR(150) DEFAULT NULL",
      );
    }
    if (!existingBookingColumns.has("guest_id_number")) {
      await db.query(
        "ALTER TABLE bookings ADD COLUMN guest_id_number VARCHAR(50) DEFAULT NULL",
      );
    }
    if (!existingBookingColumns.has("guest_phone")) {
      await db.query(
        "ALTER TABLE bookings ADD COLUMN guest_phone VARCHAR(30) DEFAULT NULL",
      );
    }
    if (!existingBookingColumns.has("agreed_to_terms")) {
      await db.query(
        "ALTER TABLE bookings ADD COLUMN agreed_to_terms TINYINT(1) NOT NULL DEFAULT 0",
      );
    }

    // Migrate bookings.status ENUM to include 'cancelled'
    const [bookingStatusCols] = await db.query(
      `SELECT COLUMN_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'bookings'
         AND COLUMN_NAME = 'status'
       LIMIT 1`,
    );

    const bookingStatusType = bookingStatusCols[0]?.COLUMN_TYPE || "";

    if (
      bookingStatusType.includes("enum") &&
      !bookingStatusType.includes("'cancelled'")
    ) {
      await db.query(
        "ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending'",
      );
    }

    bookingsSchemaReady = true;
  } catch (schemaErr) {
    console.error("Failed to migrate bookings schema:", schemaErr.message);
  }
};

const BOOKING_LOCK_TTL_MS = 15 * 60 * 1000; // 15 minutes

let bookingLocksSchemaReady = false;

const ensureBookingLocksSchema = async () => {
  if (bookingLocksSchemaReady) return;

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS booking_locks (
        id_lock INT NOT NULL AUTO_INCREMENT,
        id_property INT NOT NULL,
        id_user INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_lock),
        KEY idx_locks_property (id_property),
        KEY idx_locks_expires (expires_at),
        CONSTRAINT booking_locks_property_fk FOREIGN KEY (id_property) REFERENCES properties (id_property) ON DELETE CASCADE,
        CONSTRAINT booking_locks_user_fk FOREIGN KEY (id_user) REFERENCES users (id_user) ON DELETE CASCADE
      )
    `);

    bookingLocksSchemaReady = true;
  } catch (schemaErr) {
    console.error("Failed to create booking_locks table:", schemaErr.message);
  }
};

const sendAdminReportEmail = async (report) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  if (!adminEmail || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  await transporter.sendMail({
    from: `"Dar Darek Moderation" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: "New Dar Darek report needs review",
    html: `
      <h2>New report submitted</h2>
      <p><strong>Category:</strong> ${escapeHtml(report.category)}</p>
      <p><strong>Property:</strong> ${escapeHtml(report.propertyId || "N/A")}</p>
      <p><strong>Reporter:</strong> ${escapeHtml(report.reporterId)}</p>
      <p>${escapeHtml(report.reason)}</p>
      <p>Open the admin dashboard to review and take action.</p>
    `,
  });
};

const sendSuspensionEmail = async (email, name, reason) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !email) {
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const escapeHtml = (value) =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    await transporter.sendMail({
      from: `"Dar Darek Moderation" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Notice of Account Suspension",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #d32f2f;">Account Suspended</h2>
          <p>Dear ${escapeHtml(name)},</p>
          <p>Your Dar Darek account has been suspended by our moderation team for the following reason:</p>
          <div style="background-color: #f8d7da; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #721c24;"><em>"${escapeHtml(reason)}"</em></p>
          </div>
          <p>If you believe this is an error or wish to appeal this decision, please contact support.</p>
          <br/>
          <p>Regards,<br/>Dar Darek Moderation Team</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send suspension email:", err.message);
  }
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided" });
  }

  try {
    await ensureModerationSchema();
    await ensureNotificationsSchema();
    await ensureBookingsSchema();
    await ensureReviewsSchema();
    await ensureBookingLocksSchema();

    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key",
    );

    const userId = Number(verified?.id || verified?.id_user);
    if (!Number.isFinite(userId) || userId <= 0) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const [users] = await db.query(
      `SELECT id_user, name, email, role, is_active, is_suspended
       FROM users
       WHERE id_user = ?
       LIMIT 1`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Authenticated user not found." });
    }

    const currentUser = users[0];
    if (Number(currentUser.is_active) !== 1) {
      return res.status(403).json({ message: "This account is deactivated." });
    }

    if (Number(currentUser.is_suspended) === 1) {
      return res.status(403).json({ message: "This account is suspended." });
    }

    req.user = {
      ...verified,
      id: currentUser.id_user,
      id_user: currentUser.id_user,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
    };
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(403).json({ message: "Invalid or Expired Token" });
    }

    return res.status(500).json({
      message: "Could not verify your session.",
      details: error.message,
    });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  next();
};

const getOptionalAuthenticatedUser = async (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return null;

  try {
    await ensureModerationSchema();
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key",
    );
    const userId = Number(verified?.id || verified?.id_user);

    if (!Number.isFinite(userId) || userId <= 0) return null;

    const [users] = await db.query(
      `SELECT id_user, name, email, role, is_active, is_suspended
       FROM users
       WHERE id_user = ?
       LIMIT 1`,
      [userId],
    );

    const currentUser = users[0];
    if (
      !currentUser ||
      Number(currentUser.is_active) !== 1 ||
      Number(currentUser.is_suspended) === 1
    ) {
      return null;
    }

    return currentUser;
  } catch {
    return null;
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

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG, WEBP, or GIF images are allowed."), false);
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
   USER ACCOUNT ROUTES
========================= */

app.post('/api/verifyHostMode', async (req, res) => {
  const { id } = req.body;
  try {
    const [rows] = await db.query("SELECT role FROM users WHERE id_user=?", [id]);
    if (rows.length === 0) {
      res.status(404).json({ message: "No user found" });
      return;
    }

    if (rows[0].role !== "host" && rows[0].role !== "admin") {
      res.status(400).json({ message: "You have to enable host mode" });
      return;
    }

    res.status(200).json({ message: "go ahead" });
  } catch (error) {
    console.error("Error verifying host mode:", error);
    res.status(500).json({ message: "An error occured" });
  }
});


const USER_ACCOUNT_FIELDS = `
  id_user,
  name,
  email,
  email_verified,
  phone_number,
  phone_verified,
  role,
  profile_picture,
  bio,
  nationality,
  languages,
  preferred_contact,
  emergency_contact,
  preferred_language,
  preferred_currency,
  preferred_city,
  preferred_stay_type,
  billing_name,
  billing_address,
  billing_city,
  billing_postal_code,
  billing_country,
  date_of_birth,
  is_active,
  password IS NOT NULL AS has_password
`;

const ACCOUNT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCOUNT_PHONE_ALLOWED_REGEX = /^[\d\s()+-]+$/;
const ACCOUNT_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
const VERIFICATION_CODE_COOLDOWN_MS = 60 * 1000;
const ACCOUNT_LANGUAGE_OPTIONS = new Set([
  "Arabic",
  "French",
  "English",
  "Spanish",
  "Italian",
  "German",
  "Dutch",
  "Portuguese",
  "Turkish",
  "Amazigh",
]);
const ACCOUNT_CONTACT_OPTIONS = new Set(["Email", "SMS", "Push notification"]);
const ACCOUNT_PREFERENCE_LANGUAGE_OPTIONS = new Set([
  "English",
  "French",
  "Arabic",
  "Spanish",
  "German",
  "Italian",
  "Dutch",
  "Portuguese",
  "Turkish",
  "Amazigh",
]);
const ACCOUNT_CURRENCY_OPTIONS = new Set([
  "MAD",
  "EUR",
  "USD",
  "GBP",
  "CAD",
  "AED",
  "SAR",
]);
const ACCOUNT_CITY_OPTIONS = new Set([
  "Ajdir",
  "Al Hoceima",
  "Asilah",
  "Belyounech",
  "Bni Bouayach",
  "Cabo Negro",
  "Chefchaouen",
  "Fnideq",
  "Imzouren",
  "Ksar El Kebir",
  "Larache",
  "Martil",
  "M'diq",
  "Oued Laou",
  "Ouazzane",
  "Tangier",
  "Targuist",
  "Tetouan",
]);
const ACCOUNT_STAY_TYPE_OPTIONS = new Set([
  "Appartement",
  "Studio",
  "Maison",
  "Villa",
  "Riad",
  "Maison d'hôtes",
  "Traditional House",
  "Cabin / Chalet",
]);

const cleanText = (value, maxLength = 255) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const trimmedValue = String(value).trim();
  return trimmedValue ? trimmedValue.slice(0, maxLength) : null;
};

const normalizePhoneForUsersTable = (value) => {
  const cleanedValue = cleanText(value, 30);
  if (!cleanedValue) return cleanedValue;
  const digitsOnly = cleanedValue.replace(/\D/g, "");

  if (cleanedValue.startsWith("+212") && /^2126\d{8}$/.test(digitsOnly)) {
    return `+${digitsOnly}`;
  }

  if (/^2126\d{8}$/.test(digitsOnly)) {
    return `+${digitsOnly}`;
  }

  if (/^06\d{8}$/.test(digitsOnly)) {
    return `+212${digitsOnly.slice(1)}`;
  }

  if (/^6\d{8}$/.test(digitsOnly)) {
    return `+212${digitsOnly}`;
  }

  const hasLeadingPlus = cleanedValue.trim().startsWith("+");
  return `${hasLeadingPlus ? "+" : ""}${digitsOnly}`;
};

const isValidPhoneValue = (value) => {
  if (!value) return true;
  return (
    ACCOUNT_PHONE_ALLOWED_REGEX.test(value) &&
    value.replace(/\D/g, "").length >= 7 &&
    value.replace(/\D/g, "").length <= 15
  );
};

const isValidDateValue = (value) => {
  if (!value) return true;
  if (!ACCOUNT_DATE_REGEX.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const getAgeFromDateValue = (value) => {
  if (!value || !isValidDateValue(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
  if (today < birthdayThisYear) age -= 1;
  return age;
};

const normalizeDateForResponse = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value).split("T")[0];
};

const normalizeLanguages = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  let languageList = value;
  if (typeof value === "string") {
    try {
      const parsedValue = JSON.parse(value);
      languageList = Array.isArray(parsedValue) ? parsedValue : [value];
    } catch {
      languageList = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  if (!Array.isArray(languageList)) {
    return null;
  }

  const cleanedLanguages = languageList
    .map((language) => cleanText(language, 50))
    .filter(Boolean)
    .filter(
      (language, index, list) =>
        list.findIndex(
          (item) => item.toLowerCase() === language.toLowerCase(),
        ) === index,
    );

  return JSON.stringify(cleanedLanguages);
};

const validateAccountLanguages = (value) => {
  const normalizedValue = normalizeLanguages(value);
  if (!normalizedValue) return true;

  try {
    const parsedLanguages = JSON.parse(normalizedValue);
    return parsedLanguages.every((language) =>
      ACCOUNT_LANGUAGE_OPTIONS.has(language),
    );
  } catch {
    return false;
  }
};

const createVerificationCode = () =>
  crypto.randomInt(100000, 1000000).toString();

const hashVerificationCode = (code, userId, type, target) =>
  crypto
    .createHash("sha256")
    .update(
      [
        code,
        userId,
        type,
        String(target || "").toLowerCase(),
        process.env.JWT_SECRET || "your_secret_key",
      ].join(":"),
    )
    .digest("hex");

const isVerificationHashMatch = (storedHash, incomingHash) => {
  if (!storedHash || !incomingHash) return false;

  const storedBuffer = Buffer.from(String(storedHash), "hex");
  const incomingBuffer = Buffer.from(String(incomingHash), "hex");

  return (
    storedBuffer.length === incomingBuffer.length &&
    crypto.timingSafeEqual(storedBuffer, incomingBuffer)
  );
};

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email delivery is not configured.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmailVerificationCode = async ({ email, name, code }) => {
  const transporter = getEmailTransporter();

  await transporter.sendMail({
    from: `"Dar Darek Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your DarDarek email verification code",
    html: `
      <h1>DarDarek</h1>
      <p>Hello ${escapeHtml(cleanText(name, 80) || "there")},</p>
      <p>Your email verification code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;">${code}</p>
      <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
    `,
  });
};

const sendSmsVerificationCode = async ({ phone, code }) => {
  console.info(
    `[DarDarek demo SMS] Verification code for ${phone}: ${code} (expires in 10 minutes)`,
  );
};

const canSendVerificationCode = (sentAt) => {
  if (!sentAt) return true;
  return (
    Date.now() - new Date(sentAt).getTime() >= VERIFICATION_CODE_COOLDOWN_MS
  );
};

const sendSafeUser = (res, user) => {
  const safeUser = {
    ...user,
    date_of_birth: normalizeDateForResponse(user.date_of_birth),
    has_password: Boolean(user.has_password),
    email_verified: Boolean(user.email_verified),
    phone_verified: Boolean(user.phone_verified),
  };

  return res.status(200).json({ user: safeUser });
};

const getUserIdFromRequest = (req) => {
  const userId = Number(req.user?.id || req.user?.id_user || req.user?.userId);
  return Number.isFinite(userId) && userId > 0 ? userId : null;
};

const getSafeUserById = async (userId) => {
  const [rows] = await db.query(
    `SELECT ${USER_ACCOUNT_FIELDS} FROM users WHERE id_user = ? LIMIT 1`,
    [userId],
  );

  return rows[0] || null;
};

const updateUserFields = async (userId, fieldMap) => {
  const entries = Object.entries(fieldMap).filter(
    ([, value]) => value !== undefined,
  );

  if (entries.length === 0) {
    return null;
  }

  const assignments = entries.map(([field]) => `${field} = ?`).join(", ");
  const values = entries.map(([, value]) => value);

  await db.execute(`UPDATE users SET ${assignments} WHERE id_user = ?`, [
    ...values,
    userId,
  ]);

  return getSafeUserById(userId);
};

app.get("/api/users/me", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const user = await getSafeUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return sendSafeUser(res, user);
  } catch (error) {
    return res.status(500).json({
      message: "Could not load account settings.",
      details: error.message,
    });
  }
});

app.put("/api/users/profile", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const {
      name,
      phone_number,
      bio,
      nationality,
      languages,
      preferred_contact,
      emergency_contact,
      date_of_birth,
    } = req.body;

    const nextName = cleanText(name, 100);
    if (name !== undefined && (!nextName || nextName.length < 5)) {
      return res
        .status(400)
        .json({ message: "Name must be at least 5 characters." });
    }

    const nextPhoneNumber = normalizePhoneForUsersTable(phone_number);
    if (phone_number !== undefined && !isValidPhoneValue(phone_number)) {
      return res.status(400).json({
        message: "Phone number can only contain numbers and phone symbols.",
      });
    }

    const nextEmergencyContact = cleanText(emergency_contact, 50);
    if (
      emergency_contact !== undefined &&
      !isValidPhoneValue(nextEmergencyContact)
    ) {
      return res.status(400).json({
        message:
          "Emergency contact can only contain numbers and phone symbols.",
      });
    }

    if (languages !== undefined && !validateAccountLanguages(languages)) {
      return res.status(400).json({
        message: "Choose languages from the supported language list.",
      });
    }

    const nextPreferredContact = cleanText(preferred_contact, 50);
    if (
      preferred_contact !== undefined &&
      nextPreferredContact &&
      !ACCOUNT_CONTACT_OPTIONS.has(nextPreferredContact)
    ) {
      return res.status(400).json({
        message: "Choose a valid preferred contact method.",
      });
    }

    const nextDateOfBirth = cleanText(date_of_birth, 10);
    if (date_of_birth !== undefined && !isValidDateValue(nextDateOfBirth)) {
      return res
        .status(400)
        .json({ message: "Date of birth must use YYYY-MM-DD." });
    }
    if (
      date_of_birth !== undefined &&
      nextDateOfBirth &&
      getAgeFromDateValue(nextDateOfBirth) < 18
    ) {
      return res
        .status(400)
        .json({ message: "You must be at least 18 years old." });
    }

    let phoneVerificationReset = {};
    if (phone_number !== undefined) {
      const [currentUsers] = await db.query(
        "SELECT phone_number FROM users WHERE id_user = ? LIMIT 1",
        [userId],
      );
      const currentPhoneNumber = currentUsers[0]?.phone_number || null;

      if ((currentPhoneNumber || null) !== (nextPhoneNumber || null)) {
        phoneVerificationReset = {
          phone_verified: 0,
          phone_verification_code_hash: null,
          phone_verification_expires_at: null,
          phone_verification_sent_at: null,
        };
      }
    }

    const user = await updateUserFields(userId, {
      name: nextName,
      phone_number: nextPhoneNumber,
      ...phoneVerificationReset,
      bio: cleanText(bio, 250),
      nationality: cleanText(nationality, 100),
      languages: normalizeLanguages(languages),
      preferred_contact: nextPreferredContact,
      emergency_contact: nextEmergencyContact,
      date_of_birth: nextDateOfBirth,
    });

    if (!user) {
      return res.status(400).json({ message: "No profile fields provided." });
    }

    return sendSafeUser(res, user);
  } catch (error) {
    return res.status(500).json({
      message: "Could not update profile.",
      details: error.message,
    });
  }
});

app.put("/api/users/email", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const email = cleanText(req.body.email, 255)?.toLowerCase();
    if (!email || !ACCOUNT_EMAIL_REGEX.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    const [existingUsers] = await db.query(
      "SELECT id_user FROM users WHERE email = ? AND id_user != ? LIMIT 1",
      [email, userId],
    );

    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const [currentUsers] = await db.query(
      `SELECT name, email, pending_email_verification_sent_at
       FROM users
       WHERE id_user = ?
       LIMIT 1`,
      [userId],
    );

    const currentUser = currentUsers[0];
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if ((currentUser.email || "").toLowerCase() === email) {
      return res
        .status(400)
        .json({ message: "Enter a different email address to verify." });
    }

    if (
      !canSendVerificationCode(currentUser.pending_email_verification_sent_at)
    ) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another email code.",
      });
    }

    const code = createVerificationCode();
    const codeHash = hashVerificationCode(code, userId, "pending-email", email);
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

    try {
      await sendEmailVerificationCode({
        email,
        name: currentUser.name,
        code,
      });
    } catch (emailError) {
      return res.status(502).json({
        message:
          "Could not send verification code to the new email. Check EMAIL_USER and EMAIL_PASS, then try again.",
        details: emailError.message,
      });
    }

    await db.execute(
      `UPDATE users
       SET pending_email = ?,
           pending_email_verification_code_hash = ?,
           pending_email_verification_expires_at = ?,
           pending_email_verification_sent_at = NOW()
       WHERE id_user = ?`,
      [email, codeHash, expiresAt, userId],
    );

    return res.status(200).json({
      message: "Verification code sent to your new email.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not start email verification.",
      details: error.message,
    });
  }
});

app.post("/api/users/email/verify-change", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const code = cleanText(req.body.code, 6);
    if (!/^\d{6}$/.test(code || "")) {
      return res.status(400).json({ message: "Enter the 6-digit email code." });
    }

    const [rows] = await db.query(
      `SELECT pending_email,
              pending_email_verification_code_hash,
              pending_email_verification_expires_at
       FROM users
       WHERE id_user = ?
       LIMIT 1`,
      [userId],
    );

    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const pendingEmail = cleanText(user.pending_email, 255)?.toLowerCase();
    if (!pendingEmail || !ACCOUNT_EMAIL_REGEX.test(pendingEmail)) {
      return res
        .status(400)
        .json({ message: "Send a verification code to a new email first." });
    }

    if (!user.pending_email_verification_code_hash) {
      return res
        .status(400)
        .json({ message: "Send a new email verification code first." });
    }

    if (
      !user.pending_email_verification_expires_at ||
      new Date(user.pending_email_verification_expires_at).getTime() <
      Date.now()
    ) {
      return res.status(410).json({
        message: "Code expired. Please request a new email verification code.",
      });
    }

    const incomingHash = hashVerificationCode(
      code,
      userId,
      "pending-email",
      pendingEmail,
    );
    if (
      !isVerificationHashMatch(
        user.pending_email_verification_code_hash,
        incomingHash,
      )
    ) {
      return res.status(400).json({ message: "Invalid code." });
    }

    const [existingUsers] = await db.query(
      "SELECT id_user FROM users WHERE email = ? AND id_user != ? LIMIT 1",
      [pendingEmail, userId],
    );

    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    await db.execute(
      `UPDATE users
       SET email = ?,
           email_verified = 1,
           email_verification_code_hash = NULL,
           email_verification_expires_at = NULL,
           email_verification_sent_at = NULL,
           pending_email = NULL,
           pending_email_verification_code_hash = NULL,
           pending_email_verification_expires_at = NULL,
           pending_email_verification_sent_at = NULL
       WHERE id_user = ?`,
      [pendingEmail, userId],
    );

    const verifiedUser = await getSafeUserById(userId);
    return sendSafeUser(res, verifiedUser);
  } catch (error) {
    return res.status(500).json({
      message: "Could not verify the new email.",
      details: error.message,
    });
  }
});

app.post(
  "/api/users/email/send-verification",
  verifyToken,
  async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Invalid authenticated user." });
      }

      const [rows] = await db.query(
        `SELECT name, email, email_verified, email_verification_sent_at
       FROM users
       WHERE id_user = ?
       LIMIT 1`,
        [userId],
      );

      const user = rows[0];
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (!user.email || !ACCOUNT_EMAIL_REGEX.test(user.email)) {
        return res
          .status(400)
          .json({ message: "Add a valid email address before verifying it." });
      }

      if (Number(user.email_verified) === 1) {
        return res.status(400).json({ message: "Email is already verified." });
      }

      if (!canSendVerificationCode(user.email_verification_sent_at)) {
        return res.status(429).json({
          message: "Please wait a minute before requesting another email code.",
        });
      }

      const code = createVerificationCode();
      const codeHash = hashVerificationCode(code, userId, "email", user.email);
      const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

      await sendEmailVerificationCode({
        email: user.email,
        name: user.name,
        code,
      });

      await db.execute(
        `UPDATE users
       SET email_verification_code_hash = ?,
           email_verification_expires_at = ?,
           email_verification_sent_at = NOW()
       WHERE id_user = ?`,
        [codeHash, expiresAt, userId],
      );

      return res.status(200).json({
        message: "Email verification code sent. It expires in 10 minutes.",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Could not send email verification code.",
      });
    }
  },
);

app.post("/api/users/email/verify", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const code = cleanText(req.body.code, 6);
    if (!/^\d{6}$/.test(code || "")) {
      return res.status(400).json({ message: "Enter the 6-digit email code." });
    }

    const [rows] = await db.query(
      `SELECT email, email_verification_code_hash, email_verification_expires_at
       FROM users
       WHERE id_user = ?
       LIMIT 1`,
      [userId],
    );

    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.email) {
      return res
        .status(400)
        .json({ message: "Add an email address before verifying it." });
    }

    if (!user.email_verification_code_hash) {
      return res
        .status(400)
        .json({ message: "Send a new email verification code first." });
    }

    if (
      !user.email_verification_expires_at ||
      new Date(user.email_verification_expires_at).getTime() < Date.now()
    ) {
      return res.status(410).json({
        message: "Email verification code expired. Send a new code.",
      });
    }

    const incomingHash = hashVerificationCode(
      code,
      userId,
      "email",
      user.email,
    );
    if (
      !isVerificationHashMatch(user.email_verification_code_hash, incomingHash)
    ) {
      return res
        .status(400)
        .json({ message: "Email verification code is wrong." });
    }

    await db.execute(
      `UPDATE users
       SET email_verified = 1,
           email_verification_code_hash = NULL,
           email_verification_expires_at = NULL
       WHERE id_user = ?`,
      [userId],
    );

    const verifiedUser = await getSafeUserById(userId);
    return sendSafeUser(res, verifiedUser);
  } catch (error) {
    return res.status(500).json({
      message: "Could not verify email code.",
      details: error.message,
    });
  }
});

app.post(
  "/api/users/phone/send-verification",
  verifyToken,
  async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Invalid authenticated user." });
      }

      const [rows] = await db.query(
        `SELECT phone_number, phone_verified, phone_verification_sent_at
       FROM users
       WHERE id_user = ?
       LIMIT 1`,
        [userId],
      );

      const user = rows[0];
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const normalizedPhoneNumber = normalizePhoneForUsersTable(
        user.phone_number,
      );

      if (!normalizedPhoneNumber || !isValidPhoneValue(normalizedPhoneNumber)) {
        return res
          .status(400)
          .json({ message: "Add a valid phone number before verifying it." });
      }

      if (Number(user.phone_verified) === 1) {
        return res
          .status(400)
          .json({ message: "Phone number is already verified." });
      }

      if (!canSendVerificationCode(user.phone_verification_sent_at)) {
        return res.status(429).json({
          message: "Please wait a minute before requesting another SMS code.",
        });
      }

      const code = createVerificationCode();
      const codeHash = hashVerificationCode(
        code,
        userId,
        "phone",
        normalizedPhoneNumber,
      );
      const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

      await sendSmsVerificationCode({ phone: normalizedPhoneNumber, code });

      await db.execute(
        `UPDATE users
       SET phone_verification_code_hash = ?,
           phone_verification_expires_at = ?,
           phone_verification_sent_at = NOW(),
           phone_number = ?
       WHERE id_user = ?`,
        [codeHash, expiresAt, normalizedPhoneNumber, userId],
      );

      return res.status(200).json({
        message: "SMS verification code sent. It expires in 10 minutes.",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Could not send SMS verification code.",
      });
    }
  },
);

app.post("/api/users/phone/verify", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const code = cleanText(req.body.code, 6);
    if (!/^\d{6}$/.test(code || "")) {
      return res.status(400).json({ message: "Enter the 6-digit SMS code." });
    }

    const [rows] = await db.query(
      `SELECT phone_number, phone_verification_code_hash, phone_verification_expires_at
       FROM users
       WHERE id_user = ?
       LIMIT 1`,
      [userId],
    );

    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.phone_number) {
      return res
        .status(400)
        .json({ message: "Add a phone number before verifying it." });
    }

    if (!user.phone_verification_code_hash) {
      return res
        .status(400)
        .json({ message: "Send a new SMS verification code first." });
    }

    if (
      !user.phone_verification_expires_at ||
      new Date(user.phone_verification_expires_at).getTime() < Date.now()
    ) {
      return res.status(410).json({
        message: "SMS verification code expired. Send a new code.",
      });
    }

    const incomingHash = hashVerificationCode(
      code,
      userId,
      "phone",
      user.phone_number,
    );
    if (
      !isVerificationHashMatch(user.phone_verification_code_hash, incomingHash)
    ) {
      return res
        .status(400)
        .json({ message: "SMS verification code is wrong." });
    }

    await db.execute(
      `UPDATE users
       SET phone_verified = 1,
           phone_verification_code_hash = NULL,
           phone_verification_expires_at = NULL
       WHERE id_user = ?`,
      [userId],
    );

    const verifiedUser = await getSafeUserById(userId);
    return sendSafeUser(res, verifiedUser);
  } catch (error) {
    return res.status(500).json({
      message: "Could not verify SMS code.",
      details: error.message,
    });
  }
});

app.put(
  "/api/users/profile-picture",
  verifyToken,
  upload.single("profile_picture"),
  async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Invalid authenticated user." });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Profile picture is required." });
      }

      if (!req.file.mimetype.startsWith("image/")) {
        fs.unlink(req.file.path, () => { });
        return res
          .status(400)
          .json({ message: "Only image files are allowed." });
      }

      const profilePicture = `/uploads/${req.file.filename}`;
      const user = await updateUserFields(userId, {
        profile_picture: profilePicture,
      });

      return sendSafeUser(res, user);
    } catch (error) {
      return res.status(500).json({
        message: "Could not update profile picture.",
        details: error.message,
      });
    }
  },
);

app.put("/api/users/preferences", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const preferredLanguage = cleanText(req.body.preferred_language, 50);
    const preferredCurrency = cleanText(req.body.preferred_currency, 10);
    const preferredCity = cleanText(req.body.preferred_city, 100);
    const preferredStayType = cleanText(req.body.preferred_stay_type, 100);

    if (
      preferredLanguage &&
      !ACCOUNT_PREFERENCE_LANGUAGE_OPTIONS.has(preferredLanguage)
    ) {
      return res.status(400).json({
        message: "Choose a valid preferred language.",
      });
    }

    if (preferredCurrency && !ACCOUNT_CURRENCY_OPTIONS.has(preferredCurrency)) {
      return res.status(400).json({
        message: "Choose a valid preferred currency.",
      });
    }

    if (preferredCity && !ACCOUNT_CITY_OPTIONS.has(preferredCity)) {
      return res.status(400).json({
        message: "Choose a valid Northern Morocco city.",
      });
    }

    if (
      preferredStayType &&
      !ACCOUNT_STAY_TYPE_OPTIONS.has(preferredStayType)
    ) {
      return res.status(400).json({
        message: "Choose a valid preferred stay type.",
      });
    }

    const user = await updateUserFields(userId, {
      preferred_language: preferredLanguage,
      preferred_currency: preferredCurrency,
      preferred_city: preferredCity,
      preferred_stay_type: preferredStayType,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "No preference fields provided." });
    }

    return sendSafeUser(res, user);
  } catch (error) {
    return res.status(500).json({
      message: "Could not update preferences.",
      details: error.message,
    });
  }
});

app.put("/api/users/deactivate", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    await db.execute("UPDATE users SET is_active = 0 WHERE id_user = ?", [
      userId,
    ]);

    return res.status(200).json({
      message: "Account deactivated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not deactivate account.",
      details: error.message,
    });
  }
});

app.put("/api/users/billing", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const user = await updateUserFields(userId, {
      billing_name: cleanText(req.body.billing_name, 150),
      billing_address: cleanText(req.body.billing_address, 255),
      billing_city: cleanText(req.body.billing_city, 100),
      billing_postal_code: cleanText(req.body.billing_postal_code, 30),
      billing_country: cleanText(req.body.billing_country, 100),
    });

    if (!user) {
      return res.status(400).json({ message: "No billing fields provided." });
    }

    return sendSafeUser(res, user);
  } catch (error) {
    return res.status(500).json({
      message: "Could not update billing information.",
      details: error.message,
    });
  }
});

app.put("/api/users/change-password", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const currentPassword =
      typeof req.body.currentPassword === "string"
        ? req.body.currentPassword
        : "";
    const newPassword =
      typeof req.body.newPassword === "string" ? req.body.newPassword : "";

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required." });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const [rows] = await db.query(
      "SELECT password FROM users WHERE id_user = ? LIMIT 1",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!rows[0].password) {
      return res.status(400).json({
        message: "Password login is not enabled for this account.",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      rows[0].password,
    );

    if (!isCurrentPasswordValid) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE users SET password = ? WHERE id_user = ?", [
      hashedPassword,
      userId,
    ]);

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({
      message: "Could not update password.",
      details: error.message,
    });
  }
});

app.put("/api/users/create-password", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const newPassword =
      typeof req.body.newPassword === "string" ? req.body.newPassword : "";

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const [rows] = await db.query(
      "SELECT password FROM users WHERE id_user = ? LIMIT 1",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    if (rows[0].password) {
      return res
        .status(409)
        .json({ message: "Password login is already enabled." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password = ?, is_active = 1 WHERE id_user = ? AND password IS NULL",
      [hashedPassword, userId],
    );

    return res.status(200).json({
      message: "Password login enabled for this account.",
      has_password: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not create password.",
      details: error.message,
    });
  }
});

app.put("/api/users/become-host", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const [rows] = await db.query(
      "SELECT role FROM users WHERE id_user = ? LIMIT 1",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentRole = rows[0].role;
    const nextRole = currentRole === "admin" ? "admin" : "host";

    if (currentRole !== nextRole) {
      await db.execute("UPDATE users SET role = ? WHERE id_user = ?", [
        nextRole,
        userId,
      ]);
    }

    return res.status(200).json({ role: nextRole });
  } catch (error) {
    return res.status(500).json({
      message: "Could not enable host mode.",
      details: error.message,
    });
  }
});

app.put("/api/users/deactivate-host", verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const [rows] = await db.query(
      "SELECT role FROM users WHERE id_user = ? LIMIT 1",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentRole = rows[0].role;
    const nextRole = currentRole === "admin" ? "admin" : "user";

    if (currentRole !== nextRole) {
      await db.execute("UPDATE users SET role = ? WHERE id_user = ?", [
        nextRole,
        userId,
      ]);
    }

    return res.status(200).json({ role: nextRole });
  } catch (error) {
    return res.status(500).json({
      message: "Could not deactivate host mode.",
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
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const user = rows[0];

    const oneTimeActivationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const resettingUrl = `${FRONTEND_URL}/Authentication/reset-password?token=${oneTimeActivationToken}`;

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

    const activationUrl = `${BACKEND_URL}/api/activate-account?token=${oneTimeActivationToken}`;

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
      "UPDATE users SET is_active = 1, email_verified = 1 WHERE email = ?",
      [email],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("User not found.");
    }

    res.redirect(`${FRONTEND_URL}/Authentication`);
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
    await ensureModerationSchema();

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
        message: "This account is deactivated.",
        canReactivate: true,
        email: user.email,
      });
    }

    if (Number(user.is_suspended) === 1) {
      return res.status(403).json({
        message: "This account is suspended. Please contact Dar Darek support.",
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

app.post("/api/reactivate-account", async (req, res) => {
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

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [cleanEmail],
    );

    if (rows.length === 0 || !rows[0].password) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(safePassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Email or password is incorrect.",
      });
    }

    if (user.is_active !== 0) {
      return res.status(200).json({
        message: "This account is already active.",
      });
    }

    await db.execute("UPDATE users SET is_active = 1 WHERE id_user = ?", [
      user.id_user,
    ]);

    return res.status(200).json({
      message: "Account reactivated successfully. You can sign in now.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not reactivate account.",
      details: error.message,
    });
  }
});

app.post("/api/google-auth", async (req, res) => {
  const { idToken } = req.body;

  try {
    await ensureModerationSchema();
    const jwtSecret = process.env.JWT_SECRET || "your_secret_key";

    if (!idToken) {
      return res.status(400).json({
        message: "Google ID token is required.",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, email_verified: emailVerified } = payload || {};

    if (!email) {
      return res.status(400).json({
        message: "Google account email is missing.",
      });
    }

    if (emailVerified === false) {
      return res.status(403).json({
        message: "Please use a verified Google account.",
      });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    let user;

    if (rows.length === 0) {
      const [result] = await db.execute(
        "INSERT INTO users (name, email, role, is_active) VALUES (?, ?, 'user', 1)",
        [name, email],
      );

      user = {
        id: result.insertId,
        name,
        email,
        role: "user",
        is_active: 1,
        is_suspended: 0,
      };
    } else {
      user = rows[0];
      user["id"] = user["id_user"];
    }

    if (Number(user.is_active) !== 1) {
      return res.status(401).json({
        message: "This account is deactivated.",
      });
    }

    if (Number(user.is_suspended) === 1) {
      return res.status(403).json({
        message: "This account is suspended. Please contact Dar Darek support.",
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      jwtSecret,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Google authentication successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google authentication failed:", error);
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

const normalizeDateOnly = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split("T")[0];
  }

  return String(value).split("T")[0];
};

const normalizeTimeOnly = (value) => {
  if (!value) return null;
  return String(value).split(".")[0].slice(0, 5);
};

const isSafeDateValue = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value));

const isDraftRequest = (value) => String(value || "").toLowerCase() === "true";

const getPublishCityId = async (city, allowFallback = false) => {
  const cleanCity = cleanText(city, 120);

  if (cleanCity) {
    const [cities] = await db.query(
      "SELECT id_city FROM cities WHERE name = ? LIMIT 1",
      [cleanCity],
    );

    if (cities.length > 0) {
      return cities[0].id_city;
    }
  }

  if (!allowFallback) {
    return null;
  }

  const [fallbackCities] = await db.query(
    "SELECT id_city FROM cities ORDER BY id_city ASC LIMIT 1",
  );

  return fallbackCities[0]?.id_city || null;
};

const hasPropertyUnavailableDatesTable = async () => {
  const [tables] = await db.query(
    "SHOW TABLES LIKE 'property_unavailable_dates'",
  );
  return tables.length > 0;
};

const mapPropertyStatusForHost = (status) => {
  if (status === "approved") return "active";
  if (status === "pending") return "pending";
  if (status === "rejected") return "rejected";
  return status || "pending";
};

const getAvailabilitySummary = (property) => {
  const from = normalizeDateOnly(property.available_from);
  const to = normalizeDateOnly(property.available_to);

  if (from && to) return `Available ${from} to ${to}`;
  if (from) return `Available from ${from}`;
  if (to) return `Available until ${to}`;
  return "Availability not set";
};

const mapHostPropertyRow = (property) => ({
  id: property.id_property,
  title: property.title || "DarDarek listing",
  description: property.description || "",
  city: property.city || "Northern Morocco",
  location:
    property.neighborhood ||
    property.address ||
    property.city ||
    "Location not provided",
  neighborhood: property.neighborhood || "",
  address: property.address || "",
  image: property.main_image || null,
  propertyType: property.property_type || "Appartement",
  pricePerNight: Number(property.price_per_day) || 0,
  guests: Number(property.guests_total) || 0,
  bedrooms: Number(property.bedrooms) || 0,
  bathrooms: Number(property.bathrooms) || 0,
  beds: Number(property.beds) || 0,
  status: mapPropertyStatusForHost(property.status),
  dbStatus: property.status,
  totalBookings: Number(property.totalBookings) || 0,
  upcomingBookings: Number(property.upcomingBookings) || 0,
  monthlyRevenue: Number(property.monthlyRevenue) || 0,
  rating:
    property.averageRating === null || property.averageRating === undefined
      ? null
      : Math.round(Number(property.averageRating) * 10) / 10,
  reviewCount: Number(property.reviewCount) || 0,
  availabilitySummary: getAvailabilitySummary(property),
  availableFrom: normalizeDateOnly(property.available_from),
  availableTo: normalizeDateOnly(property.available_to),
  checkIn: normalizeTimeOnly(property.check_in),
  checkOut: normalizeTimeOnly(property.check_out),
  createdAt: normalizeDateOnly(property.created_at),
  adminNotes: property.admin_notes || "",
});

const getOwnedProperty = async (propertyId, userId) => {
  const [rows] = await db.query(
    `SELECT * FROM properties WHERE id_property = ? AND id_user = ? LIMIT 1`,
    [propertyId, userId],
  );

  return rows[0] || null;
};

app.get("/api/my-properties", verifyToken, async (req, res) => {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  try {
    const [properties] = await db.query(
      `
      SELECT
        p.id_property,
        p.title,
        p.description,
        p.address,
        p.neighborhood,
        p.property_type,
        p.price_per_day,
        p.guests_total,
        p.bedrooms,
        p.bathrooms,
        p.beds,
        p.status,
        p.check_in,
        p.check_out,
        p.available_from,
        p.available_to,
        p.created_at,
        p.admin_notes,
        c.name AS city,
        u.name AS host_name,
        (
          SELECT pi.image_url
          FROM property_images pi
          WHERE pi.id_property = p.id_property
          ORDER BY pi.is_main DESC, pi.id_image ASC
          LIMIT 1
        ) AS main_image,
        (
          SELECT COUNT(*)
          FROM bookings b
          WHERE b.id_property = p.id_property
        ) AS totalBookings,
        (
          SELECT COUNT(*)
          FROM bookings b
          WHERE b.id_property = p.id_property
            AND b.status IN ('pending', 'approved')
            AND b.end_date >= CURDATE()
        ) AS upcomingBookings,
        (
          SELECT COALESCE(SUM(b.total_price), 0)
          FROM bookings b
          WHERE b.id_property = p.id_property
            AND b.status = 'approved'
            AND b.start_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND b.start_date < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
        ) AS monthlyRevenue,
        (
          SELECT AVG(r.rating)
          FROM reviews r
          WHERE r.id_property = p.id_property
        ) AS averageRating,
        (
          SELECT COUNT(*)
          FROM reviews r
          WHERE r.id_property = p.id_property
        ) AS reviewCount
      FROM properties p
      LEFT JOIN cities c ON p.id_city = c.id_city
      LEFT JOIN users u ON p.id_user = u.id_user
      WHERE p.id_user = ?
      ORDER BY p.created_at DESC
      `,
      [userId],
    );

    return res.status(200).json({
      properties: properties.map(mapHostPropertyRow),
    });
  } catch (error) {
    console.error("Error fetching host properties:", error);
    return res.status(500).json({
      message: "Server error while fetching your properties.",
      details: error.message,
    });
  }
});

app.get("/api/properties/:id/edit", verifyToken, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  const propertyId = Number(req.params.id);

  if (!userId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return res.status(400).json({ message: "Invalid property id." });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT
        p.*,
        c.name AS city
      FROM properties p
      LEFT JOIN cities c ON p.id_city = c.id_city
      WHERE p.id_property = ?
      LIMIT 1
      `,
      [propertyId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Property not found." });
    }

    const property = rows[0];

    if (Number(property.id_user) !== Number(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this property." });
    }

    const [images] = await db.query(
      `
      SELECT id_image, image_url, is_main
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

    return res.status(200).json({
      property: {
        id: property.id_property,
        title: property.title || "",
        description: property.description || "",
        hostDescription: property.host_description || "",
        neighborhoodDescription: property.neighborhood_description || "",
        city: property.city || "",
        address: property.address || "",
        neighborhood: property.neighborhood || "",
        postalCode: property.postal_code || "",
        accessInstructions: property.access_instructions || "",
        latitude: property.latitude,
        longitude: property.longitude,
        propertyType: property.property_type || "Appartement",
        guests: property.guests_total,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        beds: property.beds,
        price: property.price_per_day,
        checkIn: normalizeTimeOnly(property.check_in) || "15:00",
        checkOut: normalizeTimeOnly(property.check_out) || "11:00",
        availableFrom: normalizeDateOnly(property.available_from),
        availableTo: normalizeDateOnly(property.available_to),
        status: property.status,
        images: images.map((image) => image.image_url).filter(Boolean),
        amenities: amenities.map((amenity) => amenity.name),
      },
    });
  } catch (error) {
    console.error("Error loading property for edit:", error);
    return res.status(500).json({
      message: "Server error while loading this property.",
      details: error.message,
    });
  }
});

const deletePropertyImages = async (propertyId) => {
  const [images] = await db.query(
    "SELECT image_url FROM property_images WHERE id_property = ?",
    [propertyId],
  );

  for (const img of images) {
    if (!img.image_url) continue;
    const fileName = img.image_url.replace(/^\/uploads\//, "");
    const filePath = path.join(uploadDir, fileName);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      /* best-effort cleanup */
    }
  }
};

app.delete("/api/my-properties/:id/draft", verifyToken, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  const propertyId = Number(req.params.id);

  if (!userId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return res.status(400).json({ message: "Invalid property id." });
  }

  try {
    const [propertyRows] = await db.query(
      "SELECT status FROM properties WHERE id_property = ? AND id_user = ? LIMIT 1",
      [propertyId, userId],
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({ message: "Draft not found." });
    }

    if (propertyRows[0].status !== "draft") {
      return res
        .status(400)
        .json({ message: "Only drafts can be deleted here." });
    }

    await deletePropertyImages(propertyId);
    await db.query("DELETE FROM property_amenities WHERE id_property = ?", [
      propertyId,
    ]);
    await db.query("DELETE FROM property_images WHERE id_property = ?", [
      propertyId,
    ]);
    await db.query(
      "DELETE FROM properties WHERE id_property = ? AND id_user = ?",
      [propertyId, userId],
    );

    return res.status(200).json({ message: "Draft deleted." });
  } catch (error) {
    return res.status(500).json({
      message: "Could not delete this draft.",
      details: error.message,
    });
  }
});

app.delete("/api/my-properties/:id", verifyToken, async (req, res) => {
  const userId = getUserIdFromRequest(req);
  const propertyId = Number(req.params.id);

  if (!userId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return res.status(400).json({ message: "Invalid property id." });
  }

  try {
    const [propertyRows] = await db.query(
      "SELECT id_property, status FROM properties WHERE id_property = ? AND id_user = ? LIMIT 1",
      [propertyId, userId],
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({ message: "Property not found." });
    }

    // Block deletion if there are active or upcoming approved bookings
    const [activeBookings] = await db.query(
      `SELECT id_booking FROM bookings
       WHERE id_property = ?
         AND status IN ('pending', 'approved')
         AND end_date >= CURDATE()
       LIMIT 1`,
      [propertyId],
    );

    if (activeBookings.length > 0) {
      return res.status(409).json({
        message:
          "This property has active or upcoming bookings and cannot be deleted right now.",
      });
    }

    await deletePropertyImages(propertyId);
    await db.query("DELETE FROM property_amenities WHERE id_property = ?", [
      propertyId,
    ]);
    await db.query("DELETE FROM property_images WHERE id_property = ?", [
      propertyId,
    ]);
    await db.query("DELETE FROM reviews WHERE id_property = ?", [propertyId]);
    await db.query("DELETE FROM notifications WHERE id_property = ?", [
      propertyId,
    ]);
    await db.query(
      "DELETE FROM properties WHERE id_property = ? AND id_user = ?",
      [propertyId, userId],
    );

    return res.status(200).json({ message: "Property deleted." });
  } catch (error) {
    return res.status(500).json({
      message: "Could not delete this property.",
      details: error.message,
    });
  }
});

app.put(
  "/api/properties/:id",
  verifyToken,
  upload.array("images", 12),
  async (req, res) => {
    const userId = getUserIdFromRequest(req);
    const propertyId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    if (!Number.isFinite(propertyId) || propertyId <= 0) {
      return res.status(400).json({ message: "Invalid property id." });
    }

    const connection = await db.getConnection();

    try {
      const [ownedRows] = await connection.query(
        "SELECT status FROM properties WHERE id_property = ? AND id_user = ? LIMIT 1",
        [propertyId, userId],
      );

      if (ownedRows.length === 0) {
        const [existsRows] = await connection.query(
          "SELECT id_property FROM properties WHERE id_property = ? LIMIT 1",
          [propertyId],
        );

        return res.status(existsRows.length === 0 ? 404 : 403).json({
          message:
            existsRows.length === 0
              ? "Property not found."
              : "Not authorized to update this property.",
        });
      }

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
      const saveAsDraft = isDraftRequest(req.body?.saveAsDraft);

      if (
        !saveAsDraft &&
        (!title || !description || !city || !address || !price || !guests)
      ) {
        return res.status(400).json({
          message: "Some required fields are missing.",
        });
      }

      if (availableFrom && availableTo && availableTo < availableFrom) {
        return res.status(400).json({
          message:
            "The availability end date must be later than the start date.",
        });
      }

      const idCity = await getPublishCityId(city, saveAsDraft);

      if (!idCity) {
        return res.status(400).json({
          message: "Invalid city. Please choose a valid city.",
        });
      }

      const amenities = JSON.parse(req.body.amenities || "{}");
      let keepImages = [];

      try {
        keepImages = JSON.parse(req.body.keepImages || "[]");
      } catch {
        keepImages = [];
      }

      const uploadedImages = req.files
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];
      const cleanKeepImages = Array.isArray(keepImages)
        ? keepImages.filter((image) => typeof image === "string" && image)
        : [];
      const finalImages = [...cleanKeepImages, ...uploadedImages];

      if (!saveAsDraft && finalImages.length < 4) {
        return res.status(400).json({
          message: "Please keep or upload at least 4 images.",
        });
      }

      const nextStatus = saveAsDraft
        ? "draft"
        : ["rejected", "draft"].includes(ownedRows[0].status)
          ? "pending"
          : ownedRows[0].status;

      await connection.beginTransaction();

      await connection.query(
        `
        UPDATE properties
        SET
          title = ?,
          description = ?,
          host_description = ?,
          neighborhood_description = ?,
          address = ?,
          neighborhood = ?,
          postal_code = ?,
          access_instructions = ?,
          latitude = ?,
          longitude = ?,
          property_type = ?,
          id_city = ?,
          price_per_day = ?,
          guests_total = ?,
          bedrooms = ?,
          bathrooms = ?,
          beds = ?,
          check_in = ?,
          check_out = ?,
          available_from = ?,
          available_to = ?,
          status = ?,
          admin_notes = CASE WHEN ? = 'pending' THEN NULL ELSE admin_notes END
        WHERE id_property = ? AND id_user = ?
        `,
        [
          title?.trim() || "Untitled draft",
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
          idCity,
          Number(price || 0),
          Number(guests || 0),
          Number(bedrooms || 0),
          Number(bathrooms || 0),
          Number(beds || 0),
          checkIn || null,
          checkOut || null,
          availableFrom || null,
          availableTo || null,
          nextStatus,
          nextStatus,
          propertyId,
          userId,
        ],
      );

      await connection.query(
        "DELETE FROM property_images WHERE id_property = ?",
        [propertyId],
      );

      for (let i = 0; i < finalImages.length; i++) {
        await connection.query(
          `INSERT INTO property_images (id_property, image_url, is_main)
           VALUES (?, ?, ?)`,
          [propertyId, finalImages[i], i === 0],
        );
      }

      await connection.query(
        "DELETE FROM property_amenities WHERE id_property = ?",
        [propertyId],
      );

      const selectedAmenities = Object.keys(amenities).filter(
        (key) => amenities[key] === true,
      );

      for (const amenityKey of selectedAmenities) {
        const dbAmenityName = AMENITY_NAME_MAP[amenityKey] || amenityKey;
        const [amenityRows] = await connection.query(
          "SELECT id_amenity FROM amenities WHERE name = ?",
          [dbAmenityName],
        );

        if (amenityRows.length > 0) {
          await connection.query(
            `INSERT INTO property_amenities (id_property, id_amenity)
             VALUES (?, ?)`,
            [propertyId, amenityRows[0].id_amenity],
          );
        }
      }

      await connection.commit();

      return res.status(200).json({
        message:
          nextStatus === "draft"
            ? "Draft saved. You can continue it from My Properties."
            : nextStatus === "pending" && ownedRows[0].status === "rejected"
              ? "Listing updated and resubmitted for approval."
              : nextStatus === "pending" && ownedRows[0].status === "draft"
                ? "Draft submitted for approval."
                : "Listing updated successfully.",
        propertyId,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error updating property:", error);
      return res.status(500).json({
        message: "A server error occurred while updating the listing.",
        details: error.message,
      });
    } finally {
      connection.release();
    }
  },
);

app.get(
  "/api/my-properties/:id/availability",
  verifyToken,
  async (req, res) => {
    const userId = getUserIdFromRequest(req);
    const propertyId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    if (!Number.isFinite(propertyId) || propertyId <= 0) {
      return res.status(400).json({ message: "Invalid property id." });
    }

    try {
      const property = await getOwnedProperty(propertyId, userId);

      if (!property) {
        const [existsRows] = await db.query(
          "SELECT id_property FROM properties WHERE id_property = ? LIMIT 1",
          [propertyId],
        );

        return res.status(existsRows.length === 0 ? 404 : 403).json({
          message:
            existsRows.length === 0
              ? "Property not found."
              : "Not authorized to manage this property's availability.",
        });
      }

      const [bookedRanges] = await db.query(
        `
      SELECT start_date AS startDate, end_date AS endDate, status
      FROM bookings
      WHERE id_property = ?
        AND status IN ('pending', 'approved')
        AND end_date >= CURDATE()
      ORDER BY start_date ASC
      `,
        [propertyId],
      );

      const supportsUnavailableDates = await hasPropertyUnavailableDatesTable();
      let unavailableDates = [];

      if (supportsUnavailableDates) {
        const [rows] = await db.query(
          `
        SELECT unavailable_date AS date, reason
        FROM property_unavailable_dates
        WHERE id_property = ?
        ORDER BY unavailable_date ASC
        `,
          [propertyId],
        );

        unavailableDates = rows.map((row) => ({
          date: normalizeDateOnly(row.date),
          reason: row.reason || "host_blocked",
        }));
      }

      return res.status(200).json({
        property: {
          id: property.id_property,
          title: property.title || "DarDarek listing",
          availableFrom: normalizeDateOnly(property.available_from),
          availableTo: normalizeDateOnly(property.available_to),
          checkIn: normalizeTimeOnly(property.check_in),
          checkOut: normalizeTimeOnly(property.check_out),
        },
        bookedRanges: bookedRanges.map((range) => ({
          startDate: normalizeDateOnly(range.startDate),
          endDate: normalizeDateOnly(range.endDate),
          status: range.status,
        })),
        unavailableDates,
        supportsUnavailableDates,
      });
    } catch (error) {
      console.error("Error loading property availability:", error);
      return res.status(500).json({
        message: "Server error while loading availability.",
        details: error.message,
      });
    }
  },
);

app.put(
  "/api/my-properties/:id/availability",
  verifyToken,
  async (req, res) => {
    const userId = getUserIdFromRequest(req);
    const propertyId = Number(req.params.id);
    const {
      availableFrom,
      availableTo,
      unavailableDates = [],
    } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    if (!Number.isFinite(propertyId) || propertyId <= 0) {
      return res.status(400).json({ message: "Invalid property id." });
    }

    if (availableFrom && !isSafeDateValue(availableFrom)) {
      return res
        .status(400)
        .json({ message: "Invalid availability start date." });
    }

    if (availableTo && !isSafeDateValue(availableTo)) {
      return res
        .status(400)
        .json({ message: "Invalid availability end date." });
    }

    if (availableFrom && availableTo && availableTo < availableFrom) {
      return res.status(400).json({
        message: "The availability end date must be later than the start date.",
      });
    }

    try {
      const property = await getOwnedProperty(propertyId, userId);

      if (!property) {
        const [existsRows] = await db.query(
          "SELECT id_property FROM properties WHERE id_property = ? LIMIT 1",
          [propertyId],
        );

        return res.status(existsRows.length === 0 ? 404 : 403).json({
          message:
            existsRows.length === 0
              ? "Property not found."
              : "Not authorized to manage this property's availability.",
        });
      }

      await db.query(
        `
      UPDATE properties
      SET available_from = ?, available_to = ?
      WHERE id_property = ? AND id_user = ?
      `,
        [availableFrom || null, availableTo || null, propertyId, userId],
      );

      const supportsUnavailableDates = await hasPropertyUnavailableDatesTable();

      if (supportsUnavailableDates) {
        const [bookedRanges] = await db.query(
          `
        SELECT start_date AS startDate, end_date AS endDate
        FROM bookings
        WHERE id_property = ?
          AND status IN ('pending', 'approved')
          AND end_date >= CURDATE()
        `,
          [propertyId],
        );

        const isBookedDate = (date) =>
          bookedRanges.some((range) => {
            const start = normalizeDateOnly(range.startDate);
            const end = normalizeDateOnly(range.endDate);
            return start && end && date >= start && date < end;
          });

        const cleanDates = Array.from(
          new Set(
            (Array.isArray(unavailableDates) ? unavailableDates : [])
              .map(normalizeDateOnly)
              .filter(
                (date) => date && isSafeDateValue(date) && !isBookedDate(date),
              ),
          ),
        );

        await db.query(
          "DELETE FROM property_unavailable_dates WHERE id_property = ? AND reason = 'host_blocked'",
          [propertyId],
        );

        for (const date of cleanDates) {
          await db.query(
            `
          INSERT IGNORE INTO property_unavailable_dates
            (id_property, unavailable_date, reason)
          VALUES (?, ?, 'host_blocked')
          `,
            [propertyId, date],
          );
        }
      }

      return res.status(200).json({
        message: supportsUnavailableDates
          ? "Availability saved successfully."
          : "Availability range saved. Host-blocked days require the optional unavailable dates table.",
        supportsUnavailableDates,
      });
    } catch (error) {
      console.error("Error saving property availability:", error);
      return res.status(500).json({
        message: "Server error while saving availability.",
        details: error.message,
      });
    }
  },
);

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
        review_stats.avg_rating,
        COALESCE(review_stats.review_count, 0) AS review_count,
        (
          SELECT image_url
          FROM property_images
          WHERE id_property = p.id_property AND is_main = 1
          LIMIT 1
        ) AS main_image
      FROM properties p
      LEFT JOIN cities c ON p.id_city = c.id_city
      LEFT JOIN (
        SELECT id_property, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
        FROM reviews
        GROUP BY id_property
      ) review_stats ON review_stats.id_property = p.id_property
      WHERE p.status = 'approved'
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
        p.id_user,
        c.name AS city,
        c.name AS city_name,
        u.name AS host_name,
        u.email AS host_email,
        u.phone_number AS host_phone,
        u.profile_picture AS host_profile_picture,
        u.bio AS host_bio,
        u.nationality AS host_nationality,
        u.languages AS host_languages,
        COALESCE(u.role, 'host') AS host_role     
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

    if (property.status !== "approved") {
      const currentUser = await getOptionalAuthenticatedUser(req);
      const canViewModeratedListing =
        currentUser &&
        (currentUser.role === "admin" ||
          Number(currentUser.id_user) === Number(property.id_user));

      if (!canViewModeratedListing) {
        return res.status(404).json({ message: "Property not found." });
      }
    }

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
  return res.redirect(307, `/api/houses/${req.params.id}`);
});

app.get("/api/extractHomePageProperties", async (req, res) => {
  try {
    const cityQuery = (cityName) => `
        SELECT
          p.*,
          c.name AS city_name,
          img.image_url AS main_image,
          review_stats.avg_rating,
          COALESCE(review_stats.review_count, 0) AS review_count
        FROM properties p
        JOIN cities c ON p.id_city = c.id_city
        LEFT JOIN property_images img ON img.id_property = p.id_property AND img.is_main = 1
        LEFT JOIN (
          SELECT id_property, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
          FROM reviews
          GROUP BY id_property
        ) review_stats ON review_stats.id_property = p.id_property
      WHERE c.name = '${cityName}'
        AND p.status = 'approved'
        ORDER BY p.created_at DESC
        LIMIT 10
    `;

    const [latestRows] = await db.query(`
      SELECT
        p.*,
        c.name AS city_name,
        img.image_url AS main_image,
        review_stats.avg_rating,
        COALESCE(review_stats.review_count, 0) AS review_count
      FROM properties p
      JOIN cities c ON p.id_city = c.id_city
      LEFT JOIN property_images img ON img.id_property = p.id_property AND img.is_main = 1
      LEFT JOIN (
        SELECT id_property, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
        FROM reviews
        GROUP BY id_property
      ) review_stats ON review_stats.id_property = p.id_property
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
        property_images.image_url AS main_image,
        review_stats.avg_rating,
        COALESCE(review_stats.review_count, 0) AS review_count
      FROM properties 
      JOIN cities ON properties.id_city = cities.id_city
      LEFT JOIN property_images 
        ON properties.id_property = property_images.id_property 
        AND property_images.is_main = 1
      LEFT JOIN (
        SELECT id_property, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
        FROM reviews
        GROUP BY id_property
      ) review_stats ON review_stats.id_property = properties.id_property
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
  verifyToken,
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
      } = req.body;

      const userId = getUserIdFromRequest(req);
      const saveAsDraft = isDraftRequest(req.body?.saveAsDraft);

      if (!userId) {
        return res.status(401).json({
          message: "Invalid authenticated user.",
        });
      }

      const amenities = JSON.parse(req.body.amenities || "{}");
      const uploadedImages = req.files
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];

      if (
        !saveAsDraft &&
        (!title ||
          !description ||
          !city ||
          !address ||
          !price ||
          !guests ||
          !availableFrom ||
          !availableTo)
      ) {
        return res.status(400).json({
          message: "Some required fields are missing.",
        });
      }

      if (availableFrom && availableTo && availableTo < availableFrom) {
        return res.status(400).json({
          message:
            "The availability end date must be later than the start date.",
        });
      }

      if (!saveAsDraft && uploadedImages.length < 4) {
        return res.status(400).json({
          message: "Please upload at least 4 images.",
        });
      }

      const id_city = await getPublishCityId(city, saveAsDraft);

      if (!id_city) {
        return res.status(400).json({
          message: "Invalid city. Please choose a valid city.",
        });
      }

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
          title?.trim() || "Untitled draft",
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
          userId,
          Number(price || 0),
          Number(guests || 0),
          Number(bedrooms || 0),
          Number(bathrooms || 0),
          Number(beds || 0),
          checkIn || null,
          checkOut || null,
          availableFrom || null,
          availableTo || null,
          saveAsDraft ? "draft" : "pending",
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
        message: saveAsDraft
          ? "Draft saved. You can continue it from My Properties."
          : "Your listing has been submitted successfully and is now awaiting approval.",
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

app.get(
  "/api/pendingProperties",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const requestedStatus = String(
        req.query?.status || "pending",
      ).toLowerCase();
      const allowedStatuses = new Set([
        "all",
        "pending",
        "approved",
        "rejected",
      ]);
      const statusFilter = allowedStatuses.has(requestedStatus)
        ? requestedStatus
        : "pending";
      const propertyWhere = statusFilter === "all" ? "" : "WHERE p.status = ?";
      const propertyParams = statusFilter === "all" ? [] : [statusFilter];

      const page = Math.max(1, Number(req.query?.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
      const offset = (page - 1) * limit;

      const [result] = await db.query(
        `
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
      ${propertyWhere}
      ORDER BY
        CASE WHEN p.status = 'pending' THEN 0 ELSE 1 END,
        p.created_at DESC,
        p.id_property DESC
      LIMIT ? OFFSET ?
      `,
        [...propertyParams, limit, offset],
      );

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
        pagination: { page, limit },
      });
    } catch (error) {
      res.status(500).json({ details: error.message });
    }
  },
);

app.post(
  "/api/admin/approve/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const propertyId = Number(id);

      if (!Number.isFinite(propertyId) || propertyId <= 0) {
        return res.status(400).json({ message: "Invalid property id." });
      }

      const [result] = await db.execute(
        "UPDATE properties SET status = 'approved', admin_notes = NULL, reviewed_by = ? WHERE id_property = ?",
        [getUserIdFromRequest(req), propertyId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Property not found." });
      }

      // Notify the property host
      const [propertyData] = await db.query(
        "SELECT id_user, title FROM properties WHERE id_property = ?",
        [propertyId],
      );
      if (propertyData.length > 0) {
        const { id_user: hostId, title: propertyTitle } = propertyData[0];
        try {
          await db.execute(
            `INSERT INTO notifications (id_user, id_property, type, notify_text)
             VALUES (?, ?, ?, ?)`,
            [
              hostId,
              propertyId,
              "APPROVE",
              `Your property "${propertyTitle}" has been approved and is now live! 🎉`,
            ],
          );
        } catch (notifyErr) {
          console.error(
            "Failed to notify host about property approval:",
            notifyErr.message,
          );
        }
      }

      res.status(200).json({ message: "Property approved successfully." });
    } catch (error) {
      res.status(500).json({ details: error.message });
    }
  },
);

app.post(
  "/api/admin/reject/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const propertyId = Number(id);

      if (!Number.isFinite(propertyId) || propertyId <= 0) {
        return res.status(400).json({ message: "Invalid property id." });
      }

      const adminNotes = cleanText(
        req.body?.admin_notes || req.body?.feedback || req.body?.notes,
        2000,
      );

      if (!adminNotes || adminNotes.length < 10) {
        return res.status(400).json({
          message: "Please add rejection feedback with at least 10 characters.",
        });
      }

      const [result] = await db.execute(
        "UPDATE properties SET status = 'rejected', admin_notes = ?, reviewed_by = ? WHERE id_property = ?",
        [adminNotes, getUserIdFromRequest(req), propertyId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Property not found." });
      }

      // Notify the property host
      const [propertyData] = await db.query(
        "SELECT id_user, title FROM properties WHERE id_property = ?",
        [propertyId],
      );
      if (propertyData.length > 0) {
        const { id_user: hostId, title: propertyTitle } = propertyData[0];
        try {
          await db.execute(
            `INSERT INTO notifications (id_user, id_property, type, notify_text)
             VALUES (?, ?, ?, ?)`,
            [
              hostId,
              propertyId,
              "REJECT",
              `Your property "${propertyTitle}" needs revisions. Please review the admin feedback and resubmit.`,
            ],
          );
        } catch (notifyErr) {
          console.error(
            "Failed to notify host about property rejection:",
            notifyErr.message,
          );
        }
      }

      res.status(200).json({
        message: "Property rejected and feedback saved.",
        admin_notes: adminNotes,
      });
    } catch (error) {
      res.status(500).json({ details: error.message });
    }
  },
);

/* =========================
   MODERATION ROUTES
========================= */

const REPORT_CATEGORIES = new Set([
  "safety",
  "fraud",
  "inappropriate",
  "property_accuracy",
  "host_behavior",
  "guest_behavior",
  "payment",
  "other",
]);

app.post("/api/reports", verifyToken, async (req, res) => {
  const reporterId = getUserIdFromRequest(req);
  const propertyId = Number(req.body?.id_property);
  const bookingId = req.body?.id_booking ? Number(req.body.id_booking) : null;
  const category = cleanText(req.body?.category, 50) || "other";
  const reason = cleanText(req.body?.reason, 2000);

  if (!reporterId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return res.status(400).json({ message: "A valid property is required." });
  }

  if (bookingId !== null && (!Number.isFinite(bookingId) || bookingId <= 0)) {
    return res.status(400).json({ message: "Invalid booking id." });
  }

  if (!REPORT_CATEGORIES.has(category)) {
    return res.status(400).json({ message: "Choose a valid report category." });
  }

  if (!reason || reason.length < 20) {
    return res.status(400).json({
      message: "Please describe the issue in at least 20 characters.",
    });
  }

  try {
    const [properties] = await db.query(
      `SELECT p.id_property, p.id_user AS host_id, p.title
       FROM properties p
       WHERE p.id_property = ?
       LIMIT 1`,
      [propertyId],
    );

    if (properties.length === 0) {
      return res.status(404).json({ message: "Property not found." });
    }

    const property = properties[0];
    if (Number(property.host_id) === reporterId) {
      return res
        .status(400)
        .json({ message: "You cannot report your own listing." });
    }

    if (bookingId) {
      const [bookings] = await db.query(
        `SELECT b.id_booking
         FROM bookings b
         JOIN properties p ON b.id_property = p.id_property
         WHERE b.id_booking = ?
           AND b.id_property = ?
           AND (b.id_user = ? OR p.id_user = ?)
         LIMIT 1`,
        [bookingId, propertyId, reporterId, reporterId],
      );

      if (bookings.length === 0) {
        return res.status(403).json({
          message: "You are not authorized to report this booking.",
        });
      }
    }

    const [result] = await db.execute(
      `INSERT INTO reports
       (reporter_id, reported_user_id, id_property, id_booking, category, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        reporterId,
        property.host_id || null,
        propertyId,
        bookingId,
        category,
        reason,
      ],
    );

    try {
      const [admins] = await db.query(
        "SELECT id_user FROM users WHERE role = 'admin' AND is_active = 1",
      );

      await Promise.all(
        admins.map((admin) =>
          db.execute(
            `INSERT INTO notifications (id_user, id_property, notify_text)
             VALUES (?, ?, ?)`,
            [
              admin.id_user,
              propertyId,
              `New report for "${property.title}" needs review.`,
            ],
          ),
        ),
      );
    } catch (notifyError) {
      console.error(
        "Failed to notify admins about report:",
        notifyError.message,
      );
    }

    sendAdminReportEmail({
      category,
      propertyId,
      reporterId,
      reason,
    }).catch((emailError) => {
      console.error("Failed to email admin about report:", emailError.message);
    });

    return res.status(201).json({
      message: "Report submitted. Dar Darek moderation will review it.",
      reportId: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not submit report.",
      details: error.message,
    });
  }
});

app.get("/api/admin/reports", verifyToken, verifyAdmin, async (req, res) => {
  const status = cleanText(req.query?.status, 30);
  const allowedStatuses = new Set([
    "pending",
    "reviewed",
    "dismissed",
    "action_taken",
  ]);
  const whereClauses = [];
  const queryParams = [];

  if (status && allowedStatuses.has(status)) {
    whereClauses.push("r.status = ?");
    queryParams.push(status);
  }

  const whereString = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";

  try {
    const [reports] = await db.query(
      `
      SELECT
        r.id_report,
        r.category,
        r.reason,
        r.status,
        r.admin_notes,
        r.created_at,
        r.updated_at,
        p.id_property,
        p.title AS property_title,
        reporter.id_user AS reporter_id,
        reporter.name AS reporter_name,
        reporter.email AS reporter_email,
        reported.id_user AS reported_user_id,
        reported.name AS reported_user_name,
        reported.email AS reported_user_email,
        reported.is_suspended AS reported_user_suspended,
        reviewer.name AS reviewed_by_name
      FROM reports r
      LEFT JOIN properties p ON r.id_property = p.id_property
      LEFT JOIN users reporter ON r.reporter_id = reporter.id_user
      LEFT JOIN users reported ON r.reported_user_id = reported.id_user
      LEFT JOIN users reviewer ON r.reviewed_by = reviewer.id_user
      ${whereString}
      ORDER BY
        CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
        r.created_at DESC
      LIMIT 100
      `,
      queryParams,
    );

    const [counts] = await db.query(
      `SELECT status, COUNT(*) AS total FROM reports GROUP BY status`,
    );

    const summary = counts.reduce(
      (acc, row) => ({
        ...acc,
        [row.status]: Number(row.total) || 0,
      }),
      { pending: 0, reviewed: 0, dismissed: 0, action_taken: 0 },
    );

    return res.status(200).json({ reports, summary });
  } catch (error) {
    return res.status(500).json({
      message: "Could not load moderation reports.",
      details: error.message,
    });
  }
});

app.patch(
  "/api/admin/reports/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const reportId = Number(req.params.id);
    const status = cleanText(req.body?.status, 30);
    const adminNotes = cleanText(req.body?.admin_notes, 2000);
    const allowedStatuses = new Set([
      "pending",
      "reviewed",
      "dismissed",
      "action_taken",
    ]);

    if (!Number.isFinite(reportId) || reportId <= 0) {
      return res.status(400).json({ message: "Invalid report id." });
    }

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ message: "Choose a valid report status." });
    }

    try {
      const [result] = await db.execute(
        `UPDATE reports
       SET status = ?, admin_notes = ?, reviewed_by = ?
       WHERE id_report = ?`,
        [status, adminNotes, getUserIdFromRequest(req), reportId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Report not found." });
      }

      return res.status(200).json({ message: "Report updated." });
    } catch (error) {
      return res.status(500).json({
        message: "Could not update report.",
        details: error.message,
      });
    }
  },
);

app.patch(
  "/api/admin/users/:id/suspension",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const targetUserId = Number(req.params.id);
    const adminId = getUserIdFromRequest(req);
    const suspend = Boolean(req.body?.suspend);
    const reason = cleanText(req.body?.reason, 255);

    if (!Number.isFinite(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    if (targetUserId === adminId && suspend) {
      return res
        .status(400)
        .json({ message: "Admins cannot suspend their own account." });
    }

    if (suspend && (!reason || reason.length < 8)) {
      return res
        .status(400)
        .json({ message: "A suspension reason is required." });
    }

    try {
      const [result] = await db.execute(
        `UPDATE users
         SET is_suspended = ?,
             suspension_reason = ?,
             suspended_at = ${suspend ? "CURRENT_TIMESTAMP" : "NULL"}
         WHERE id_user = ? AND role != 'admin'`,
        [suspend ? 1 : 0, suspend ? reason : null, targetUserId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "User not found or cannot be moderated.",
        });
      }

      if (suspend) {
        try {
          const [users] = await db.query(
            "SELECT email, name FROM users WHERE id_user = ? LIMIT 1",
            [targetUserId]
          );
          if (users.length > 0) {
            sendSuspensionEmail(users[0].email, users[0].name, reason);
          }
        } catch (emailErr) {
          console.error("Error sending suspension email:", emailErr);
        }
      }

      return res.status(200).json({
        message: suspend ? "User suspended." : "User suspension removed.",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Could not update user suspension.",
        details: error.message,
      });
    }
  },
);

/* =========================
   ADMIN: USER LIST
========================= */

app.get("/api/admin/users", verifyToken, verifyAdmin, async (req, res) => {
  const search = cleanText(req.query?.search, 100);
  const page = Math.max(1, Number(req.query?.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
  const offset = (page - 1) * limit;
  const statusFilter = cleanText(req.query?.status, 20);

  const whereClauses = ["u.role != 'admin'"];
  const queryParams = [];

  if (search) {
    whereClauses.push("(u.name LIKE ? OR u.email LIKE ?)");
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  if (statusFilter === "suspended") {
    whereClauses.push("u.is_suspended = 1");
  } else if (statusFilter === "active") {
    whereClauses.push("u.is_suspended = 0 AND u.is_active = 1");
  } else if (statusFilter === "inactive") {
    whereClauses.push("u.is_active = 0");
  }

  const whereString = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";

  try {
    const [users] = await db.query(
      `SELECT
         u.id_user,
         u.name,
         u.email,
         u.role,
         u.phone_number,
         u.profile_picture,
         u.is_active,
         u.is_suspended,
         u.suspension_reason,
         u.suspended_at,
         u.created_at,
         (SELECT COUNT(*) FROM properties p WHERE p.id_user = u.id_user) AS property_count,
         (SELECT COUNT(*) FROM bookings b WHERE b.id_user = u.id_user) AS booking_count
       FROM users u
       ${whereString}
       ORDER BY u.is_suspended DESC, u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM users u ${whereString}`,
      queryParams,
    );

    const total = Number(countResult[0]?.total) || 0;

    return res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not load user list.",
      details: error.message,
    });
  }
});

/* =========================
   BOOKING ROUTES
========================= */

// Acquire a temporary hold on dates during checkout
app.post("/api/booking-lock", verifyToken, async (req, res) => {
  const userId = Number(req.user?.id);
  const { id_property, checkIn, checkOut } = req.body;
  const propertyId = Number(id_property);
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (
    !Number.isFinite(propertyId) ||
    propertyId <= 0 ||
    !checkIn ||
    !checkOut
  ) {
    return res.status(400).json({ message: "Property and dates are required." });
  }

  if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
    return res
      .status(400)
      .json({ message: "Dates must use YYYY-MM-DD format." });
  }

  try {
    // Purge expired locks
    await db.execute("DELETE FROM booking_locks WHERE expires_at < NOW()");

    // Check for conflicting locks from OTHER users
    const [conflictingLocks] = await db.query(
      `SELECT id_lock FROM booking_locks
       WHERE id_property = ?
         AND id_user != ?
         AND (start_date < ? AND end_date > ?)
       LIMIT 1`,
      [propertyId, userId, checkOut, checkIn],
    );

    if (conflictingLocks.length > 0) {
      return res.status(409).json({
        message:
          "Another guest is currently completing a booking for these dates. Please wait a few minutes or choose different dates.",
      });
    }

    // Remove any existing lock from the same user for this property
    await db.execute(
      "DELETE FROM booking_locks WHERE id_property = ? AND id_user = ?",
      [propertyId, userId],
    );

    // Create the lock
    const expiresAt = new Date(Date.now() + BOOKING_LOCK_TTL_MS);

    const [result] = await db.execute(
      `INSERT INTO booking_locks (id_property, id_user, start_date, end_date, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [propertyId, userId, checkIn, checkOut, expiresAt],
    );

    return res.status(201).json({
      lockId: result.insertId,
      expiresAt: expiresAt.toISOString(),
      ttlMs: BOOKING_LOCK_TTL_MS,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not acquire booking lock.",
      details: error.message,
    });
  }
});

// Release a booking lock
app.delete("/api/booking-lock/:id", verifyToken, async (req, res) => {
  const userId = Number(req.user?.id);
  const lockId = Number(req.params.id);

  if (!Number.isFinite(lockId) || lockId <= 0) {
    return res.status(400).json({ message: "Invalid lock id." });
  }

  try {
    await db.execute(
      "DELETE FROM booking_locks WHERE id_lock = ? AND id_user = ?",
      [lockId, userId],
    );

    return res.status(200).json({ message: "Booking lock released." });
  } catch (error) {
    return res.status(500).json({
      message: "Could not release booking lock.",
      details: error.message,
    });
  }
});

app.post("/api/bookingProperty", verifyToken, async (req, res) => {
  const {
    id_property,
    checkIn,
    checkOut,
    guest_full_name,
    guest_id_number,
    guest_phone,
    agreed_to_terms,
  } = req.body;

  const propertyId = Number(id_property);
  const tokenUserId = Number(req.user?.id);
  const bookingUserId =
    Number.isFinite(tokenUserId) && tokenUserId > 0 ? tokenUserId : null;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  try {
    // -- Basic validation --
    if (!propertyId || !checkIn || !checkOut || !bookingUserId) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
      return res
        .status(400)
        .json({ message: "Dates must use YYYY-MM-DD format." });
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date." });
    }

    // -- Identity fields validation --
    const cleanName = String(guest_full_name || "").trim();
    const cleanId = String(guest_id_number || "").trim();
    const cleanPhone = String(guest_phone || "").trim();

    if (!cleanName || cleanName.length < 5) {
      return res.status(400).json({
        message: "Please provide your full name (minimum 5 characters).",
      });
    }
    if (!cleanId || cleanId.length < 5) {
      return res.status(400).json({
        message: "Please provide a valid ID / CIN / Passport number.",
      });
    }
    if (!cleanPhone || !/^[\d\s()+-]{7,20}$/.test(cleanPhone)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid phone number." });
    }
    if (!agreed_to_terms) {
      return res.status(400).json({
        message: "You must accept the rental agreement to confirm the booking.",
      });
    }

    // -- Update user phone number if missing --
    if (bookingUserId) {
      try {
        await db.execute(
          "UPDATE users SET phone_number = ? WHERE id_user = ? AND (phone_number IS NULL OR phone_number = '')",
          [cleanPhone, bookingUserId]
        );
      } catch (err) {
        console.error("Failed to update user phone number:", err.message);
      }
    }

    // -- Property lookup --
    const [properties] = await db.query(
      `SELECT id_property, id_user, price_per_day, available_from, available_to, status
       FROM properties
       WHERE id_property = ?
       LIMIT 1`,
      [propertyId],
    );

    if (properties.length === 0) {
      return res.status(404).json({ message: "Property not found." });
    }

    const property = properties[0];

    if (property.status !== "approved") {
      return res
        .status(403)
        .json({ message: "This property is not available for booking." });
    }
    if (Number(property.id_user) === bookingUserId) {
      return res
        .status(400)
        .json({ message: "You cannot book your own property." });
    }

    const availableFrom = normalizeDateOnly(property.available_from);
    const availableTo = normalizeDateOnly(property.available_to);

    if (
      (availableFrom && checkIn < availableFrom) ||
      (availableTo && checkOut > availableTo)
    ) {
      return res.status(400).json({
        message:
          "Please choose dates inside this property's availability window.",
      });
    }

    // -- Pricing --
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
    );
    const totalPrice = Number(property.price_per_day) * nights;

    // -- Double-check: user's own active booking --
    const [userActiveBooking] = await db.query(
      `SELECT id_booking
       FROM bookings
       WHERE id_property = ?
         AND id_user = ?
         AND (
           status = 'pending'
           OR (status = 'approved' AND end_date >= CURDATE())
         )
       LIMIT 1`,
      [propertyId, bookingUserId],
    );

    if (userActiveBooking.length > 0) {
      return res.status(409).json({
        message: "You already have an active booking for this property.",
      });
    }

    // -- Double-check: date conflict --
    const [bookingConflict] = await db.query(
      `SELECT id_booking
       FROM bookings
       WHERE id_property = ?
         AND status IN ('pending', 'approved')
         AND (start_date < ? AND end_date > ?)`,
      [propertyId, checkOut, checkIn],
    );

    if (bookingConflict.length > 0) {
      return res.status(409).json({
        message: "This property is already reserved for the selected dates.",
      });
    }

    // -- Double-check: lock conflict from another user --
    const [lockConflict] = await db.query(
      `SELECT id_lock FROM booking_locks
       WHERE id_property = ?
         AND id_user != ?
         AND expires_at > NOW()
         AND (start_date < ? AND end_date > ?)
       LIMIT 1`,
      [propertyId, bookingUserId, checkOut, checkIn],
    );

    if (lockConflict.length > 0) {
      return res.status(409).json({
        message:
          "Another guest is currently completing a booking for these dates. Please try again shortly.",
      });
    }

    // -- Insert booking with identity fields --
    const [insertResult] = await db.query(
      `INSERT INTO bookings
         (id_property, id_user, start_date, end_date, total_price, status,
          guest_full_name, guest_id_number, guest_phone, agreed_to_terms)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, 1)`,
      [
        propertyId,
        bookingUserId,
        checkIn,
        checkOut,
        totalPrice,
        cleanName,
        cleanId,
        cleanPhone,
      ],
    );

    // -- Notify host --
    try {
      await db.execute(
        `INSERT INTO notifications (id_user, id_property, id_booking, type, notify_text)
         VALUES (?, ?, ?, ?, ?)`,
        [
          property.id_user,
          propertyId,
          insertResult.insertId,
          "general",
          `New booking request for your property! Check your rental requests.`,
        ],
      );
    } catch (notifyErr) {
      console.error(
        "Failed to notify host about new booking:",
        notifyErr.message,
      );
    }

    // -- Clean up user's booking lock for this property --
    try {
      await db.execute(
        "DELETE FROM booking_locks WHERE id_property = ? AND id_user = ?",
        [propertyId, bookingUserId],
      );
    } catch {
      /* best-effort lock cleanup */
    }

    res
      .status(201)
      .json({ message: "Booking request submitted successfully!" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({
      message: "Server error while processing your booking.",
      details: error.message,
    });
  }
});

app.get("/api/properties/:id/booked-dates", async (req, res) => {
  const propertyId = Number(req.params.id);

  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return res.status(400).json({ message: "Invalid property id." });
  }

  try {
    const [bookedDates] = await db.query(
      `
      SELECT start_date, end_date, status
      FROM bookings
      WHERE id_property = ?
        AND status IN ('approved', 'pending')
        AND end_date >= CURDATE()
      ORDER BY start_date ASC
      `,
      [propertyId],
    );

    res.status(200).json({ bookedDates });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching booked dates.",
      details: error.message,
    });
  }
});

app.get("/api/my-bookings", verifyToken, async (req, res) => {
  const userId = Number(req.user?.id);

  if (!Number.isFinite(userId) || userId <= 0) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  try {
    const [bookings] = await db.query(
      `
      SELECT
        b.id_booking AS id,
        b.id_property AS propertyId,
        p.title AS propertyTitle,
        COALESCE(c.name, '') AS city,
        COALESCE(NULLIF(p.neighborhood, ''), NULLIF(p.address, ''), c.name, '') AS location,
        (
          SELECT pi.image_url
          FROM property_images pi
          WHERE pi.id_property = p.id_property
          ORDER BY pi.is_main DESC, pi.id_image ASC
          LIMIT 1
        ) AS image,
        b.start_date AS checkIn,
        b.end_date AS checkOut,
        p.guests_total AS guests,
        b.total_price AS totalPrice,
        CASE
          WHEN b.status = 'pending' THEN 'pending'
          WHEN b.status = 'cancelled' THEN 'cancelled'
          WHEN b.status = 'rejected' THEN 'cancelled'
          WHEN b.status = 'approved' AND b.end_date < CURDATE() THEN 'completed'
          ELSE 'upcoming'
        END AS status,
        COALESCE(host.name, 'DarDarek host') AS hostName,
        EXISTS (
          SELECT 1
          FROM reviews review_check
          WHERE review_check.id_booking = b.id_booking
            AND review_check.id_user = b.id_user
          LIMIT 1
        ) AS reviewed
      FROM bookings b
      JOIN properties p ON b.id_property = p.id_property
      LEFT JOIN cities c ON p.id_city = c.id_city
      LEFT JOIN users host ON p.id_user = host.id_user
      WHERE b.id_user = ?
      ORDER BY b.start_date DESC, b.created_at DESC
      `,
      [userId],
    );

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching your bookings.",
      details: error.message,
    });
  }
});

app.patch("/api/my-bookings/:id/cancel", verifyToken, async (req, res) => {
  const userId = Number(req.user?.id);
  const bookingId = Number(req.params.id);

  if (!Number.isFinite(userId) || userId <= 0) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  if (!Number.isFinite(bookingId) || bookingId <= 0) {
    return res.status(400).json({ message: "Invalid booking id." });
  }

  try {
    const [rows] = await db.query(
      `SELECT id_booking, status, end_date, end_date < CURDATE() AS isCompleted
       FROM bookings
       WHERE id_booking = ? AND id_user = ?
       LIMIT 1`,
      [bookingId, userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const booking = rows[0];

    if (booking.status === "cancelled" || booking.status === "rejected") {
      return res.status(200).json({ message: "Booking is already cancelled." });
    }

    if (booking.status === "approved" && Number(booking.isCompleted) === 1) {
      return res
        .status(400)
        .json({ message: "Completed bookings cannot be cancelled." });
    }

    await db.execute(
      "UPDATE bookings SET status = 'cancelled' WHERE id_booking = ? AND id_user = ?",
      [bookingId, userId],
    );

    res.status(200).json({ message: "Booking cancelled successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Server error while cancelling your booking.",
      details: error.message,
    });
  }
});

app.post("/api/my-bookings/:id/review", verifyToken, async (req, res) => {
  const userId = Number(req.user?.id);
  const bookingId = Number(req.params.id);
  const safeRating = Number(req.body?.rating);
  const comment = String(req.body?.comment || "").trim();

  if (!Number.isFinite(userId) || userId <= 0) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  if (!Number.isFinite(bookingId) || bookingId <= 0) {
    return res.status(400).json({ message: "Invalid booking id." });
  }

  if (!Number.isFinite(safeRating) || safeRating < 1 || safeRating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  if (comment.length < 10) {
    return res
      .status(400)
      .json({ message: "Review comment must be at least 10 characters." });
  }

  try {
    const [eligibleBookings] = await db.query(
      `SELECT id_booking, id_property
       FROM bookings
       WHERE id_booking = ?
         AND id_user = ?
         AND status = 'approved'
         AND end_date < CURDATE()
       LIMIT 1`,
      [bookingId, userId],
    );

    if (eligibleBookings.length === 0) {
      return res.status(403).json({
        message:
          "You can only leave a review after a completed, approved stay.",
      });
    }

    const booking = eligibleBookings[0];

    const [existingReview] = await db.query(
      "SELECT id_review FROM reviews WHERE id_booking = ? AND id_user = ?",
      [bookingId, userId],
    );

    if (existingReview.length > 0) {
      return res
        .status(409)
        .json({ message: "You have already reviewed this booking." });
    }

    await db.execute(
      `INSERT INTO reviews (id_property, id_user, id_booking, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [booking.id_property, userId, bookingId, safeRating, comment],
    );

    res.status(201).json({ message: "Review submitted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Server error while submitting your review.",
      details: error.message,
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
        p.property_type,
        c.name AS city_name,
        u.name AS guestName,
        u.email AS guestEmail,
        u.phone_number AS tenant_phone,
        (
          SELECT image_url 
          FROM property_images 
          WHERE id_property = p.id_property 
          LIMIT 1
        ) AS image
      FROM bookings b
      JOIN properties p ON b.id_property = p.id_property
      LEFT JOIN cities c ON p.id_city = c.id_city
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

app.patch("/api/rentalRequests/:id/status", verifyToken, async (req, res) => {
  const bookingId = Number(req.params.id);
  const { status } = req.body;
  const tokenUserId = Number(req.user?.id);

  const allowedStatuses = ["approved", "rejected", "pending"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  if (!Number.isFinite(bookingId) || bookingId <= 0) {
    return res.status(400).json({ message: "Invalid booking id." });
  }

  try {
    // Ensure the logged-in user owns the property attached to this booking
    // Also fetch tenant id_user and property title for the notification
    const [rows] = await db.query(
      `SELECT b.id_booking, b.id_user AS tenant_id, b.id_property,
              p.title AS property_title
       FROM bookings b
       JOIN properties p ON b.id_property = p.id_property
       WHERE b.id_booking = ? AND p.id_user = ?`,
      [bookingId, tokenUserId],
    );

    if (rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this booking." });
    }

    await db.execute("UPDATE bookings SET status = ? WHERE id_booking = ?", [
      status,
      bookingId,
    ]);

    // ── Trigger notification ──────────────────────────────────────────────
    if (status === "approved" || status === "rejected") {
      const { tenant_id, id_property, property_title } = rows[0];
      const notifyType = status === "approved" ? "APPROVE" : "REJECT";
      const notifyText =
        status === "approved"
          ? `Your request for "${property_title}" was approved! 🎉`
          : `Your request for "${property_title}" was rejected.`;

      try {
        await db.execute(
          `INSERT INTO notifications (id_user, id_property, id_booking, type, notify_text)
           VALUES (?, ?, ?, ?, ?)`,
          [tenant_id, id_property, bookingId, notifyType, notifyText],
        );
      } catch (notifyErr) {
        // Non-fatal — log but don't fail the main response
        console.error("Failed to insert notification:", notifyErr.message);
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    res.status(200).json({ message: `Booking ${status} successfully.` });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating booking status.",
      details: error.message,
    });
  }
});

/* =========================
   REVIEW ROUTES
========================= */

app.get("/api/properties/:id/reviews", async (req, res) => {
  const propertyId = Number(req.params.id);

  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return res.status(400).json({ message: "Invalid property id." });
  }

  try {
    const [reviews] = await db.query(
      `SELECT
         r.id_review,
         r.rating,
         r.comment,
         r.created_at,
         r.id_booking,
         u.name AS reviewer_name
       FROM reviews r
       JOIN users u ON r.id_user = u.id_user
       WHERE r.id_property = ?
       ORDER BY r.created_at DESC`,
      [propertyId],
    );

    const avgRating =
      reviews.length > 0
        ? Math.round(
          (reviews.reduce((sum, r) => sum + Number(r.rating), 0) /
            reviews.length) *
          10,
        ) / 10
        : null;

    res.status(200).json({ reviews, avgRating, count: reviews.length });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching reviews.",
      details: error.message,
    });
  }
});

app.post("/api/reviews", verifyToken, async (req, res) => {
  const userId = Number(req.user?.id);
  const { id_property, rating, comment } = req.body;
  const propertyId = Number(id_property);
  const safeRating = Number(rating);

  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return res.status(400).json({ message: "Invalid property id." });
  }

  if (!Number.isFinite(safeRating) || safeRating < 1 || safeRating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  if (!comment || String(comment).trim().length < 10) {
    return res
      .status(400)
      .json({ message: "Comment must be at least 10 characters." });
  }

  try {
    // Find an eligible completed booking for this user & property
    const [eligibleBookings] = await db.query(
      `SELECT id_booking FROM bookings
       WHERE id_user = ?
         AND id_property = ?
         AND status = 'approved'
         AND end_date < CURDATE()
       LIMIT 1`,
      [userId, propertyId],
    );

    if (eligibleBookings.length === 0) {
      return res.status(403).json({
        message:
          "You can only leave a review after a completed, approved stay.",
      });
    }

    const bookingId = eligibleBookings[0].id_booking;

    // Enforce one review per booking
    const [existingReview] = await db.query(
      "SELECT id_review FROM reviews WHERE id_booking = ? AND id_user = ?",
      [bookingId, userId],
    );

    if (existingReview.length > 0) {
      return res
        .status(409)
        .json({ message: "You have already reviewed this booking." });
    }

    await db.execute(
      `INSERT INTO reviews (id_property, id_user, rating, comment, id_booking)
       VALUES (?, ?, ?, ?, ?)`,
      [propertyId, userId, safeRating, String(comment).trim(), bookingId],
    );

    res.status(201).json({ message: "Review submitted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Server error while submitting review.",
      details: error.message,
    });
  }
});

// Check whether a user is eligible to leave a review for a property
app.get(
  "/api/properties/:id/review-eligibility",
  verifyToken,
  async (req, res) => {
    const userId = Number(req.user?.id);
    const propertyId = Number(req.params.id);

    if (!Number.isFinite(propertyId) || propertyId <= 0) {
      return res.status(400).json({ message: "Invalid property id." });
    }

    try {
      const [eligibleBookings] = await db.query(
        `SELECT b.id_booking FROM bookings b
       WHERE b.id_user = ?
         AND b.id_property = ?
         AND b.status = 'approved'
         AND b.end_date < CURDATE()
       LIMIT 1`,
        [userId, propertyId],
      );

      if (eligibleBookings.length === 0) {
        return res
          .status(200)
          .json({ eligible: false, alreadyReviewed: false });
      }

      const bookingId = eligibleBookings[0].id_booking;

      const [existing] = await db.query(
        "SELECT id_review FROM reviews WHERE id_booking = ? AND id_user = ?",
        [bookingId, userId],
      );

      res.status(200).json({
        eligible: true,
        alreadyReviewed: existing.length > 0,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Server error.", details: error.message });
    }
  },
);

/* =========================
   NOTIFICATION ROUTES
========================= */

// GET /api/notifications — fetch all notifications for the logged-in user (newest first)
app.get("/api/notifications", verifyToken, async (req, res) => {
  const userId = Number(req.user?.id);

  try {
    const [notifications] = await db.query(
      `SELECT
         n.id_notification,
         n.id_booking,
         n.id_property,
         n.notify_text,
         n.is_read,
         n.type,
         n.created_at,
         p.title AS property_title
       FROM notifications n
       LEFT JOIN properties p ON n.id_property = p.id_property
       WHERE n.id_user = ?
       ORDER BY n.created_at DESC`,
      [userId],
    );

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching notifications.",
      details: error.message,
    });
  }
});

// PUT /api/notifications/mark-all-read — mark ALL notifications as read for the user
// NOTE: must be declared BEFORE /:id/read so Express matches it first
app.put("/api/notifications/mark-all-read", verifyToken, async (req, res) => {
  const userId = Number(req.user?.id);

  try {
    await db.execute(
      "UPDATE notifications SET is_read = 1 WHERE id_user = ? AND is_read = 0",
      [userId],
    );

    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({
      message: "Server error while marking notifications as read.",
      details: error.message,
    });
  }
});

// PUT /api/notifications/:id/read — mark a single notification as read
app.put("/api/notifications/:id/read", verifyToken, async (req, res) => {
  const userId = Number(req.user?.id);
  const notificationId = Number(req.params.id);

  if (!Number.isFinite(notificationId) || notificationId <= 0) {
    return res.status(400).json({ message: "Invalid notification id." });
  }

  try {
    // Verify ownership before updating
    const [rows] = await db.query(
      "SELECT id_notification FROM notifications WHERE id_notification = ? AND id_user = ?",
      [notificationId, userId],
    );

    if (rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this notification." });
    }

    await db.execute(
      "UPDATE notifications SET is_read = 1 WHERE id_notification = ?",
      [notificationId],
    );

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating notification.",
      details: error.message,
    });
  }
});

// API for favorites
app.post("/api/favorites/toggle", verifyToken, async (req, res) => {
  const id_user = getUserIdFromRequest(req);
  const id_property = Number(req.body?.id_property);

  if (!id_user) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  if (!Number.isFinite(id_property) || id_property <= 0) {
    return res.status(400).json({ message: "Invalid property id." });
  }

  try {
    const [properties] = await db.execute(
      "SELECT id_property FROM properties WHERE id_property = ? AND status = 'approved' LIMIT 1",
      [id_property],
    );

    if (properties.length === 0) {
      return res
        .status(404)
        .json({ message: "Property not found or not available." });
    }

    const [existing] = await db.execute(
      "SELECT id_favorite FROM favorites WHERE id_user = ? AND id_property = ?",
      [id_user, id_property],
    );

    if (existing.length > 0) {
      await db.execute(
        "DELETE FROM favorites WHERE id_user = ? AND id_property = ?",
        [id_user, id_property],
      );
      return res.json({ message: "Removed from favorites", saved: false });
    } else {
      await db.execute(
        "INSERT INTO favorites (id_user, id_property) VALUES (?, ?)",
        [id_user, id_property],
      );
      return res.json({ message: "Added to favorites", saved: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/favorites and legacy /api/favorites/:userId
const getFavoritesForCurrentUser = async (req, res) => {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT
        p.*,
        c.name AS city_name,
        (
          SELECT image_url
          FROM property_images
          WHERE id_property = p.id_property
          ORDER BY is_main DESC
          LIMIT 1
        ) AS main_image
      FROM properties p
      JOIN favorites f ON p.id_property = f.id_property
      LEFT JOIN cities c ON p.id_city = c.id_city
      WHERE f.id_user = ?
        AND p.status = 'approved'
      ORDER BY f.id_favorite DESC
    `,
      [userId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.get("/api/favorites", verifyToken, getFavoritesForCurrentUser);
app.get("/api/favorites/:userId", verifyToken, getFavoritesForCurrentUser);

/* =========================
   SUPPORT ROUTE
========================= */

app.post("/api/support", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  if (!adminEmail || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email configuration missing. Could not send support email.");
    return res.status(500).json({ message: "Server email configuration is missing." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  try {
    await transporter.sendMail({
      from: `"Dar Darek Support" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Support Request: ${subject}`,
      html: `
        <h3>New Support Request from Dar Darek</h3>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      `,
    });
    res.status(200).json({ message: "Support request sent successfully." });
  } catch (error) {
    console.error("Failed to send support email:", error);
    res.status(500).json({ message: "Failed to send support request.", details: error.message });
    }
});

/* =========================
   404 CATCH-ALL & ERROR HANDLER
========================= */

app.use("/api/*path", (req, res) => {
  res.status(404).json({
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, _next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    message: "An unexpected server error occurred.",
    details: process.env.NODE_ENV !== "production" ? err.message : undefined,
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
