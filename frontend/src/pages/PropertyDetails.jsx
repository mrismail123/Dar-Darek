import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./PropertyDetails.css";
import { useToken } from "../Contexts/TokenContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../Home components/Header";
import Footer from "../Footer";
import { useThemeGlobal } from "../Contexts/ThemeContext";
import { buildApiUrl, createAuthConfig } from "../lib/api";
import { getPropertyTypeLabel } from "../lib/propertyTypes";
import SuccessAlert from "../SuccessAlert";
import NotFound from "./NotFound";
import {
  FiAirplay,
  FiBox,
  FiBriefcase,
  FiCamera,
  FiCoffee,
  FiDroplet,
  FiFeather,
  FiFlag,
  FiHeart,
  FiInfo,
  FiMonitor,
  FiShield,
  FiShare,
  FiThermometer,
  FiTruck,
  FiTv,
  FiUsers,
  FiWifi,
  FiWind,
  FiZap,
} from "react-icons/fi";
import {
  FaBath,
  FaBed,
  FaBaby,
  FaBabyCarriage,
  FaBookReader,
  FaChair,
  FaConciergeBell,
  FaFireExtinguisher,
  FaHome,
  FaKey,
  FaMountain,
  FaParking,
  FaPaw,
  FaShower,
  FaSink,
  FaSnowflake,
  FaStoreAlt,
  FaSwimmingPool,
  FaTree,
  FaUmbrellaBeach,
  FaUtensils,
  FaWarehouse,
  FaWater,
} from "react-icons/fa";

const mockProperty = {
  brand: "Dar Darek",
  title: "Bright apartment with ocean views",
  propertyType: "Appartement",
  city: "Tangier",
  neighborhood: "Malabata",
  address: "Boulevard Mohamed VI, Malabata, Tangier",
  coordinates: {
    lat: 35.7767,
    lng: -5.8039,
  },
  guests: 4,
  bedrooms: 2,
  beds: 3,
  bathrooms: 1,
  pricePerNight: 750,
  cleaningFee: 150,
  serviceFee: 90,
  rating: 4.86,
  reviewCount: 32,
  images: [
    // tetouanImage,
    "/dardarek-tangier-coast.jpeg",
    "/dardarek-chefchaouen.jpeg",
    "/nur-tetouan-hero.webp",
    // chaouenImage,
  ],
  description:
    "Enjoy a quiet, bright, and carefully equipped apartment, ideal for discovering Tangier while keeping the comfort of a real home. The living room opens up to beautiful natural light, the bedrooms are prepared for a restful stay, and the neighborhood allows easy access to the beach, restaurants, and the city's must-see spots.",
  highlights: [
    {
      title: "Entire home",
      text: "You'll have the apartment entirely to yourself.",
      icon: "home",
    },
    {
      title: "Exceptional views",
      text: "Unobstructed views of the ocean and the city.",
      icon: "view",
    },
    {
      title: "Self check-in",
      text: "Simple and flexible entry tailored to your schedule.",
      icon: "key",
    },
    {
      title: "Great location",
      text: "Close to the corniche, cafes, and public transport.",
      icon: "pin",
    },
  ],
  amenities: [
    { label: "Fast WiFi", icon: "wifi" },
    { label: "Fully equipped kitchen", icon: "kitchen" },
    { label: "Air conditioning", icon: "snow" },
    { label: "Free parking", icon: "parking" },
    { label: "Washing machine", icon: "washer" },
    { label: "Dedicated workspace", icon: "desk" },
    { label: "TV", icon: "tv" },
    { label: "Hot water", icon: "shower" },
    { label: "Balcony with a view", icon: "balcony" },
    { label: "Coffee maker", icon: "coffee" },
    { label: "Bed linens and towels", icon: "linen" },
    { label: "Hair dryer", icon: "dryer" },
  ],
  ratingBreakdown: [
    { label: "Cleanliness", score: 4.9 },
    { label: "Accuracy", score: 4.8 },
    { label: "Check-in", score: 4.9 },
    { label: "Communication", score: 4.9 },
    { label: "Location", score: 4.7 },
    { label: "Value", score: 4.8 },
  ],
  reviews: [
    {
      name: "Sarah",
      date: "March 2026",
      text: "Very clean, bright, and well-located apartment. Communication was quick and check-in was stress-free.",
    },
    {
      name: "Youssef",
      date: "February 2026",
      text: "Pleasant stay in Malabata. The accommodation is comfortable, close to the sea, and perfect for a few days in Tangier.",
    },
  ],
  houseRules: [
    "Treat the property with respect",
    "Respect the neighborhood",
    "No unauthorized parties",
  ],
  cancellationPolicy:
    "Flexible cancellation during the booking phase. Final terms will be confirmed before payment.",
  thingsToKnow: [
    "ID required upon arrival",
    "Quiet neighborhood in the evening",
    "Suitable for short and medium stays",
  ],
  host: {
    name: "Nadia",
    avatarInitials: "ND",
    rating: 4.9,
    yearsHosting: 3,
    reviews: 86,
    responseRate: "98%",
    responseTime: "Usually responds within an hour",
    verified: true,
    bio: "Passionate about Moroccan hospitality, I ensure every stay is memorable. As a Tangier local, I know the best spots in the city.",
  },
  bookingDefaults: {
    checkIn: "2026-05-08",
    checkOut: "2026-05-12",
    guests: 2,
  },
};

// Emoji/symbol icon map — no external library needed
const iconMap = {
  home: "🏠",
  view: "🌊",
  key: "🗝️",
  pin: "📍",
  wifi: "📶",
  kitchen: "🍳",
  snow: "❄️",
  parking: "🅿️",
  washer: "🫧",
  desk: "💻",
  tv: "📺",
  shower: "🚿",
  balcony: "🌅",
  coffee: "☕",
  linen: "🛏️",
  dryer: "💨",
  rules: "📋",
  clock: "🕒",
  pool: "🏊",
  cancel: "↩️",
  info: "ℹ️",
};

const formatTime = (timeStr, fallback = "") => {
  if (!timeStr) return fallback;

  const parts = String(timeStr).split(":");
  if (parts.length >= 2) {
    return parts.slice(0, 2).join(":");
  }

  return String(timeStr);
};

const parseLocalDate = (dateValue) => {
  if (!dateValue) return null;

  const [year, month, day] = String(dateValue).split("T")[0].split("-");
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const normalizeBookedRange = (range) => {
  const startDate = String(range.start_date || range.startDate || "").split(
    "T",
  )[0];
  const endDate = String(range.end_date || range.endDate || "").split("T")[0];

  return {
    startDate,
    endDate,
    status: range.status,
  };
};

const isValidBookedRange = (range) => {
  const startDate = parseLocalDate(range.startDate);
  const endDate = parseLocalDate(range.endDate);

  return Boolean(startDate && endDate && endDate > startDate);
};

const isDateInBookedRange = (dateValue, bookedRanges = []) => {
  const selectedDate = parseLocalDate(dateValue);
  if (!selectedDate) return false;

  return bookedRanges.some((range) => {
    const startDate = parseLocalDate(range.startDate);
    const endDate = parseLocalDate(range.endDate);

    return (
      startDate &&
      endDate &&
      selectedDate >= startDate &&
      selectedDate < endDate
    );
  });
};

const doesDateRangeOverlapBooking = (checkIn, checkOut, bookedRanges = []) => {
  const requestedStart = parseLocalDate(checkIn);
  const requestedEnd = parseLocalDate(checkOut);

  if (!requestedStart || !requestedEnd || requestedEnd <= requestedStart) {
    return false;
  }

  return bookedRanges.some((range) => {
    const existingStart = parseLocalDate(range.startDate);
    const existingEnd = parseLocalDate(range.endDate);

    return (
      existingStart &&
      existingEnd &&
      requestedStart < existingEnd &&
      requestedEnd > existingStart
    );
  });
};

const formatPolicyDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(amount);

const getNightCount = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();

  if (!checkIn || !checkOut || Number.isNaN(diff) || diff <= 0) {
    return 1;
  }

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const withFallback = (value, fallback) =>
  value === undefined || value === null || value === "" ? fallback : value;

const numberWithFallback = (value, fallback) => {
  const number = Number(withFallback(value, fallback));
  return Number.isFinite(number) ? number : fallback;
};

const asArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : [value];
  } catch {
    return [value];
  }
};

const normalizeImages = (images) => {
  const imageList = asArray(images);

  if (imageList.length === 0) {
    return mockProperty.images;
  }

  const normalizedImages = imageList
    .filter(Boolean)
    .map((image) => {
      if (typeof image !== "string") {
        return image?.url || image?.path || image?.src || "";
      }

      return image.startsWith("/uploads") ? buildApiUrl(image) : image;
    })
    .filter(Boolean);

  return normalizedImages.length > 0 ? normalizedImages : mockProperty.images;
};

const normalizeDisplayList = (value) =>
  asArray(value)
    .map((item) => String(item || "").trim())
    .filter(Boolean);

const LEGACY_AMENITY_ICON_MAP = {
  wifi: "📶",
  hotWater: "🚿",
  sheets: "🛏️",
  towels: "🧺",
  toiletries: "🧴",
  refrigerator: "🧊",

  kitchen: "🍽️",
  microwave: "📦",
  oven: "🔥",
  kettle: "🫖",
  coffeeMachine: "☕",
  dishes: "🍽️",

  airConditioning: "❄️",
  heating: "🔥",
  washingMachine: "🫧",
  dryer: "🧺",
  tv: "📺",
  sofa: "🛋️",

  workspace: "💼",
  desk: "🪑",
  fastWifi: "⚡",
  smartTv: "🖥️",

  balcony: "🪴",
  terrace: "🌇",
  seaView: "🌊",
  mountainView: "⛰️",
  medinaView: "🕌",
  natureView: "🌿",
  beachAccess: "🏖️",
  pool: "🏊",
  bbq: "🔥",
  garden: "🌴",

  breakfast: "🥐",
  parking: "🅿️",
  petFriendly: "🐾",
  housekeeping: "🧹",
  airportShuttle: "🚐",
  reception: "🛎️",

  smokeDetector: "🚨",
  fireExtinguisher: "🧯",
  outdoorCamera: "📷",
  safeBox: "🔒",
};

const amenityIconMap = {
  wifi: FiWifi,
  hotWater: FaShower,
  sheets: FaBed,
  towels: FaSink,
  toiletries: FiDroplet,
  hairDryer: FiWind,
  refrigerator: FiBox,

  kitchen: FaUtensils,
  microwave: FiBox,
  oven: FiThermometer,
  kettle: FiCoffee,
  coffeeMachine: FiCoffee,
  dishes: FaUtensils,

  airConditioning: FaSnowflake,
  heating: FiThermometer,
  washingMachine: FiDroplet,
  dryer: FiWind,
  tv: FiTv,
  sofa: FaChair,

  workspace: FiBriefcase,
  desk: FaChair,
  fastWifi: FiZap,
  smartTv: FiAirplay,

  crib: FaBabyCarriage,
  childrenBooksToys: FaBookReader,
  babyBath: FaBath,
  windowGuards: FiShield,
  highChair: FaChair,
  babyMonitor: FiMonitor,

  balcony: FaStoreAlt,
  terrace: FaWarehouse,
  seaView: FaWater,
  mountainView: FaMountain,
  medinaView: FaStoreAlt,
  natureView: FaTree,
  beachAccess: FaUmbrellaBeach,
  pool: FaSwimmingPool,
  bbq: FiZap,
  garden: FaTree,

  breakfast: FiCoffee,
  parking: FaParking,
  petFriendly: FaPaw,
  housekeeping: FiFeather,
  airportShuttle: FiTruck,
  reception: FaConciergeBell,

  smokeDetector: FiShield,
  fireExtinguisher: FaFireExtinguisher,
  outdoorCamera: FiCamera,
  safeBox: FiShield,
  services: FiInfo,
};

const amenityLabelToKeyMap = {
  WiFi: "wifi",
  "Hot water": "hotWater",
  "Bed linens": "sheets",
  Towels: "towels",
  Toiletries: "toiletries",
  "Hair dryer": "hairDryer",
  Refrigerator: "refrigerator",

  Kitchen: "kitchen",
  Microwave: "microwave",
  Oven: "oven",
  Kettle: "kettle",
  "Coffee machine": "coffeeMachine",
  Dishes: "dishes",

  "Air Conditioning": "airConditioning",
  "Air conditioning": "airConditioning",
  Heating: "heating",
  "Washing machine": "washingMachine",
  Dryer: "dryer",
  Television: "tv",
  tv: "tv",
  "Comfortable sofa": "sofa",

  Workspace: "workspace",
  Desk: "desk",
  "Fast WiFi": "fastWifi",
  "Smart TV": "smartTv",
  Crib: "crib",
  "Children books/toys": "childrenBooksToys",
  "Baby bath": "babyBath",
  "Window guards": "windowGuards",
  "High chair": "highChair",
  "Baby monitor": "babyMonitor",

  Balcony: "balcony",
  Terrace: "terrace",
  "Sea View": "seaView",
  "Sea view": "seaView",
  "Mountain view": "mountainView",
  "Medina view": "medinaView",
  "Nature view": "natureView",
  "Beach access": "beachAccess",
  Pool: "pool",
  BBQ: "bbq",
  Garden: "garden",

  Breakfast: "breakfast",
  Parking: "parking",
  "Pet friendly": "petFriendly",
  Housekeeping: "housekeeping",
  "Airport shuttle": "airportShuttle",
  Reception: "reception",

  "Smoke detector": "smokeDetector",
  "Fire extinguisher": "fireExtinguisher",
  "Outdoor camera": "outdoorCamera",
  "Safe box": "safeBox",
};

const amenityGroups = [
  {
    title: "Essentials",
    keys: ["wifi", "sheets", "refrigerator"],
  },
  {
    title: "Bathroom",
    keys: ["hotWater", "towels", "toiletries", "hairDryer"],
  },
  {
    title: "Kitchen",
    keys: [
      "kitchen",
      "microwave",
      "oven",
      "kettle",
      "coffeeMachine",
      "dishes",
      "refrigerator",
    ],
  },
  {
    title: "Comfort",
    keys: [
      "airConditioning",
      "heating",
      "washingMachine",
      "dryer",
      "tv",
      "sofa",
    ],
  },
  {
    title: "Work & Tech",
    keys: ["workspace", "desk", "fastWifi", "smartTv"],
  },
  {
    title: "Family & Children",
    keys: [
      "crib",
      "childrenBooksToys",
      "babyBath",
      "windowGuards",
      "highChair",
      "babyMonitor",
    ],
  },
  {
    title: "Outdoor & Views",
    keys: [
      "balcony",
      "terrace",
      "seaView",
      "mountainView",
      "medinaView",
      "natureView",
      "beachAccess",
      "pool",
      "bbq",
      "garden",
    ],
  },
  {
    title: "Services",
    keys: [
      "breakfast",
      "parking",
      "petFriendly",
      "housekeeping",
      "airportShuttle",
      "reception",
    ],
  },
  {
    title: "Safety",
    keys: ["smokeDetector", "fireExtinguisher", "outdoorCamera", "safeBox"],
  },
];

const getAmenityKey = (amenityName = "") => {
  const rawName = String(amenityName).trim();
  const mappedKey = amenityLabelToKeyMap[rawName];

  if (mappedKey) {
    return mappedKey;
  }

  if (amenityIconMap[rawName]) {
    return rawName;
  }

  const name = rawName.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();

  if (name.includes("fast") && name.includes("wifi")) return "fastWifi";
  if (name.includes("wifi")) return "wifi";
  if (name.includes("hot water")) return "hotWater";
  if (name.includes("sheet") || name.includes("linen")) return "sheets";
  if (name.includes("towel")) return "towels";
  if (name.includes("toiletr")) return "toiletries";
  if (name.includes("hair dryer") || name.includes("hairdryer"))
    return "hairDryer";
  if (name.includes("refrigerator") || name.includes("fridge"))
    return "refrigerator";

  if (name.includes("kitchen") || name.includes("cuisine")) return "kitchen";
  if (name.includes("microwave")) return "microwave";
  if (name.includes("oven")) return "oven";
  if (name.includes("kettle")) return "kettle";
  if (name.includes("coffee")) return "coffeeMachine";
  if (name.includes("dishes")) return "dishes";

  if (name.includes("air") || name.includes("clim")) return "airConditioning";
  if (name.includes("heating")) return "heating";
  if (name.includes("washing") || name.includes("lave"))
    return "washingMachine";
  if (name.includes("dryer") || name.includes("sèche")) return "dryer";
  if (name.includes("smart tv")) return "smartTv";
  if (name.includes("tv") || name.includes("television")) return "tv";
  if (name.includes("sofa")) return "sofa";

  if (name.includes("workspace")) return "workspace";
  if (name.includes("desk")) return "desk";
  if (name.includes("crib")) return "crib";
  if (name.includes("children") || name.includes("toy"))
    return "childrenBooksToys";
  if (name.includes("baby bath")) return "babyBath";
  if (name.includes("window guard")) return "windowGuards";
  if (name.includes("high chair")) return "highChair";
  if (name.includes("baby monitor")) return "babyMonitor";

  if (name.includes("balcony") || name.includes("balcon")) return "balcony";
  if (name.includes("terrace")) return "terrace";
  if (name.includes("sea view")) return "seaView";
  if (name.includes("mountain view")) return "mountainView";
  if (name.includes("medina view")) return "medinaView";
  if (name.includes("nature view")) return "natureView";
  if (name.includes("beach")) return "beachAccess";
  if (name.includes("pool") || name.includes("piscine")) return "pool";
  if (name.includes("bbq")) return "bbq";
  if (name.includes("garden") || name.includes("jardin")) return "garden";

  if (name.includes("breakfast")) return "breakfast";
  if (name.includes("parking")) return "parking";
  if (name.includes("pet")) return "petFriendly";
  if (name.includes("housekeeping")) return "housekeeping";
  if (name.includes("airport")) return "airportShuttle";
  if (name.includes("reception")) return "reception";

  if (name.includes("smoke")) return "smokeDetector";
  if (name.includes("fire")) return "fireExtinguisher";
  if (name.includes("camera")) return "outdoorCamera";
  if (name.includes("safe")) return "safeBox";

  return "services";
};

const getAmenityGroups = (amenities) => {
  const groupedAmenities = amenityGroups.map((group) => ({
    ...group,
    amenities: [],
  }));

  amenities.forEach((amenity) => {
    const key = amenity.key || getAmenityKey(amenity.label);
    const group =
      groupedAmenities.find((item) => item.keys.includes(key)) ||
      groupedAmenities.find((item) => item.title === "Services");

    group.amenities.push({ ...amenity, key });
  });

  return groupedAmenities.filter((group) => group.amenities.length > 0);
};

const amenityDetails = {
  wifi: {
    badge: "Popular",
    description: "Reliable internet access for work or streaming.",
  },
  fastWifi: {
    badge: "Popular",
    description: "Better speed for calls, work, and streaming.",
  },
  hotWater: {
    badge: "Essential",
    description: "Comfortable showers at any time of day.",
  },
  sheets: {
    badge: "Essential",
    description: "Fresh linens prepared for every stay.",
  },
  towels: {
    badge: "Essential",
    description: "Clean towels available for guests.",
  },
  toiletries: {
    description: "Basic bathroom products for a smoother arrival.",
  },
  hairDryer: {
    description: "Useful after showers or beach days.",
  },
  kitchen: {
    badge: "Guest favorite",
    description: "A practical space for preparing meals.",
  },
  coffeeMachine: {
    badge: "Popular",
    description: "A welcome touch for morning coffee.",
  },
  workspace: {
    badge: "Guest favorite",
    description: "A comfortable spot for laptop work.",
  },
  airConditioning: {
    badge: "Popular",
    description: "Keeps the home cool during warm days.",
  },
  crib: {
    badge: "Family friendly",
    description: "Useful for families traveling with infants.",
  },
  childrenBooksToys: {
    badge: "Family friendly",
    description: "Simple entertainment for younger guests.",
  },
  babyBath: {
    description: "Makes bath time easier for infants.",
  },
  windowGuards: {
    description: "Extra protection around accessible windows.",
  },
  highChair: {
    description: "Helpful for meals with small children.",
  },
  babyMonitor: {
    description: "Useful for keeping an eye on sleeping infants.",
  },
  parking: {
    badge: "Popular",
    description: "Convenient parking option near the stay.",
  },
  beachAccess: {
    badge: "Popular",
    description: "Easy access to the beach nearby.",
  },
  pool: {
    badge: "Popular",
    description: "A pool available for guest use.",
  },
  seaView: {
    badge: "Guest favorite",
    description: "A view toward the coast or open water.",
  },
  terrace: {
    badge: "Guest favorite",
    description: "Outdoor space for relaxing or dining.",
  },
  breakfast: {
    badge: "Guest favorite",
    description: "A convenient start to the morning.",
  },
  smokeDetector: {
    badge: "Essential",
    description: "Alerts guests to smoke inside the property.",
  },
  fireExtinguisher: {
    badge: "Essential",
    description: "A safety item for emergency use.",
  },
};

const getAmenityDetail = (amenity) => {
  const key = amenity.key || getAmenityKey(amenity.label);

  return {
    badge: amenity.badge || amenityDetails[key]?.badge || "",
    description:
      amenity.description ||
      amenityDetails[key]?.description ||
      "A helpful feature included with this stay.",
  };
};

const getSafetyItems = (amenities) => {
  const availableKeys = new Set(
    amenities.map((amenity) => amenity.key || getAmenityKey(amenity.label)),
  );

  return [
    {
      key: "smokeDetector",
      present: "Smoke detector available",
      missing: "No smoke detector listed",
    },
    {
      key: "fireExtinguisher",
      present: "Fire extinguisher available",
      missing: "No fire extinguisher listed",
    },
    {
      key: "outdoorCamera",
      present: "Outdoor camera present",
      missing: "No outdoor camera listed",
    },
    {
      key: "safeBox",
      present: "Safe box available",
      missing: "No safe box listed",
    },
  ].map((item) => (availableKeys.has(item.key) ? item.present : item.missing));
};

const getHostName = (host) => host?.name || "Host";

const getHostSubline = (host) => {
  const nationality = String(host?.nationality || "").trim();
  return nationality ? `${nationality} host` : "Host";
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const normalizePublicImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";
  return image.startsWith("/uploads") ? buildApiUrl(image) : image;
};

const scrollToHost = () => {
  document
    .getElementById("host-section")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const getAmenityIcon = (amenityName = "") => {
  const rawName = String(amenityName).trim();

  const directKey = amenityIconMap[rawName];
  if (directKey) {
    return directKey;
  }

  const mappedKey = amenityLabelToKeyMap[rawName];
  if (mappedKey && amenityIconMap[mappedKey]) {
    return amenityIconMap[mappedKey];
  }

  const name = rawName.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();

  if (name.includes("wifi")) return "📶";
  if (name.includes("hot water")) return "🚿";
  if (name.includes("sheet") || name.includes("linen")) return "🛏️";
  if (name.includes("towel")) return "🧺";
  if (name.includes("toiletr")) return "🧴";
  if (name.includes("refrigerator") || name.includes("fridge")) return "🧊";

  if (name.includes("kitchen") || name.includes("cuisine")) return "🍽️";
  if (name.includes("microwave")) return "📦";
  if (name.includes("oven")) return "🔥";
  if (name.includes("kettle")) return "🫖";
  if (name.includes("coffee")) return "☕";
  if (name.includes("dishes")) return "🍽️";

  if (name.includes("air") || name.includes("clim")) return "❄️";
  if (name.includes("heating")) return "🔥";
  if (name.includes("washing") || name.includes("lave")) return "🫧";
  if (name.includes("dryer") || name.includes("sèche")) return "🧺";
  if (name.includes("tv") || name.includes("television")) return "📺";
  if (name.includes("sofa")) return "🛋️";

  if (name.includes("workspace")) return "💼";
  if (name.includes("desk")) return "🪑";
  if (name.includes("smart tv")) return "🖥️";

  if (name.includes("balcony") || name.includes("balcon")) return "🪴";
  if (name.includes("terrace")) return "🌇";
  if (name.includes("sea view")) return "🌊";
  if (name.includes("mountain view")) return "⛰️";
  if (name.includes("medina view")) return "🕌";
  if (name.includes("nature view")) return "🌿";
  if (name.includes("beach")) return "🏖️";
  if (name.includes("pool") || name.includes("piscine")) return "🏊";
  if (name.includes("bbq")) return "🔥";
  if (name.includes("garden") || name.includes("jardin")) return "🌴";

  if (name.includes("breakfast")) return "🥐";
  if (name.includes("parking")) return "🅿️";
  if (name.includes("pet")) return "🐾";
  if (name.includes("housekeeping")) return "🧹";
  if (name.includes("airport")) return "🚐";
  if (name.includes("reception")) return "🛎️";

  if (name.includes("smoke")) return "🚨";
  if (name.includes("fire")) return "🧯";
  if (name.includes("camera")) return "📷";
  if (name.includes("safe")) return "🔒";

  return "ℹ️";
};

const normalizeAmenities = (amenities) => {
  const amenityList = asArray(amenities);
  const fallbackAmenities = mockProperty.amenities.map((amenity) => ({
    label: amenity.label,
    icon: getAmenityIcon(amenity.label || amenity.icon),
    key: getAmenityKey(amenity.label || amenity.icon),
  }));

  if (amenityList.length === 0) {
    return fallbackAmenities;
  }

  const normalizedAmenities = amenityList
    .map((amenity) => {
      if (typeof amenity === "string") {
        return {
          label: amenity,
          icon: getAmenityIcon(amenity),
          key: getAmenityKey(amenity),
        };
      }

      return {
        label: withFallback(amenity?.label || amenity?.name, ""),
        icon: getAmenityIcon(amenity?.label || amenity?.name || amenity?.icon),
        key: getAmenityKey(amenity?.label || amenity?.name || amenity?.icon),
      };
    })
    .filter((amenity) => amenity.label);

  return normalizedAmenities.length > 0
    ? normalizedAmenities
    : fallbackAmenities;
};

const normalizeProperty = (property) => {
  if (!property) {
    return {
      ...mockProperty,
      amenities: normalizeAmenities(mockProperty.amenities),
      checkInTime: "15:00",
      checkOutTime: "11:00",
    };
  }

  return {
    ...mockProperty,
    id: withFallback(property.id_property || property.id, mockProperty.id),
    id_owner: property.id_owner || property.owner_id || property.id_user || null,
    title: withFallback(property.title, mockProperty.title),
    description: withFallback(property.description, mockProperty.description),
    city: withFallback(property.city || property.city_name, mockProperty.city),
    neighborhood: withFallback(
      property.neighborhood,
      mockProperty.neighborhood,
    ),
    address: withFallback(property.address, mockProperty.address),
    propertyType: withFallback(
      property.property_type,
      mockProperty.propertyType,
    ),
    coordinates: {
      lat: Number.isFinite(Number(property.latitude))
        ? Number(property.latitude)
        : null,
      lng: Number.isFinite(Number(property.longitude))
        ? Number(property.longitude)
        : null,
    },
    guests: numberWithFallback(property.guests_total, mockProperty.guests),
    bedrooms: numberWithFallback(property.bedrooms, mockProperty.bedrooms),
    bathrooms: numberWithFallback(property.bathrooms, mockProperty.bathrooms),
    beds: numberWithFallback(property.beds, mockProperty.beds),
    pricePerNight: numberWithFallback(
      property.price_per_day,
      mockProperty.pricePerNight,
    ),
    rating: null,
    reviewCount: 0,
    ratingBreakdown: [],
    reviews: [],
    images: normalizeImages(property.images),
    amenities: normalizeAmenities(property.amenities),
    bookingDefaults: {
      checkIn: withFallback(
        property.available_from?.split("T")[0],
        mockProperty.bookingDefaults.checkIn,
      ),
      checkOut: withFallback(
        property.available_to?.split("T")[0],
        mockProperty.bookingDefaults.checkOut,
      ),
      guests: numberWithFallback(
        property.guests_total,
        mockProperty.bookingDefaults.guests,
      ),
    },
    checkInTime: formatTime(property.check_in, "15:00"),
    checkOutTime: formatTime(property.check_out, "11:00"),
    availableFrom: property.available_from?.split("T")[0],
    availableTo: property.available_to?.split("T")[0],
    accessInstructions: property.access_instructions || "",
    neighborhoodDescription: property.neighborhood_description || "",
    houseRules: [
      "Treat the property with respect",
      "Respect the neighborhood",
      "No unauthorized parties",
    ],
    host: {
      profilePicture: normalizePublicImageUrl(
        property.host?.profilePicture ||
          property.host?.profile_picture ||
          property.host_profile_picture,
      ),
      name: withFallback(
        property.host?.name || property.host_name || property.owner_name,
        "Host",
      ),
      avatarInitials: withFallback(
        property.host?.avatarInitials ||
          property.host_initials ||
          getInitials(property.host?.name || property.host_name || ""),
        "DD",
      ),
      role: property.host?.role || property.host_role || null,
      verified: Boolean(property.host?.verified || property.host_verified),
      rating: null,
      reviews: 0,
      responseRate: null,
      responseTime: null,
      yearsHosting: null,
      bio: property.host?.bio || property.host_bio || property.host_description || null,
      email: property.host?.email || property.host_email || "",
      nationality: property.host?.nationality || property.host_nationality || "",
      languages: normalizeDisplayList(
        property.host?.languages || property.host_languages,
      ),
      createdAt: property.host?.createdAt || property.host_created_at || "",
    },
    host_name: withFallback(
      property.host?.name || property.host_name || property.owner_name,
      "Host",
    ),
    host_phone:
      property.host_phone || property.host?.phone || property.phone || "",
    host_email: property.host_email || property.host?.email || "",
  };
};

function PropertyGallery({ property }) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const selectedPhoto =
    selectedPhotoIndex === null ? null : property.images[selectedPhotoIndex];
  const showPreviousPhoto = () =>
    setSelectedPhotoIndex((currentIndex) =>
      currentIndex === null
        ? 0
        : (currentIndex - 1 + property.images.length) % property.images.length,
    );
  const showNextPhoto = () =>
    setSelectedPhotoIndex((currentIndex) =>
      currentIndex === null ? 0 : (currentIndex + 1) % property.images.length,
    );

  return (
    <>
      <section className="pd-gallery">
        <div className="pd-gallery__main">
          <img src={property.images[0]} alt="Main" />
        </div>

        <div className="pd-gallery__grid">
          {property.images.slice(1, 5).map((img, index) => (
            <div key={index} className="pd-gallery__tile">
              <img src={img} alt={`Photo ${index + 2}`} />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="pd-gallery__btn"
          onClick={() => setShowAllPhotos(true)}
        >
          Show all photos
        </button>
      </section>

      {showAllPhotos && (
        <div className="pd-photo-modal" role="dialog" aria-modal="true">
          <div className="pd-photo-modal__panel">
            <button
              type="button"
              className="pd-photo-modal__close"
              onClick={() => setShowAllPhotos(false)}
              aria-label="Close photo gallery"
            >
              ✕
            </button>

            <span className="pd-photo-modal__eyebrow">
              {property.images.length} photos
            </span>
            <h2 className="pd-photo-modal__title">Photos</h2>

            <div className="pd-photo-modal__grid">
              {property.images.map((img, index) => (
                <button
                  type="button"
                  className="pd-photo-modal__item"
                  key={index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  aria-label={`Open photo ${index + 1}`}
                >
                  <img src={img} alt={`Photo ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedPhoto && (
        <div className="pd-photo-viewer" role="dialog" aria-modal="true">
          <button
            type="button"
            className="pd-photo-viewer__close"
            onClick={() => setSelectedPhotoIndex(null)}
            aria-label="Close image preview"
          >
            ✕
          </button>

          {property.images.length > 1 && (
            <>
              <button
                type="button"
                className="pd-photo-viewer__nav pd-photo-viewer__nav--prev"
                onClick={showPreviousPhoto}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                className="pd-photo-viewer__nav pd-photo-viewer__nav--next"
                onClick={showNextPhoto}
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}

          <figure className="pd-photo-viewer__image-wrap">
            <img src={selectedPhoto} alt="Enlarged property photo" />
            <figcaption>
              Photo {selectedPhotoIndex + 1} of {property.images.length}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

const scrollToAvailability = () => {
  document
    .getElementById("availability-section")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

function PropertyDetailsLoading() {
  return (
    <>
      <section
        className="pd-section pd-title-card pd-loading-title"
        aria-live="polite"
        aria-label="Loading property details"
      >
        <span className="pd-skeleton pd-skeleton--title" />
        <span className="pd-skeleton pd-skeleton--location" />
      </section>

      <section className="pd-loading-gallery" aria-hidden="true">
        <div className="pd-loading-gallery__main">
          <span className="pd-skeleton pd-skeleton--fill" />
        </div>
        <div className="pd-loading-gallery__grid">
          {[1, 2, 3, 4].map((item) => (
            <span className="pd-skeleton pd-skeleton--fill" key={item} />
          ))}
        </div>
      </section>

      <section className="pd-layout pd-loading-layout" aria-hidden="true">
        <div className="pd-content">
          <section className="pd-summary pd-loading-summary">
            <span className="pd-skeleton pd-skeleton--headline" />
            <div className="pd-loading-pills">
              {[1, 2, 3, 4].map((item) => (
                <span className="pd-skeleton pd-skeleton--pill" key={item} />
              ))}
            </div>
            <span className="pd-skeleton pd-skeleton--rating" />
            <div className="pd-loading-host">
              <span className="pd-skeleton pd-skeleton--avatar" />
              <div>
                <span className="pd-skeleton pd-skeleton--host-name" />
                <span className="pd-skeleton pd-skeleton--host-copy" />
              </div>
            </div>
          </section>

          <section className="pd-section pd-loading-section">
            <span className="pd-skeleton pd-skeleton--section-title" />
            <span className="pd-skeleton pd-skeleton--section-hint" />
            <div className="pd-loading-copy">
              <span className="pd-skeleton pd-skeleton--line" />
              <span className="pd-skeleton pd-skeleton--line" />
              <span className="pd-skeleton pd-skeleton--line pd-skeleton--line-short" />
            </div>
          </section>
        </div>

        <aside className="pd-booking-wrap">
          <div className="pd-booking pd-loading-booking">
            <div className="pd-loading-booking__top">
              <span className="pd-skeleton pd-skeleton--price" />
              <span className="pd-skeleton pd-skeleton--small-rating" />
            </div>
            <div className="pd-loading-booking__box">
              <span className="pd-skeleton pd-skeleton--field" />
              <span className="pd-skeleton pd-skeleton--field" />
              <span className="pd-skeleton pd-skeleton--guest-field" />
            </div>
            <span className="pd-skeleton pd-skeleton--cta" />
            <div className="pd-loading-total">
              <span className="pd-skeleton pd-skeleton--total-line" />
              <span className="pd-skeleton pd-skeleton--total-line" />
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

function BookingCard({
  property,
  dates,
  guests,
  onDateChange,
  onGuestChange,
  bookedRanges = [],
  bookingConflictMessage = "",
}) {

  // state for favorites
  const { token, user } = useToken();
  const [isSaved, setIsSaved] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState("property_accuracy");
  const [reportReason, setReportReason] = useState("");
  const [reportNotice, setReportNotice] = useState(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !property.id) {
      setIsSaved(false);
      return;
    }

    let isMounted = true;

    const fetchFavoriteState = async () => {
      try {
        const response = await axios.get(
          buildApiUrl("/api/favorites"),
          createAuthConfig(token),
        );
        if (isMounted) {
          const favorites = Array.isArray(response.data) ? response.data : [];
          setIsSaved(
            favorites.some(
              (favorite) => Number(favorite.id_property) === Number(property.id),
            ),
          );
        }
      } catch {
        if (isMounted) setIsSaved(false);
      }
    };

    fetchFavoriteState();

    return () => {
      isMounted = false;
    };
  }, [token, property.id]);

  // function for favorites hear click handling 
  const handleFavoriteClick = async (e) => {
    if (e) e.stopPropagation();

    // login required error
    if (!token || !user) {
      setAlertMessage("Please sign in before saving this property.");
      setShowAlert(true);
      return;
    }

    setFavoriteLoading(true);
    try {
      const response = await axios.post(
        buildApiUrl("/api/favorites/toggle"),
        { id_property: property.id },
        createAuthConfig(token),
      );

      setIsSaved(response.data.saved);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleReportSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setReportNotice({
        type: "error",
        text: "Please sign in before submitting a report.",
      });
      navigate("/Authentication", { state: { from: location.pathname } });
      return;
    }

    if (reportReason.trim().length < 20) {
      setReportNotice({
        type: "error",
        text: "Please describe the issue in at least 20 characters.",
      });
      return;
    }

    setReportSubmitting(true);
    setReportNotice(null);

    try {
      const response = await axios.post(
        buildApiUrl("/api/reports"),
        {
          id_property: property.id,
          category: reportCategory,
          reason: reportReason.trim(),
        },
        createAuthConfig(token),
      );

      setReportNotice({
        type: "success",
        text: response.data?.message || "Report submitted for review.",
      });
      setReportReason("");
    } catch (error) {
      setReportNotice({
        type: "error",
        text:
          error.response?.data?.message ||
          "Could not submit the report. Please try again.",
      });
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleShareClick = async () => {
    const url = window.location.href;
    const title = property.title || "Dar Darek Property";
    const text = `Check out this property: ${title}\n`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setAlertMessage("Link copied to clipboard!");
        setShowAlert(true);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const { id } = useParams();

  const nights = getNightCount(dates.checkIn, dates.checkOut);
  const hasSelectedStay = Boolean(dates.checkIn && dates.checkOut);
  const nightsTotal = nights * property.pricePerNight;
  const safeGuests = Number.isFinite(Number(guests)) ? Number(guests) : 1;
  const todayDateString = getTodayDateString();
  const checkInMinDate = getLaterDateString(
    todayDateString,
    property.availableFrom,
  );
  const checkOutMinDate = getLaterDateString(
    todayDateString,
    dates.checkIn,
    property.availableFrom,
  );

  const isValidDates = () => {
    if (!dates.checkIn || !dates.checkOut) return false;
    const checkInDate = new Date(dates.checkIn);
    const checkOutDate = new Date(dates.checkOut);
    const todayDate = new Date(todayDateString);

    if (checkInDate < todayDate || checkOutDate < todayDate) return false;
    if (checkOutDate < checkInDate) return false;
    if (
      property.availableFrom &&
      checkInDate < new Date(property.availableFrom)
    )
      return false;
    if (property.availableTo && checkOutDate > new Date(property.availableTo))
      return false;

    return true;
  };

  const isBookingValid = isValidDates();
  const [bookingNotice, setBookingNotice] = useState(null);

  // navigate
  const navigate = useNavigate();

  async function handleReserveFunction() {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setBookingNotice({
        type: "error",
        text: "Please sign in before reserving this stay.",
      });
      navigate("/Authentication", { state: { from: location.pathname } });
      return;
    }

    const userId = user?.id || user?.id_user || user?._id;
    const ownerId = property.id_owner || property.host?.id;
    
    if (userId && ownerId && String(userId) === String(ownerId)) {
        setAlertMessage("You cannot reserve your own property.");
        setShowAlert(true);
        return;
    }

    if (!dates.checkIn || !dates.checkOut) {
      setAlertMessage("Please select check-in and check-out dates.");
      setShowAlert(true);
      return;
    }

    if (!isBookingValid) {
      setAlertMessage("Please choose dates inside this property's availability window.");
      setShowAlert(true);
      return;
    }

    if (
      doesDateRangeOverlapBooking(
        dates.checkIn,
        dates.checkOut,
        bookedRanges,
      )
    ) {
      setAlertMessage("This property is already reserved for the selected dates.");
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios.get(
        buildApiUrl("/api/my-bookings"),
        createAuthConfig(currentToken)
      );
      const userBookings = Array.isArray(response.data?.bookings) ? response.data.bookings : [];
      
      const hasBooked = userBookings.some((b) => 
         (String(b.propertyId) === String(property.id) || String(b.id_property) === String(property.id)) &&
         (b.status === "upcoming" || b.status === "pending")
      );
      
      if (hasBooked) {
         setAlertMessage("You have already booked this property.");
         setShowAlert(true);
         return;
      }
    } catch (err) {
      console.error("Could not fetch user bookings for verification", err);
    }

    // ── Intercept: redirect to Checkout page instead of calling API directly ──
    navigate(`/checkout/${id}`, {
      state: {
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        propertyTitle: property.title,
        pricePerNight: property.pricePerNight,
        propertyImage: property.images?.[0] || null,
        propertyCity: property.city || "",
        lockStart: Date.now(),
      },
    });
  }

  return (
    <div className="pd-booking-wrap" style={{ zIndex: 9999 }}>
      {showAlert && (
        <SuccessAlert 
          message={alertMessage} 
          type="error" 
          onClose={() => setShowAlert(false)} 
        />
      )}
      <div className="pd-booking__actions" style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button onClick={handleShareClick} type="button" className="pd-action-btn" style={{ flex: 1, padding: "10px", minHeight: "42px", gap: "8px", borderRadius: "12px" }}>
          <FiShare style={{ fontSize: "1.15rem", color: "var(--text-muted)" }} />
          <span>Share</span>
        </button>
        <button
          onClick={handleFavoriteClick}
          type="button"
          className={`pd-action-btn${isSaved ? " pd-action-btn--active" : ""}`}
          disabled={favoriteLoading}
          style={{ flex: 1, padding: "10px", minHeight: "42px", gap: "8px", borderRadius: "12px" }}
        >
          <FiHeart style={{ fontSize: "1.15rem", color: isSaved ? "inherit" : "var(--text-muted)" }} fill={isSaved ? "currentColor" : "none"} />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
        <button
          type="button"
          className="pd-action-btn pd-action-btn--danger"
          onClick={() => {
            setReportOpen(true);
            setReportNotice(null);
          }}
          style={{ flex: 1, padding: "10px", minHeight: "42px", gap: "8px", borderRadius: "12px" }}
        >
          <FiFlag style={{ fontSize: "1.15rem", color: "#ef4444" }} />
          <span>Report</span>
        </button>
      </div>
      <aside className="pd-booking pd-card" aria-label="Booking card">
        <div className="pd-booking__top">
          <div>
            <strong>{formatCurrency(property.pricePerNight)}</strong>
            <span> per night</span>
          </div>
          <p>
            {property.reviewCount > 0
              ? `★ ${property.rating} · ${property.reviewCount} ${property.reviewCount > 1 ? "reviews" : "review"}`
              : "No reviews"}
          </p>
        </div>

        <div className="pd-booking__box">
          <label className="pd-booking__field">
            <span>Check-in</span>
            <input
              type="date"
              value={dates.checkIn}
              onFocus={scrollToAvailability}
              onChange={(event) => onDateChange("checkIn", event.target.value)}
              min={checkInMinDate}
              max={property.availableTo}
            />
          </label>
          <label className="pd-booking__field">
            <span>Check-out</span>
            <input
              type="date"
              value={dates.checkOut}
              onFocus={scrollToAvailability}
              onChange={(event) => onDateChange("checkOut", event.target.value)}
              min={checkOutMinDate}
              max={property.availableTo}
              disabled={!dates.checkIn}
            />
          </label>
          <div className="pd-booking__guest-field">
            <div>
              <span>Guests</span>
              <strong>
                {safeGuests} {safeGuests > 1 ? "guests" : "guest"}{" "}
              </strong>
            </div>
            <div className="pd-stepper">
              <button
                type="button"
                onClick={() => onGuestChange(-1)}
                disabled={guests <= 1}
              >
                -
              </button>
              <span>{safeGuests}</span>
              <button
                type="button"
                onClick={() => onGuestChange(1)}
                disabled={guests >= property.guests}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {(bookingConflictMessage || bookingNotice) && (
          <div
            className={`pd-booking-message pd-booking-message--${
              bookingNotice?.type || "warning"
            }`}
            role="status"
          >
            <span aria-hidden="true">
              {(bookingNotice?.type || "warning") === "success" ? "✓" : "!"}
            </span>
            <p>{bookingNotice?.text || bookingConflictMessage}</p>
          </div>
        )}

        <button
          // type="button"
          className="pd-primary-btn"
          onClick={handleReserveFunction}
          // disabled={!isBookingValid || Boolean(bookingConflictMessage)}
        >
          Reserve
        </button>

        <div className="pd-booking__total">
          {hasSelectedStay ? (
            <div>
              <span>
                {formatCurrency(property.pricePerNight)} x {nights}{" "}
                {nights > 1 ? "nights" : "night"}
              </span>
              <strong>{formatCurrency(nightsTotal)}</strong>
            </div>
          ) : null}
        </div>
      </aside>

      {reportOpen && (
        <div className="pd-report-modal" role="dialog" aria-modal="true">
          <div className="pd-report-modal__panel">
            <button
              type="button"
              className="pd-report-modal__close"
              onClick={() => setReportOpen(false)}
              aria-label="Close report dialog"
            >
              x
            </button>
            <h3>Report this listing</h3>
            <p>
              Share the issue with Dar Darek moderation. Reports are private and reviewed by admins.
            </p>

            {reportNotice && (
              <div
                className={`pd-booking-message pd-booking-message--${reportNotice.type}`}
                role="status"
              >
                <span aria-hidden="true">{reportNotice.type === "success" ? "✓" : "!"}</span>
                <p>{reportNotice.text}</p>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="pd-report-form">
              <label>
                <span>Reason</span>
                <select
                  value={reportCategory}
                  onChange={(event) => setReportCategory(event.target.value)}
                >
                  <option value="property_accuracy">Incorrect listing details</option>
                  <option value="safety">Safety concern</option>
                  <option value="fraud">Fraud or suspicious behavior</option>
                  <option value="host_behavior">Host behavior</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                <span>Details</span>
                <textarea
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                  rows={5}
                  minLength={20}
                  maxLength={2000}
                  placeholder="Describe what happened or what looks wrong."
                />
              </label>
              <button
                type="submit"
                className="pd-primary-btn"
                disabled={reportSubmitting}
              >
                {reportSubmitting ? "Submitting..." : "Submit report"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AmenityTile({ amenity }) {
  const AmenityIcon = amenity.icon;
  const detail = getAmenityDetail(amenity);

  return (
    <div className="pd-amenity" key={amenity.label}>
      <span className="pd-amenity__icon" aria-hidden="true">
        {typeof AmenityIcon === "function" ? (
          <AmenityIcon />
        ) : (
          <FiInfo aria-hidden="true" />
        )}
      </span>
      <span className="pd-amenity__content">
        <span className="pd-amenity__label">{amenity.label}</span>
        {detail.badge && (
          <span className="pd-amenity__badge">{detail.badge}</span>
        )}
      </span>
      <span className="pd-amenity__tooltip" role="tooltip">
        {detail.description}
      </span>
    </div>
  );
}

function AmenitiesSection({ amenities }) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const visibleAmenities = amenities.slice(0, 6);
  const groupedAmenities = getAmenityGroups(amenities);
  const hasMoreAmenities = amenities.length > 6;

  return (
    <section className="pd-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">What this place offers</h2>
        <p className="pd-section__hint">
          Top amenities for a comfortable stay.
        </p>
      </div>

      {showAllAmenities ? (
        <div className="pd-amenity-groups">
          {groupedAmenities.map((group) => (
            <div className="pd-amenity-group" key={group.title}>
              <h3>{group.title}</h3>
              <div className="pd-amenities pd-amenities--grouped">
                {group.amenities.map((amenity) => (
                  <AmenityTile amenity={amenity} key={amenity.label} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pd-amenities">
          {visibleAmenities.map((amenity) => (
            <AmenityTile amenity={amenity} key={amenity.label} />
          ))}
        </div>
      )}

      {hasMoreAmenities && (
        <button
          type="button"
          className="pd-secondary-btn"
          onClick={() => setShowAllAmenities((current) => !current)}
        >
          {showAllAmenities
            ? "✕ Hide amenities"
            : `Show all ${amenities.length - 6} amenities`}
        </button>
      )}
    </section>
  );
}

function StarRating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = "md",
}) {
  const [hovered, setHovered] = useState(null);
  const displayValue = hovered ?? value;
  const sizePx = size === "lg" ? "1.7rem" : "1.1rem";

  return (
    <span
      className="pd-star-rating"
      aria-label={`Rating: ${value} out of ${max} stars`}
      style={{ display: "inline-flex", gap: "2px" }}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = displayValue >= starValue;
        return interactive ? (
          <button
            key={starValue}
            type="button"
            aria-label={`Rate ${starValue} out of ${max}`}
            className={`pd-star ${filled ? "pd-star--filled" : "pd-star--empty"}`}
            style={{ fontSize: sizePx }}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange?.(starValue)}
          >
            ★
          </button>
        ) : (
          <span
            key={starValue}
            className={`pd-star ${filled ? "pd-star--filled" : "pd-star--empty"}`}
            aria-hidden="true"
            style={{ fontSize: sizePx }}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}

function ReviewsSection({ propertyId, hostUserId }) {
  const { token, user } = useToken();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [eligibility, setEligibility] = useState({
    eligible: false,
    alreadyReviewed: false,
  });
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Per-review reply state: { [id_review]: { open, text, submitting, error } }
  const [replyState, setReplyState] = useState({});

  const currentUserId = user?.id || user?.id_user;
  const isHost = hostUserId && currentUserId && String(hostUserId) === String(currentUserId);

  useEffect(() => {
    if (!propertyId) return;
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const res = await axios.get(
          buildApiUrl(`/api/properties/${propertyId}/reviews`),
        );
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating);
        setReviewCount(res.data.count || 0);
      } catch {
        // silent
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId || !token) return;
    const checkEligibility = async () => {
      try {
        const res = await axios.get(
          buildApiUrl(`/api/properties/${propertyId}/review-eligibility`),
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setEligibility(res.data);
      } catch {
        setEligibility({ eligible: false, alreadyReviewed: false });
      }
    };
    checkEligibility();
  }, [propertyId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (formRating === 0) {
      setFormError("Please select a star rating.");
      return;
    }
    if (formComment.trim().length < 10) {
      setFormError("Your review must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        buildApiUrl("/api/reviews"),
        {
          id_property: propertyId,
          rating: formRating,
          comment: formComment.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const newReview = {
        id_review: Date.now(),
        rating: formRating,
        comment: formComment.trim(),
        created_at: new Date().toISOString(),
        reviewer_name: user?.name || "You",
        host_reply: null,
        host_reply_at: null,
      };
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      const newAvg =
        Math.round(
          (updatedReviews.reduce((s, r) => s + Number(r.rating), 0) /
            updatedReviews.length) *
            10,
        ) / 10;
      setAvgRating(newAvg);
      setReviewCount((c) => c + 1);
      setFormSuccess(true);
      setEligibility({ eligible: true, alreadyReviewed: true });
      setFormRating(0);
      setFormComment("");
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Failed to submit review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const setReplyField = (reviewId, patch) => {
    setReplyState((prev) => ({
      ...prev,
      [reviewId]: { ...prev[reviewId], ...patch },
    }));
  };

  const handleReplySubmit = async (e, reviewId) => {
    e.preventDefault();
    const state = replyState[reviewId] || {};
    const replyText = (state.text || "").trim();
    if (replyText.length < 10) {
      setReplyField(reviewId, { error: "Reply must be at least 10 characters." });
      return;
    }
    setReplyField(reviewId, { submitting: true, error: "" });
    try {
      const res = await axios.patch(
        buildApiUrl(`/api/reviews/${reviewId}/reply`),
        { reply: replyText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Optimistically update the review in state
      setReviews((prev) =>
        prev.map((r) =>
          r.id_review === reviewId
            ? { ...r, host_reply: res.data.reply, host_reply_at: res.data.host_reply_at }
            : r,
        ),
      );
      setReplyField(reviewId, { open: false, text: "", submitting: false, error: "" });
    } catch (err) {
      setReplyField(reviewId, {
        submitting: false,
        error: err.response?.data?.message || "Failed to post reply. Please try again.",
      });
    }
  };

  const formatReviewDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4);
  const hasReviews = reviewCount > 0;
  const canSubmit =
    token && eligibility.eligible && !eligibility.alreadyReviewed;

  return (
    <section className="pd-section pd-reviews" id="reviews-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Guest reviews</h2>
        <p className="pd-section__hint">
          {hasReviews
            ? "Authentic feedback from guests who have stayed here."
            : "This place hasn't received any reviews yet."}
        </p>
      </div>

      {hasReviews && (
        <div className="pd-reviews__overview">
          <div className="pd-reviews__score-card">
            <div className="pd-reviews__score-badge">Excellent</div>
            <div className="pd-reviews__score-main">
              <span className="pd-reviews__score">{avgRating}</span>
              <span className="pd-reviews__score-star" aria-hidden="true">
                ★
              </span>
            </div>
            <div className="pd-reviews__score-copy">
              <p>
                Based on {reviewCount} {reviewCount > 1 ? "reviews" : "review"}
              </p>
            </div>
            <div className="pd-reviews__score-foot">
              <span>✓ Satisfied guests</span>
            </div>
          </div>
          <div />
        </div>
      )}

      {loadingReviews ? (
        <p className="pd-reviews__loading">Loading reviews…</p>
      ) : hasReviews ? (
        <>
          <div className="pd-comments">
            {visibleReviews.map((review) => {
              const rState = replyState[review.id_review] || {};
              const replyOpen = rState.open || false;

              return (
                <article className="pd-comment" key={review.id_review}>
                  <div className="pd-comment__head">
                    <span aria-hidden="true">
                      {(review.reviewer_name || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <h3>{review.reviewer_name}</h3>
                      <p>{formatReviewDate(review.created_at)}</p>
                    </div>
                  </div>
                  <StarRating value={Number(review.rating)} />
                  <p className="pd-comment__text">{review.comment}</p>

                  {/* Host reply bubble (shown if reply exists) */}
                  {review.host_reply && (
                    <div className="pd-comment__host-reply">
                      <div className="pd-comment__host-reply-header">
                        <span className="pd-comment__host-reply-icon" aria-hidden="true">🏠</span>
                        <span className="pd-comment__host-reply-label">Response from the host</span>
                        {review.host_reply_at && (
                          <span className="pd-comment__host-reply-date">
                            {formatReviewDate(review.host_reply_at)}
                          </span>
                        )}
                      </div>
                      <p className="pd-comment__host-reply-text">{review.host_reply}</p>
                    </div>
                  )}

                  {/* Reply form — only shown to the host for reviews without a reply */}
                  {isHost && !review.host_reply && (
                    <div className="pd-comment__host-reply-action">
                      {!replyOpen ? (
                        <button
                          type="button"
                          className="pd-comment__reply-toggle"
                          onClick={() => setReplyField(review.id_review, { open: true, text: "", error: "" })}
                        >
                          <span aria-hidden="true">↩</span> Reply to this review
                        </button>
                      ) : (
                        <form
                          className="pd-comment__reply-form"
                          onSubmit={(e) => handleReplySubmit(e, review.id_review)}
                          noValidate
                        >
                          <div className="pd-comment__reply-form-head">
                            <span className="pd-comment__host-reply-icon" aria-hidden="true">🏠</span>
                            <span className="pd-comment__host-reply-label">Your response</span>
                          </div>
                          <textarea
                            className="pd-comment__reply-textarea"
                            rows={3}
                            placeholder="Write a professional, courteous response to this guest's review… (min. 10 characters)"
                            value={rState.text || ""}
                            onChange={(e) => setReplyField(review.id_review, { text: e.target.value })}
                            maxLength={1000}
                            autoFocus
                          />
                          <span className="pd-comment__reply-char-count">
                            {(rState.text || "").length}/1000
                          </span>
                          {rState.error && (
                            <p className="pd-comment__reply-error" role="alert">
                              {rState.error}
                            </p>
                          )}
                          <div className="pd-comment__reply-actions">
                            <button
                              type="button"
                              className="pd-secondary-btn pd-comment__reply-cancel"
                              onClick={() => setReplyField(review.id_review, { open: false, error: "" })}
                              disabled={rState.submitting}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="pd-primary-btn pd-comment__reply-submit"
                              disabled={rState.submitting}
                            >
                              {rState.submitting ? "Posting…" : "Post reply"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {reviews.length > 4 && (
            <button
              type="button"
              className="pd-secondary-btn"
              onClick={() => setShowAllReviews((v) => !v)}
              style={{ marginTop: "16px" }}
            >
              {showAllReviews
                ? "Show fewer reviews"
                : `Show all ${reviews.length} reviews`}
            </button>
          )}
        </>
      ) : (
        <div className="pd-empty-reviews">
          <span>⭐</span>
          <h3>No reviews yet</h3>
          <p>Reviews will appear here after the first guest stays.</p>
        </div>
      )}

      {canSubmit && !formSuccess && (
        <div className="pd-review-form pd-card">
          <h3 className="pd-review-form__title">Leave a review</h3>
          <p className="pd-review-form__hint">
            You stayed here — share your experience with future guests.
          </p>
          <form onSubmit={handleSubmit} noValidate>
            <div
              className="pd-review-form__stars"
              role="group"
              aria-label="Star rating"
            >
              <span className="pd-review-form__label">Your rating</span>
              <StarRating
                value={formRating}
                interactive
                onChange={setFormRating}
                size="lg"
              />
              {formRating > 0 && (
                <span className="pd-review-form__rating-label">
                  {
                    ["", "Poor", "Fair", "Good", "Very good", "Excellent"][
                      formRating
                    ]
                  }
                </span>
              )}
            </div>
            <div className="pd-review-form__field">
              <label
                htmlFor="pd-review-comment"
                className="pd-review-form__label"
              >
                Your review
              </label>
              <textarea
                id="pd-review-comment"
                className="pd-review-form__textarea"
                rows={4}
                placeholder="What did you enjoy most about your stay? (min. 10 characters)"
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                maxLength={1000}
              />
              <span className="pd-review-form__char-count">
                {formComment.length}/1000
              </span>
            </div>
            {formError && (
              <p className="pd-review-form__error" role="alert">
                {formError}
              </p>
            )}
            <button
              type="submit"
              className="pd-primary-btn pd-review-form__submit"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </form>
        </div>
      )}

      {token &&
        eligibility.eligible &&
        eligibility.alreadyReviewed &&
        !formSuccess && (
          <div className="pd-review-done">
            <span>✓</span> You have already reviewed this property. Thank you!
          </div>
        )}

      {formSuccess && (
        <div className="pd-review-success" role="status">
          <span>🎉</span> Your review has been published. Thank you!
        </div>
      )}

      {!token && (
        <p className="pd-reviews__login-nudge">
          <a href="/Authentication">Sign in</a> to leave a review after your
          stay.
        </p>
      )}
    </section>
  );
}


function LocationSection({ property }) {
  const [mapKey, setMapKey] = useState(0);
  const [expandedLocationDetails, setExpandedLocationDetails] = useState({});
  const previewLength = 260;
  const mapZoomDelta = 0.0035;
  const latitude = Number(property.coordinates?.lat);
  const longitude = Number(property.coordinates?.lng);
  const hasMapCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const fullLocation = [property.address, property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ");
  const locationDetails = [
    {
      label: "Area description",
      icon: "◇",
      text:
        property.neighborhoodDescription ||
        "The host has not added an area description yet.",
      muted: !property.neighborhoodDescription,
    },
    {
      label: "Address",
      icon: "⌖",
      text: property.address || "Address not provided yet.",
      muted: !property.address,
    },
    {
      label: "Access instructions",
      icon: "↳",
      text: property.accessInstructions || "Access instructions not provided yet.",
      muted: !property.accessInstructions,
    },
  ].filter(Boolean);
  const getLocationPreview = (text) =>
    text.length > previewLength
      ? `${text.slice(0, previewLength).trim()}...`
      : text;
  const toggleLocationDetail = (label) => {
    setExpandedLocationDetails((currentDetails) => ({
      ...currentDetails,
      [label]: !currentDetails[label],
    }));
  };
  const mapSrc = hasMapCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        longitude - mapZoomDelta
      }%2C${latitude - mapZoomDelta}%2C${
        longitude + mapZoomDelta
      }%2C${latitude + mapZoomDelta}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : "";

  return (
    <section className="pd-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Where you'll be</h2>
        {fullLocation && <p className="pd-section__hint">{fullLocation}</p>}
      </div>

      <div className="pd-location">
        <div className="pd-location__map" aria-label="Property map">
          {hasMapCoordinates ? (
            <>
              <iframe
                key={mapKey}
                title="Property map"
                src={mapSrc}
                loading="lazy"
                style={{ zIndex: 0 }}
              />
              <button
                type="button"
                className="pd-location__reset-map"
                onClick={() => setMapKey((currentKey) => currentKey + 1)}
              >
                <span aria-hidden="true">&#128205;</span>
                Recenter map
              </button>
            </>
          ) : (
            <p className="pd-location__map-fallback">
              Map details will be available once the exact location is confirmed.
            </p>
          )}
        </div>

        <div className="pd-location__address pd-card">
          {locationDetails.length > 0 ? (
            <>
              <div className="pd-location__details">
                {locationDetails.map((detail) => (
                  <LocationDetail
                    detail={detail}
                    expanded={Boolean(expandedLocationDetails[detail.label])}
                    key={detail.label}
                    previewLength={previewLength}
                    getLocationPreview={getLocationPreview}
                    onToggle={() => toggleLocationDetail(detail.label)}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="pd-location__fallback">
              Access details will be shared after the booking is confirmed.
            </p>
          )}
        </div>
      </div>

    </section>
  );
}

function LocationDetail({
  detail,
  expanded,
  previewLength,
  getLocationPreview,
  onToggle,
}) {
  const isLongText = detail.text.length > previewLength;
  const displayedText =
    isLongText && !expanded ? getLocationPreview(detail.text) : detail.text;

  return (
    <div
      className={[
        "pd-location__detail",
        detail.muted ? "pd-location__detail--muted" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span aria-hidden="true">{detail.icon}</span>
      <div>
        <strong>{detail.label}</strong>
        <p>{displayedText}</p>
        {isLongText && (
          <button
            type="button"
            className="pd-location__read-more"
            onClick={onToggle}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}

function HostSection({ host, property }) {
  const hostName = getHostName(host);
  const hostSubline = getHostSubline(host);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleContactButton = () => {
    setShowContactModal(true);
  };

  const hostPhone = property?.host_phone || host?.phone || "";
  const hostEmail = property?.host_email || host?.email || "";
  const hostLanguages = normalizeDisplayList(host.languages);
  const hostDetails = [
    hostPhone && { label: "Phone", value: hostPhone },
    hostEmail && { label: "Email", value: hostEmail },
  ].filter(Boolean);
  const hostBadges = [host.verified && "Verified host"].filter(Boolean);

  return (
    <section className="pd-section" id="host-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Meet your host</h2>
        <p className="pd-section__hint">
          Public host details for this listing.
        </p>
      </div>

      <div className="pd-host pd-card">
        <div className="pd-host__identity">
          <div className="pd-host__profile">
            <div className="pd-host__avatar-wrap">
              <span className="pd-host__avatar">
                {host.profilePicture ? (
                  <img src={host.profilePicture} alt={hostName} />
                ) : (
                  host.avatarInitials
                )}
              </span>
              {host.verified && (
                <span className="pd-host__verified-badge" aria-hidden="true">
                  ✓
                </span>
              )}
            </div>

            <div className="pd-host__profile-info">
              {host.verified && (
                <span className="pd-host__verified-text">Verified host</span>
              )}
              <h3>{hostName}</h3>
              <p>{hostSubline}</p>
            </div>
          </div>

          {hostLanguages.length > 0 && (
            <div className="pd-host__language-panel">
              <span>Languages spoken</span>
              <div className="pd-host__language-list">
                {hostLanguages.map((language) => (
                  <span key={language}>{language}</span>
                ))}
              </div>
            </div>
          )}

          {hostBadges.length > 0 && (
            <div className="pd-host__trust-list pd-host__trust-list--identity" aria-label="Host signals">
              {hostBadges.map((signal) => (
                <span key={signal}>{signal}</span>
              ))}
            </div>
          )}
        </div>

        <div className="pd-host__details">
          <div className="pd-host__bio-block">
            <span>About your host</span>
            <p className={host.bio ? "pd-host__bio" : "pd-host__bio pd-muted-copy"}>
              {host.bio || "Not provided yet"}
            </p>
          </div>

          <dl className="pd-host__info-list">
            {hostDetails.length > 0 ? (
              hostDetails.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))
            ) : (
              <div>
                <dt>Host details</dt>
                <dd className="pd-muted-copy">Not provided yet</dd>
              </div>
            )}
          </dl>

          <button
            type="button"
            className="pd-primary-btn pd-host__contact-btn"
            onClick={handleContactButton}
          >
            Contact host
          </button>
        </div>
      </div>

      {showContactModal && (
        <div
          className="contact-modal-overlay"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="contact-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              style={{ fontSize: "1.5rem" }}
              className="close-btn"
              onClick={() => setShowContactModal(false)}
            >
              ×
            </button>

            <div className="host-info">
              <h3>Contact the Host</h3>
              <p>
                You are contacting <strong>{hostName}</strong> about{" "}
                <strong>{property.title}</strong>
              </p>
            </div>

            {(hostPhone || hostEmail) ? (
              <div className="contact-options">
                {hostPhone && (
                  <>
                    <a
                      href={`https://wa.me/${hostPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Hello, I'm interested in your property "${property.title}" on Dar Darek.`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-btn"
                    >
                      Chat on WhatsApp
                    </a>

                    <a href={`tel:${hostPhone}`} className="phone-btn">
                      Call Now
                    </a>
                  </>
                )}
                {hostEmail && (
                  <a
                    href={`mailto:${hostEmail}?subject=${encodeURIComponent(
                      `Inquiry about your property: ${property.title}`
                    )}`}
                    className="email-btn"
                  >
                    Send an Email
                  </a>
                )}
              </div>
            ) : (
              <p className="pd-section__hint">
                Contact information is not available yet.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function HighlightsSection({ highlights }) {
  return (
    <section className="pd-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Highlights</h2>
        <p className="pd-section__hint">What makes this place unique.</p>
      </div>

      <div className="pd-highlights">
        {highlights.map((highlight) => (
          <article className="pd-highlight pd-card" key={highlight.title}>
            <span className="pd-highlight__icon" aria-hidden="true">
              {iconMap[highlight.icon]}
            </span>
            <div className="pd-highlight__content">
              <h3>{highlight.title}</h3>
              <p>{highlight.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMonthDays = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getStartBlankDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1;
};

const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
};

const getTodayDateString = () => {
  const today = new Date();
  return formatDate(today.getFullYear(), today.getMonth(), today.getDate());
};

const getLaterDateString = (...dateValues) => {
  const validDates = dateValues
    .map(parseLocalDate)
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime());

  if (validDates.length === 0) return "";

  const latestDate = validDates[0];
  return formatDate(
    latestDate.getFullYear(),
    latestDate.getMonth(),
    latestDate.getDate(),
  );
};

const getOffsetDateString = (dateValue, offsetDays) => {
  const date = parseLocalDate(dateValue);
  if (!date) return "";

  date.setDate(date.getDate() + offsetDays);
  return formatDate(date.getFullYear(), date.getMonth(), date.getDate());
};

function AvailabilitySection({
  property,
  dates,
  onDateChange,
  bookedRanges = [],
  showSelectedRange = false,
}) {
  const [currentMonth, setCurrentMonth] = useState(4); // May
  const year = 2026;

  const visibleMonths = [currentMonth, currentMonth + 1];
  const todayDate = parseLocalDate(getTodayDateString());
  const minDate = property.availableFrom
    ? new Date(property.availableFrom)
    : null;
  const maxDate = property.availableTo ? new Date(property.availableTo) : null;

  const isDisabled = (month, day) => {
    const dateValue = formatDate(year, month, day);
    const date = new Date(dateValue);

    if (todayDate && date < todayDate) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (isDateInBookedRange(dateValue, bookedRanges)) return true;

    return false;
  };

  const handleDayClick = (month, day) => {
    const selectedDate = formatDate(year, month, day);

    if (isDisabled(month, day)) {
      return;
    }

    if (!dates.checkIn || (dates.checkIn && dates.checkOut)) {
      onDateChange("checkIn", selectedDate);
      onDateChange("checkOut", "");
      return;
    }

    const firstDate = new Date(dates.checkIn);
    const secondDate = new Date(selectedDate);

    if (secondDate > firstDate) {
      onDateChange("checkOut", selectedDate);
    } else {
      onDateChange("checkIn", selectedDate);
      onDateChange("checkOut", dates.checkIn);
    }
  };

  const selectedRangeUnavailable = doesDateRangeOverlapBooking(
    dates.checkIn,
    dates.checkOut,
    bookedRanges,
  );

  const isInRange = (month, day) => {
    if (!showSelectedRange) return false;
    if (!dates.checkIn) return false;

    const date = new Date(formatDate(year, month, day));
    const checkInDate = new Date(dates.checkIn);

    if (!dates.checkOut) {
      return date.getTime() === checkInDate.getTime();
    }

    return date >= checkInDate && date <= new Date(dates.checkOut);
  };

  return (
    <section className="pd-section" id="availability-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Availability</h2>
        <p className="pd-section__hint">
          Select your travel dates. Reserved days are unavailable.
        </p>
      </div>

      {selectedRangeUnavailable && (
        <div className="pd-availability-message" role="status">
          <span aria-hidden="true">!</span>
          <p>This property is already reserved for the selected dates.</p>
        </div>
      )}

      <div className="pd-calendar pd-card">
        <div className="pd-calendar__head">
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => Math.max(0, m - 1))}
          >
            ‹
          </button>

          <strong>
            {monthNames[currentMonth]} - {monthNames[currentMonth + 1]} {year}
          </strong>

          <button
            type="button"
            onClick={() => setCurrentMonth((m) => Math.min(10, m + 1))}
          >
            ›
          </button>
        </div>

        <div className="pd-calendar__months">
          {visibleMonths.map((month) => {
            const days = Array.from(
              { length: getMonthDays(year, month) },
              (_, index) => index + 1,
            );

            return (
              <div className="pd-calendar__month" key={month}>
                <h3>
                  {monthNames[month]} {year}
                </h3>

                <div className="pd-calendar__weekdays">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <span key={day}>{day}</span>
                    ),
                  )}
                </div>

                <div className="pd-calendar__grid">
                  {Array.from({
                    length: getStartBlankDays(year, month),
                  }).map((_, index) => (
                    <span
                      className="pd-calendar__day pd-calendar__day--empty"
                      key={`empty-${month}-${index}`}
                    />
                  ))}

                  {days.map((day) => {
                    const dateValue = formatDate(year, month, day);
                    const calendarDate = parseLocalDate(dateValue);
                    const isPast =
                      todayDate && calendarDate && calendarDate < todayDate;
                    const isOutsideAvailability =
                      (minDate && calendarDate && calendarDate < minDate) ||
                      (maxDate && calendarDate && calendarDate > maxDate);
                    const isBooked = isDateInBookedRange(
                      dateValue,
                      bookedRanges,
                    );
                    const disabled = isPast || isOutsideAvailability || isBooked;
                    const isSelected = isInRange(month, day);

                    return (
                      <button
                        type="button"
                        className={[
                          "pd-calendar__day",
                          isSelected ? "pd-calendar__day--selected" : "",
                          disabled ? "pd-calendar__day--disabled" : "",
                          isPast ? "pd-calendar__day--past" : "",
                          isOutsideAvailability
                            ? "pd-calendar__day--unavailable"
                            : "",
                          isBooked ? "pd-calendar__day--booked" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={`${month}-${day}`}
                        onClick={() => !disabled && handleDayClick(month, day)}
                        disabled={disabled}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AboutPlaceSection({ property, dates }) {
  const safetyItems = getSafetyItems(property.amenities);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate =
    parseLocalDate(dates?.checkIn) || parseLocalDate(property.availableFrom);
  const cancellationItems = [];

  if (checkInDate) {
    const daysUntilCheckIn = Math.floor(
      (checkInDate.getTime() - today.getTime()) / 86400000,
    );
    const partialRefundDeadline = new Date(checkInDate);
    partialRefundDeadline.setDate(partialRefundDeadline.getDate() - 3);
    const formattedDeadline = formatPolicyDate(partialRefundDeadline);

    if (daysUntilCheckIn >= 7) {
      cancellationItems.push(
        "Free cancellation within the first 24 hours after booking.",
      );
    }

    if (partialRefundDeadline > today) {
      cancellationItems.push(`Partial refund before ${formattedDeadline}`);
      cancellationItems.push(`No refund after ${formattedDeadline}`);
    } else {
      cancellationItems.push("No refund applies for this check-in date.");
    }
  } else {
    cancellationItems.push("No refund applies for this check-in date.");
  }

  return (
    <section className="pd-section pd-things-to-know">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Things to know</h2>
        <p className="pd-section__hint">
          Important information before you book.
        </p>
      </div>

      <div className="pd-about-grid">
        <article className="pd-about-card pd-card">
          <div className="pd-about-card__header">
            <span className="pd-about-card__icon" aria-hidden="true">
              ↩️
            </span>
            <h3>Cancellation</h3>
          </div>
          <ul>
            {cancellationItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="pd-about-card pd-card">
          <div className="pd-about-card__header">
            <span className="pd-about-card__icon" aria-hidden="true">
              📋
            </span>
            <h3>House rules</h3>
          </div>
          <ul>
            <li>Check-in: {property.checkInTime}</li>
            <li>Check-out: {property.checkOutTime}</li>
            <li>Maximum guests: {property.guests}</li>
          </ul>
        </article>

        <article className="pd-about-card pd-card">
          <div className="pd-about-card__header">
            <span className="pd-about-card__icon" aria-hidden="true">
              🛡️
            </span>
            <h3>Safety & property</h3>
          </div>
          <ul>
            {safetyItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="pd-about-card pd-card">
          <div className="pd-about-card__header">
            <span className="pd-about-card__icon" aria-hidden="true">
              ℹ️
            </span>
            <h3>Good to know</h3>
          </div>
          <ul>
            <li>ID may be required upon arrival</li>
            <li>Access details are shared after booking confirmation</li>
            <li>Keep the place clean and report any issue early</li>
            <li>Contact the host for special requests before arrival</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export default function PropertyDetails() {
  // theme
  const themeGlobal = useThemeGlobal();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookedRanges, setBookedRanges] = useState([]);
  const [dates, setDates] = useState({
    checkIn: "",
    checkOut: "",
  });
  const [hasCalendarSelection, setHasCalendarSelection] = useState(false);
  const [guests, setGuests] = useState(mockProperty.bookingDefaults.guests);
  const displayProperty = normalizeProperty(property);
  const displayHostName = getHostName(displayProperty.host);
  const displayHostSubline = getHostSubline(displayProperty.host);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(buildApiUrl(`/api/houses/${id}`), {
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load this property.");
        }
        setProperty(data?.property || data || null);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Unable to load this property.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProperty();

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBookedRanges = async () => {
      try {
        const response = await fetch(
          buildApiUrl(`/api/properties/${id}/booked-dates`),
          {
            signal: controller.signal,
          },
        );
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load booked dates.");
        }

        const ranges = Array.isArray(data?.bookedDates) ? data.bookedDates : [];
        setBookedRanges(
          ranges.map(normalizeBookedRange).filter(isValidBookedRange),
        );
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setBookedRanges([]);
        }
      }
    };

    fetchBookedRanges();

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    setDates({
      checkIn: "",
      checkOut: "",
    });
    setHasCalendarSelection(false);
    setGuests(displayProperty.bookingDefaults.guests);
  }, [
    displayProperty.availableFrom,
    displayProperty.bookingDefaults.checkIn,
    displayProperty.bookingDefaults.checkOut,
    displayProperty.bookingDefaults.guests,
  ]);

  const updateDate = (field, value) => {
    setDates((currentDates) => {
      const selectedDate = parseLocalDate(value);
      const todayDate = parseLocalDate(getTodayDateString());

      if (value && (!selectedDate || selectedDate < todayDate)) {
        return currentDates;
      }

      if (value && isDateInBookedRange(value, bookedRanges)) {
        return currentDates;
      }

      const newDates = { ...currentDates, [field]: value };

      if (field === "checkIn" && newDates.checkOut) {
        if (new Date(value) > new Date(newDates.checkOut)) {
          newDates.checkOut = "";
        }
      }

      if (field === "checkOut" && newDates.checkIn) {
        if (new Date(value) < new Date(newDates.checkIn)) {
          return currentDates;
        }
      }

      setHasCalendarSelection(true);
      return newDates;
    });
  };

  const updateGuests = (change) => {
    setGuests((currentGuests) => {
      const safeGuests = Number.isFinite(Number(currentGuests))
        ? Number(currentGuests)
        : 1;

      return Math.min(displayProperty.guests, Math.max(1, safeGuests + change));
    });
  };

  const bookingConflictMessage = useMemo(() => {
    if (
      doesDateRangeOverlapBooking(dates.checkIn, dates.checkOut, bookedRanges)
    ) {
      return "This property is already reserved for the selected dates.";
    }

    return "";
  }, [dates.checkIn, dates.checkOut, bookedRanges]);

  if (loading) {
    return (
      <>
        <Header />
        <main
          style={{ background: themeGlobal.colors.white }}
          className="pd-page"
        >
          <PropertyDetailsLoading />
        </main>
      </>
    );
  }

  if (error) {
    return <NotFound />;
  }

  return (
    <>
      <Header />
      <main
        style={{ background: themeGlobal.colors.white }}
        className="pd-page"
      >
        <section
          style={{ border: "none", boxShadow: "none", padding: "0" }}
          className="pd-section pd-title-card"
        >
          <h1>{displayProperty.title}</h1>
          <p className="pd-title-card__location">
            {displayProperty.neighborhood}, {displayProperty.city}
          </p>
        </section>

        <PropertyGallery property={displayProperty} />

        <section className="pd-layout">
          <div className="pd-content">
            {/* Summary card */}
            <section className="pd-summary" aria-label="Property summary">
              <div className="pd-summary__content">
                <h2 className="pd-summary__headline">
                  {getPropertyTypeLabel(displayProperty.propertyType)} in{" "}
                  {displayProperty.city}
                </h2>
                <div className="pd-summary__details">
                  <span>
                    👥 {displayProperty.guests}{" "}
                    {displayProperty.guests > 1 ? "guests" : "guest"}
                  </span>
                  <span>
                    🛏️ {displayProperty.bedrooms}{" "}
                    {displayProperty.bedrooms > 1 ? "bedrooms" : "bedroom"}
                  </span>
                  <span>
                    🛌 {displayProperty.beds}{" "}
                    {displayProperty.beds > 1 ? "beds" : "bed"}
                  </span>
                  <span>
                    🚿 {displayProperty.bathrooms}{" "}
                    {displayProperty.bathrooms > 1 ? "bathrooms" : "bathroom"}
                  </span>
                </div>
                <div className="pd-summary__rating">
                  {displayProperty.reviewCount > 0 ? (
                    <>
                      <strong>⭐ {displayProperty.rating}</strong>
                      <span>·</span>
                      <button type="button">
                        {displayProperty.reviewCount}{" "}
                        {displayProperty.reviewCount > 1 ? "reviews" : "review"}
                      </button>
                    </>
                  ) : (
                    <span>No reviews yet</span>
                  )}
                </div>
                <button
                  type="button"
                  className="pd-summary__host-preview"
                  onClick={scrollToHost}
                >
                  <span className="pd-summary__host-avatar" aria-hidden="true">
                    {displayProperty.host.profilePicture ? (
                      <img src={displayProperty.host.profilePicture} alt="" />
                    ) : (
                      displayProperty.host.avatarInitials
                    )}
                  </span>
                  <span className="pd-summary__host-copy">
                    <strong>Hosted by {displayHostName}</strong>
                    <span>{displayHostSubline}</span>
                  </span>
                </button>
              </div>
            </section>

            {/* Description */}
            <section className="pd-section">
              <div className="pd-section__head">
                <h2 className="pd-section__title">Description</h2>
                <p className="pd-section__hint">
                  A clear overview of the vibe, comfort, and neighborhood.
                </p>
              </div>

              <p className="pd-description">{displayProperty.description}</p>
            </section>

            <AmenitiesSection amenities={displayProperty.amenities} />

            <AvailabilitySection
              property={displayProperty}
              dates={dates}
              onDateChange={updateDate}
              bookedRanges={bookedRanges}
              showSelectedRange={hasCalendarSelection}
            />
          </div>

          <BookingCard
            property={displayProperty}
            dates={dates}
            guests={guests}
            onDateChange={updateDate}
            onGuestChange={updateGuests}
            bookedRanges={bookedRanges}
            bookingConflictMessage={bookingConflictMessage}
          />
        </section>

        <div className="pd-lower-sections">
          <LocationSection property={displayProperty} />

          <ReviewsSection propertyId={id} hostUserId={displayProperty.id_owner} />

          <HostSection host={displayProperty.host} property={displayProperty} />

          <AboutPlaceSection property={displayProperty} dates={dates} />
        </div>
      </main>
      <div className="pd-footer-scope">
        <Footer />
      </div>
    </>
  );
}
