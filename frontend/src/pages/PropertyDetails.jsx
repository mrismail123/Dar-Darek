import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./PropertyDetails.css";
import { useToken } from "../Contexts/TokenContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import chaouenImage from "../assets/chaouen-bg.jpg";
import tetouanImage from "../assets/tetouan-hero.jpg";
import Header from "../Home components/Header";
import Footer from "../Footer";
import { useThemeGlobal } from "../Contexts/ThemeContext";
import { buildApiUrl } from "../lib/api";

const mockProperty = {
  brand: "Dar Darek",
  title: "Bright apartment with ocean views",
  propertyType: "Entire home",
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
  availability: {
    month: "May 2026",
    startBlankDays: 4,
    blockedDays: [3, 4, 12, 18, 25],
    selectedDays: [8, 9, 10, 11],
  },
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

const amenityIconMap = {
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

const amenityLabelToKeyMap = {
  WiFi: "wifi",
  "Hot water": "hotWater",
  "Bed linens": "sheets",
  Towels: "towels",
  Toiletries: "toiletries",
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
    keys: ["wifi", "hotWater", "sheets", "towels", "toiletries"],
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

const getHostName = (host) => host?.name || "Hôte Dar Darek";

const getHostSubline = (host) => {
  const yearsHosting = Number(host?.yearsHosting);

  if (Number.isFinite(yearsHosting) && yearsHosting > 0) {
    return `${yearsHosting} ${yearsHosting > 1 ? "years" : "year"} hosting`;
  }

  return "Dar Darek verified host";
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
      lat: numberWithFallback(property.latitude, mockProperty.coordinates.lat),
      lng: numberWithFallback(property.longitude, mockProperty.coordinates.lng),
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
      name: withFallback(
        property.host?.name || property.host_name || property.owner_name,
        "Hôte Dar Darek",
      ),
      avatarInitials: withFallback(
        property.host?.avatarInitials || property.host_initials,
        "DD",
      ),
      verified: true,
      rating: null,
      reviews: 0,
      responseRate: null,
      responseTime: null,
      yearsHosting: null,
      bio: null,
    },
  };
};

function PropertyGallery({ property }) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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
        <div className="pd-photo-modal">
          <div className="pd-photo-modal__panel">
            <button
              type="button"
              className="pd-photo-modal__close"
              onClick={() => setShowAllPhotos(false)}
            >
              ✕
            </button>

            <h2 className="pd-photo-modal__title">All photos</h2>

            <div className="pd-photo-modal__grid">
              {property.images.map((img, index) => (
                <button
                  type="button"
                  className="pd-photo-modal__item"
                  key={index}
                  onClick={() => setSelectedPhoto(img)}
                >
                  <img src={img} alt={`Photo ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedPhoto && (
        <div className="pd-photo-viewer">
          <button
            type="button"
            className="pd-photo-viewer__close"
            onClick={() => setSelectedPhoto(null)}
          >
            ✕
          </button>

          <img src={selectedPhoto} alt="Enlarged photo" />
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

function BookingCard({ property, dates, guests, onDateChange, onGuestChange }) {
  const { id } = useParams();

  const nights = getNightCount(dates.checkIn, dates.checkOut);
  const nightsTotal = nights * property.pricePerNight;
  const safeGuests = Number.isFinite(Number(guests)) ? Number(guests) : 1;

  const isValidDates = () => {
    if (!dates.checkIn || !dates.checkOut) return false;
    const checkInDate = new Date(dates.checkIn);
    const checkOutDate = new Date(dates.checkOut);

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

  // navigate
  const navigate = useNavigate();

  async function handleReserveFunction() {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      alert("Please sign in first...");

      navigate("/Authentication", { state: { from: location.pathname } });
      return;
    }

    // const response = await axios.post();

    const reservationData = {
      id_property: id,
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      total_price: nightsTotal,
      id_user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).id
        : null,
    };

    if (!reservationData.checkIn || !reservationData.checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      };

      const response = await axios.post(
        buildApiUrl("/api/bookingProperty"),
        reservationData,
        config,
      );
      if (response.data) {
        alert(
          "Your reservation request has been sent successfully! The host will review it and get back to you soon.",
        );
        navigate("/MyBookings");
      }
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        alert("Session expired. Please login again.");
        navigate("/Authentication", { state: { from: location.pathname } });
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert(
          error.message || "An error occurred while making the reservation.",
        );
      }
    }
  }

  const { token, setToken } = useToken();

  return (
    <div className="pd-booking-wrap">
      <div className="pd-booking__actions">
        <button type="button" className="pd-action-btn">
          🔗 Share
        </button>
        <button type="button" className="pd-action-btn">
          ❤️ Save
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
              min={property.availableFrom}
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
              min={dates.checkIn || property.availableFrom}
              max={property.availableTo}
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

        <button
          // type="button"
          className="pd-primary-btn"
          onClick={handleReserveFunction}
          // disabled={!isBookingValid}
        >
          Reserve
        </button>

        <div className="pd-booking__total">
          <div>
            <span>
              {formatCurrency(property.pricePerNight)} x {nights}{" "}
              {nights > 1 ? "nights" : "night"}
            </span>
            <strong>{formatCurrency(nightsTotal)}</strong>
          </div>
        </div>
      </aside>
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
                  <div className="pd-amenity" key={amenity.label}>
                    <span className="pd-amenity__icon" aria-hidden="true">
                      {amenity.icon}
                    </span>
                    <span className="pd-amenity__label">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pd-amenities">
          {visibleAmenities.map((amenity) => (
            <div className="pd-amenity" key={amenity.label}>
              <span className="pd-amenity__icon" aria-hidden="true">
                {amenity.icon}
              </span>
              <span className="pd-amenity__label">{amenity.label}</span>
            </div>
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

function ReviewsSection({ property }) {
  const hasReviews = property.reviews && property.reviews.length > 0;

  if (!hasReviews) {
    return (
      <section className="pd-section pd-reviews">
        <div className="pd-section__head">
          <h2 className="pd-section__title">Guest reviews</h2>
          <p className="pd-section__hint">
            This place hasn't received any reviews yet.
          </p>
        </div>

        <div className="pd-empty-reviews">
          <span>⭐</span>
          <h3>No reviews yet</h3>
          <p>Reviews will appear here after the first guest stays.</p>
        </div>
      </section>
    );
  }
  return (
    <section className="pd-section pd-reviews">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Guest reviews</h2>
        <p className="pd-section__hint">
          Detailed guest ratings after their stay.
        </p>
      </div>

      <div className="pd-reviews__overview">
        <div className="pd-reviews__score-card">
          <div className="pd-reviews__score-badge">Excellent</div>
          <div className="pd-reviews__score-main">
            <span className="pd-reviews__score">{property.rating}</span>
            <span className="pd-reviews__score-star" aria-hidden="true">
              ★
            </span>
          </div>
          <div className="pd-reviews__score-copy">
            <p>
              Based on {property.reviewCount}{" "}
              {property.reviewCount > 1 ? "reviews" : "review"}
            </p>
          </div>
          <div className="pd-reviews__score-foot">
            <span>✓ Satisfied guests</span>
          </div>
        </div>

        <div className="pd-rating-grid">
          {property.ratingBreakdown.map((item) => (
            <div className="pd-rating-row" key={item.label}>
              <div>
                <span>{item.label}</span>
                <strong>{item.score}/5</strong>
              </div>
              <span className="pd-rating-bar">
                <span style={{ width: `${(item.score / 5) * 100}%` }} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pd-comments">
        {property.reviews.slice(0, 2).map((review) => (
          <article className="pd-comment" key={review.name}>
            <div className="pd-comment__head">
              <span>{review.name.slice(0, 1)}</span>
              <div>
                <h3>{review.name}</h3>
                <p>{review.date}</p>
              </div>
            </div>
            <p>{review.text}</p>
          </article>
        ))}
      </div>
      {property.reviews.length > 2 && (
        <button type="button" className="pd-secondary-btn">
          Show all reviews
        </button>
      )}
    </section>
  );
}

function LocationSection({ property }) {
  const [mapKey, setMapKey] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const previewLength = 170;
  const fullLocation = [
    property.address,
    property.neighborhood,
    property.city,
  ]
    .filter(Boolean)
    .join(", ");
  const locationDetails = [
    property.accessInstructions && {
      label: "Access details",
      text: property.accessInstructions,
    },
    property.neighborhoodDescription && {
      label: "About the area",
      text: property.neighborhoodDescription,
    },
  ].filter(Boolean);
  const hasLongLocationText = locationDetails.some(
    (detail) => detail.text.length > previewLength,
  );
  const getLocationPreview = (text) =>
    text.length > previewLength
      ? `${text.slice(0, previewLength).trim()}...`
      : text;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${
    property.coordinates.lng - 0.01
  }%2C${property.coordinates.lat - 0.01}%2C${
    property.coordinates.lng + 0.01
  }%2C${property.coordinates.lat + 0.01}&layer=mapnik&marker=${
    property.coordinates.lat
  }%2C${property.coordinates.lng}`;

  return (
    <section className="pd-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Where you'll be</h2>
        {fullLocation && <p className="pd-section__hint">{fullLocation}</p>}
      </div>

      <div className="pd-location">
        <div className="pd-location__map" aria-label="Property map">
          <iframe
            key={mapKey}
            title="Property map"
            src={mapSrc}
            loading="lazy"
          />
          <button
            type="button"
            className="pd-location__reset-map"
            onClick={() => setMapKey((currentKey) => currentKey + 1)}
          >
            <span aria-hidden="true">&#128205;</span>
            Recenter map
          </button>
        </div>

        <div className="pd-location__address pd-card">
          {locationDetails.length > 0 ? (
            <>
              <div className="pd-location__details">
                {locationDetails.map((detail) => (
                  <div className="pd-location__detail" key={detail.label}>
                    <span>{detail.label}</span>
                    <p>{getLocationPreview(detail.text)}</p>
                  </div>
                ))}
              </div>

              {hasLongLocationText && (
                <button
                  type="button"
                  className="pd-location__read-more"
                  onClick={() => setShowLocationModal(true)}
                >
                  Read more
                </button>
              )}
            </>
          ) : (
            <p className="pd-location__fallback">
              Access details will be shared after the booking is confirmed.
            </p>
          )}
        </div>
      </div>

      {showLocationModal && (
        <div
          className="pd-location-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pd-location-modal-title"
        >
          <div
            className="pd-location-modal__backdrop"
            onClick={() => setShowLocationModal(false)}
          />
          <div className="pd-location-modal__panel">
            <div className="pd-location-modal__head">
              <h3 id="pd-location-modal-title">Location details</h3>
              <button
                type="button"
                className="pd-location-modal__close"
                onClick={() => setShowLocationModal(false)}
                aria-label="Close location details"
              >
                &times;
              </button>
            </div>

            <div className="pd-location-modal__content">
              {locationDetails.map((detail) => (
                <div className="pd-location-modal__block" key={detail.label}>
                  <span>{detail.label}</span>
                  <p>{detail.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HostSection({ host }) {
  const hostName = getHostName(host);

  return (
    <section className="pd-section" id="host-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Meet your host</h2>
        <p className="pd-section__hint">
          Local, attentive, and highly responsive hosting.
        </p>
      </div>

      <div className="pd-host pd-card">
        <div className="pd-host__profile">
          <div className="pd-host__avatar-wrap">
            <span className="pd-host__avatar">{host.avatarInitials}</span>
          </div>

          <div>
            <h3>{hostName}</h3>
            <p>Verified host</p>
          </div>
        </div>

        <button type="button" className="pd-primary-btn">
          Contact host
        </button>
      </div>
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

function AvailabilitySection({ property, dates, onDateChange }) {
  const [currentMonth, setCurrentMonth] = useState(4); // May
  const year = 2026;

  const visibleMonths = [currentMonth, currentMonth + 1];
  const minDate = property.availableFrom
    ? new Date(property.availableFrom)
    : null;
  const maxDate = property.availableTo ? new Date(property.availableTo) : null;

  const isDisabled = (month, day) => {
    const date = new Date(formatDate(year, month, day));

    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;

    return false;
  };

  const handleDayClick = (month, day) => {
    const selectedDate = formatDate(year, month, day);

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

  const isInRange = (month, day) => {
    if (!dates.checkIn || !dates.checkOut) return false;

    const date = new Date(formatDate(year, month, day));

    return date >= new Date(dates.checkIn) && date <= new Date(dates.checkOut);
  };

  return (
    <section className="pd-section" id="availability-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Availability</h2>
        <p className="pd-section__hint">Select your travel dates.</p>
      </div>

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
                    const disabled = isDisabled(month, day);
                    const isSelected = isInRange(month, day);

                    return (
                      <button
                        type="button"
                        className={[
                          "pd-calendar__day",
                          isSelected ? "pd-calendar__day--selected" : "",
                          disabled ? "pd-calendar__day--disabled" : "",
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
  const [dates, setDates] = useState({
    checkIn: mockProperty.bookingDefaults.checkIn,
    checkOut: mockProperty.bookingDefaults.checkOut,
  });
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
    setDates({
      checkIn: displayProperty.bookingDefaults.checkIn,
      checkOut: displayProperty.bookingDefaults.checkOut,
    });
    setGuests(displayProperty.bookingDefaults.guests);
  }, [
    displayProperty.bookingDefaults.checkIn,
    displayProperty.bookingDefaults.checkOut,
    displayProperty.bookingDefaults.guests,
  ]);

  const updateDate = (field, value) => {
    setDates((currentDates) => {
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

  if (loading) {
    return (
      <main className="pd-page">
        <Header />
        <section className="pd-section pd-title-card">
          <p>Loading property...</p>
        </section>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="pd-page">
        <Header />
        <section className="pd-section pd-title-card">
          <p>{error}</p>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <>
    <Header />
    <main style={{background:themeGlobal.colors.white}} className="pd-page">

      <section style={{border:"none" , boxShadow:"none" , padding:"0"}} className="pd-section pd-title-card">
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
                {displayProperty.propertyType} in {displayProperty.city}
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
                  {displayProperty.host.avatarInitials}
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
          />

          <LocationSection property={displayProperty} />

          <ReviewsSection property={displayProperty} />

          <HostSection host={displayProperty.host} />
        </div>

        <BookingCard
          property={displayProperty}
          dates={dates}
          guests={guests}
          onDateChange={updateDate}
          onGuestChange={updateGuests}
        />
      </section>

      <AboutPlaceSection property={displayProperty} dates={dates} />

    </main>
    <Footer />
    </>
  );
}

