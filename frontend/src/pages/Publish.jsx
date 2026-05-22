import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Publish.css";
import SuccessAlert from "../SuccessAlert";
import { useLocation, useNavigate } from "react-router-dom";
import { buildApiUrl } from "../lib/api";
import { PROPERTY_TYPES } from "../lib/propertyTypes";
import Footer from "../Footer";
import {
  FiAirplay,
  FiBookOpen,
  FiBox,
  FiBriefcase,
  FiCalendar,
  FiCamera,
  FiChevronLeft,
  FiClock,
  FiCoffee,
  FiDroplet,
  FiFeather,
  FiHome,
  FiImage,
  FiMapPin,
  FiMinus,
  FiMonitor,
  FiPlus,
  FiShield,
  FiThermometer,
  FiTruck,
  FiTv,
  FiUploadCloud,
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
  FaBlender,
  FaBookReader,
  FaChair,
  FaConciergeBell,
  FaFireExtinguisher,
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

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

const DEFAULT_LOCATION = {
  latitude: 35.7595,
  longitude: -5.834,
};

const NORTHERN_MOROCCO_CENTER = [35.45, -4.85];
const NORTHERN_MOROCCO_BOUNDS = [
  [34.2, -6.8],
  [36.2, -2.5],
];
const NORTHERN_MOROCCO_LIMITS = {
  south: 34.2,
  west: -6.8,
  north: 36.2,
  east: -2.5,
};

const INITIAL_FORM_DATA = {
  title: "",
  city: "",
  propertyType: "Appartement",
  address: "",
  neighborhood: "",
  postalCode: "",
  accessInstructions: "",
  latitude: DEFAULT_LOCATION.latitude,
  longitude: DEFAULT_LOCATION.longitude,
  guests: "",
  bedrooms: "",
  bathrooms: "",
  beds: "",
  price: "",
  description: "",
  hostDescription: "",
  neighborhoodDescription: "",
  checkIn: "15:00",
  checkOut: "11:00",
  availableFrom: "",
  availableTo: "",
  amenities: {
    wifi: false,
    hotWater: false,
    sheets: false,
    towels: false,
    toiletries: false,
    hairDryer: false,
    refrigerator: false,

    kitchen: false,
    microwave: false,
    oven: false,
    kettle: false,
    coffeeMachine: false,
    dishes: false,

    airConditioning: false,
    heating: false,
    washingMachine: false,
    dryer: false,
    tv: false,
    sofa: false,

    workspace: false,
    desk: false,
    fastWifi: false,
    smartTv: false,

    crib: false,
    childrenBooksToys: false,
    babyBath: false,
    windowGuards: false,
    highChair: false,
    babyMonitor: false,

    balcony: false,
    terrace: false,
    seaView: false,
    mountainView: false,
    medinaView: false,
    natureView: false,
    beachAccess: false,
    pool: false,
    bbq: false,
    garden: false,

    breakfast: false,
    parking: false,
    petFriendly: false,
    housekeeping: false,
    airportShuttle: false,
    reception: false,

    smokeDetector: false,
    fireExtinguisher: false,
    outdoorCamera: false,
    safeBox: false,
  },
  images: [],
};

const LEGACY_AMENITY_GROUPS = [
  {
    id: "essentials",
    title: "Essentials",
    description: "The essentials for a comfortable stay.",
    icon: "🔑",
    items: [
      { name: "wifi", label: "WiFi", icon: "📶" },
      { name: "hotWater", label: "Hot water", icon: "🚿" },
      { name: "sheets", label: "Bed linens", icon: "🛏️" },
      { name: "towels", label: "Towels", icon: "🧺" },
      { name: "toiletries", label: "Toiletries", icon: "🧴" },
      { name: "refrigerator", label: "Refrigerator", icon: "🧊" },
    ],
  },
  {
    id: "kitchen",
    title: "Kitchen",
    description: "For guests who enjoy a more independent stay.",
    icon: "🍳",
    items: [
      { name: "kitchen", label: "Kitchen", icon: "🍽️" },
      { name: "microwave", label: "Microwave", icon: "📦" },
      { name: "oven", label: "Oven", icon: "🔥" },
      { name: "kettle", label: "Kettle", icon: "🫖" },
      { name: "coffeeMachine", label: "Coffee machine", icon: "☕" },
      { name: "dishes", label: "Dishes", icon: "🍽️" },
    ],
  },
  {
    id: "comfort",
    title: "Comfort",
    description: "Amenities that make every stay more enjoyable.",
    icon: "🌿",
    items: [
      { name: "airConditioning", label: "Air conditioning", icon: "❄️" },
      { name: "heating", label: "Heating", icon: "🔥" },
      { name: "washingMachine", label: "Washing machine", icon: "🫧" },
      { name: "dryer", label: "Dryer", icon: "🧺" },
      { name: "tv", label: "Television", icon: "📺" },
      { name: "sofa", label: "Comfortable sofa", icon: "🛋️" },
    ],
  },
  {
    id: "workTech",
    title: "Work & Tech",
    description: "Ideal for remote work or downtime.",
    icon: "💻",
    items: [
      { name: "workspace", label: "Workspace", icon: "💼" },
      { name: "desk", label: "Desk", icon: "🪑" },
      { name: "fastWifi", label: "Fast WiFi", icon: "⚡" },
      { name: "smartTv", label: "Smart TV", icon: "🖥️" },
    ],
  },
  {
    id: "outdoorViews",
    title: "Outdoor & views",
    description: "Especially valuable for homes in Northern Morocco.",
    icon: "🌅",
    items: [
      { name: "balcony", label: "Balcony", icon: "🪴" },
      { name: "terrace", label: "Terrace", icon: "🌇" },
      { name: "seaView", label: "Sea view", icon: "🌊" },
      { name: "mountainView", label: "Mountain view", icon: "⛰️" },
      { name: "medinaView", label: "Medina view", icon: "🕌" },
      { name: "natureView", label: "Nature view", icon: "🌿" },
      { name: "beachAccess", label: "Beach access", icon: "🏖️" },
      { name: "pool", label: "Pool", icon: "🏊" },
      { name: "bbq", label: "BBQ", icon: "🔥" },
      { name: "garden", label: "Garden", icon: "🌴" },
    ],
  },
  {
    id: "services",
    title: "Services",
    description: "Simple touches that add convenience.",
    icon: "🛎️",
    items: [
      { name: "breakfast", label: "Breakfast", icon: "🥐" },
      { name: "parking", label: "Parking", icon: "🅿️" },
      { name: "petFriendly", label: "Pet friendly", icon: "🐾" },
      { name: "housekeeping", label: "Housekeeping", icon: "🧹" },
      { name: "airportShuttle", label: "Airport shuttle", icon: "🚐" },
      { name: "reception", label: "Reception", icon: "🛎️" },
    ],
  },
  {
    id: "security",
    title: "Security",
    description: "Useful features that help guests feel at ease.",
    icon: "🛡️",
    items: [
      { name: "smokeDetector", label: "Smoke detector", icon: "🚨" },
      { name: "fireExtinguisher", label: "Fire extinguisher", icon: "🧯" },
      { name: "outdoorCamera", label: "Outdoor camera", icon: "📷" },
      { name: "safeBox", label: "Safe box", icon: "🔒" },
    ],
  },
];

const AMENITY_GROUPS = [
  {
    id: "essentials",
    title: "Essentials",
    description: "The essentials for a comfortable stay.",
    icon: FaKey,
    items: [
      {
        name: "wifi",
        label: "WiFi",
        icon: FiWifi,
        badge: "Popular",
        description: "Reliable internet access for work or streaming.",
      },
      {
        name: "sheets",
        label: "Bed linens",
        icon: FaBed,
        badge: "Essential",
        description: "Fresh linens prepared for every stay.",
      },
      {
        name: "refrigerator",
        label: "Refrigerator",
        icon: FiBox,
        description: "Space to keep drinks, snacks, and groceries chilled.",
      },
    ],
  },
  {
    id: "bathroom",
    title: "Bathroom",
    description: "Comfort and hygiene basics guests expect.",
    icon: FaBath,
    items: [
      {
        name: "hotWater",
        label: "Hot water",
        icon: FaShower,
        badge: "Essential",
        description: "Comfortable showers at any time of day.",
      },
      {
        name: "towels",
        label: "Towels",
        icon: FaSink,
        badge: "Essential",
        description: "Clean towels available for guests.",
      },
      {
        name: "toiletries",
        label: "Toiletries",
        icon: FiDroplet,
        description: "Basic bathroom products for a smoother arrival.",
      },
      {
        name: "hairDryer",
        label: "Hair dryer",
        icon: FiWind,
        description: "Useful after showers or beach days.",
      },
    ],
  },
  {
    id: "kitchen",
    title: "Kitchen",
    description: "For guests who enjoy a more independent stay.",
    icon: FaUtensils,
    items: [
      {
        name: "kitchen",
        label: "Kitchen",
        icon: FaUtensils,
        badge: "Guest favorite",
        description: "A practical space for preparing meals.",
      },
      {
        name: "microwave",
        label: "Microwave",
        icon: FiBox,
        description: "Quick reheating for simple meals.",
      },
      {
        name: "oven",
        label: "Oven",
        icon: FiThermometer,
        description: "Helpful for longer stays and home cooking.",
      },
      {
        name: "kettle",
        label: "Kettle",
        icon: FiCoffee,
        description: "Easy tea and coffee preparation.",
      },
      {
        name: "coffeeMachine",
        label: "Coffee machine",
        icon: FiCoffee,
        badge: "Popular",
        description: "A welcome touch for morning coffee.",
      },
      {
        name: "dishes",
        label: "Dishes",
        icon: FaUtensils,
        description: "Plates, glasses, and basics for dining in.",
      },
    ],
  },
  {
    id: "comfort",
    title: "Comfort",
    description: "Amenities that make every stay more enjoyable.",
    icon: FiFeather,
    items: [
      {
        name: "airConditioning",
        label: "Air conditioning",
        icon: FaSnowflake,
        badge: "Popular",
        description: "Keeps the home cool during warm days.",
      },
      {
        name: "heating",
        label: "Heating",
        icon: FiThermometer,
        description: "Adds comfort during colder evenings.",
      },
      {
        name: "washingMachine",
        label: "Washing machine",
        icon: FiDroplet,
        description: "Helpful for longer stays or beach trips.",
      },
      {
        name: "dryer",
        label: "Dryer",
        icon: FiWind,
        description: "Makes laundry faster and easier.",
      },
      {
        name: "tv",
        label: "Television",
        icon: FiTv,
        description: "Entertainment for quiet evenings indoors.",
      },
      {
        name: "sofa",
        label: "Comfortable sofa",
        icon: FaChair,
        description: "A comfortable place to relax after exploring.",
      },
    ],
  },
  {
    id: "workTech",
    title: "Work & Tech",
    description: "Ideal for remote work or downtime.",
    icon: FiMonitor,
    items: [
      {
        name: "workspace",
        label: "Workspace",
        icon: FiBriefcase,
        badge: "Guest favorite",
        description: "A comfortable spot for laptop work.",
      },
      {
        name: "desk",
        label: "Desk",
        icon: FaChair,
        description: "A dedicated surface for focused work.",
      },
      {
        name: "fastWifi",
        label: "Fast WiFi",
        icon: FiZap,
        badge: "Popular",
        description: "Better speed for calls, work, and streaming.",
      },
      {
        name: "smartTv",
        label: "Smart TV",
        icon: FiAirplay,
        description: "Stream shows and movies with ease.",
      },
    ],
  },
  {
    id: "familyChildren",
    title: "Family & children",
    description: "Thoughtful details for families traveling with children.",
    icon: FaBaby,
    items: [
      {
        name: "crib",
        label: "Crib",
        icon: FaBabyCarriage,
        badge: "Family friendly",
        description: "Useful for families traveling with infants.",
      },
      {
        name: "childrenBooksToys",
        label: "Children books/toys",
        icon: FaBookReader,
        badge: "Family friendly",
        description: "Simple entertainment for younger guests.",
      },
      {
        name: "babyBath",
        label: "Baby bath",
        icon: FaBath,
        description: "Makes bath time easier for infants.",
      },
      {
        name: "windowGuards",
        label: "Window guards",
        icon: FiShield,
        description: "Extra protection around accessible windows.",
      },
      {
        name: "highChair",
        label: "High chair",
        icon: FaChair,
        description: "Helpful for meals with small children.",
      },
      {
        name: "babyMonitor",
        label: "Baby monitor",
        icon: FiMonitor,
        description: "Useful for keeping an eye on sleeping infants.",
      },
    ],
  },
  {
    id: "outdoorViews",
    title: "Outdoor & views",
    description: "Especially valuable for homes in Northern Morocco.",
    icon: FaMountain,
    items: [
      {
        name: "balcony",
        label: "Balcony",
        icon: FaStoreAlt,
        description: "A private outdoor corner for fresh air.",
      },
      {
        name: "terrace",
        label: "Terrace",
        icon: FaWarehouse,
        badge: "Guest favorite",
        description: "Outdoor space for relaxing or dining.",
      },
      {
        name: "seaView",
        label: "Sea view",
        icon: FaWater,
        badge: "Guest favorite",
        description: "A view toward the coast or open water.",
      },
      {
        name: "mountainView",
        label: "Mountain view",
        icon: FaMountain,
        description: "Views of the Rif mountains or nearby hills.",
      },
      {
        name: "medinaView",
        label: "Medina view",
        icon: FaStoreAlt,
        description: "A view into the historic medina atmosphere.",
      },
      {
        name: "natureView",
        label: "Nature view",
        icon: FaTree,
        description: "Green or scenic surroundings from the stay.",
      },
      {
        name: "beachAccess",
        label: "Beach access",
        icon: FaUmbrellaBeach,
        badge: "Popular",
        description: "Easy access to the beach nearby.",
      },
      {
        name: "pool",
        label: "Pool",
        icon: FaSwimmingPool,
        badge: "Popular",
        description: "A pool available for guest use.",
      },
      {
        name: "bbq",
        label: "BBQ",
        icon: FiZap,
        description: "Outdoor cooking for relaxed gatherings.",
      },
      {
        name: "garden",
        label: "Garden",
        icon: FaTree,
        description: "A green outdoor area for guests to enjoy.",
      },
    ],
  },
  {
    id: "services",
    title: "Services",
    description: "Simple touches that add convenience.",
    icon: FaConciergeBell,
    items: [
      {
        name: "breakfast",
        label: "Breakfast",
        icon: FiCoffee,
        badge: "Guest favorite",
        description: "A convenient start to the morning.",
      },
      {
        name: "parking",
        label: "Parking",
        icon: FaParking,
        badge: "Popular",
        description: "Convenient parking option near the stay.",
      },
      {
        name: "petFriendly",
        label: "Pet friendly",
        icon: FaPaw,
        description: "Guests can bring an approved pet.",
      },
      {
        name: "housekeeping",
        label: "Housekeeping",
        icon: FiFeather,
        description: "Cleaning support during the stay.",
      },
      {
        name: "airportShuttle",
        label: "Airport shuttle",
        icon: FiTruck,
        description: "Transport help to or from the airport.",
      },
      {
        name: "reception",
        label: "Reception",
        icon: FaConciergeBell,
        description: "On-site help or check-in assistance.",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    description: "Useful features that help guests feel at ease.",
    icon: FiShield,
    items: [
      {
        name: "smokeDetector",
        label: "Smoke detector",
        icon: FiShield,
        badge: "Essential",
        description: "Alerts guests to smoke inside the property.",
      },
      {
        name: "fireExtinguisher",
        label: "Fire extinguisher",
        icon: FaFireExtinguisher,
        badge: "Essential",
        description: "A safety item for emergency use.",
      },
      {
        name: "outdoorCamera",
        label: "Outdoor camera",
        icon: FiCamera,
        description: "Exterior camera coverage where disclosed.",
      },
      {
        name: "safeBox",
        label: "Safe box",
        icon: FiShield,
        description: "A secure place for small valuables.",
      },
    ],
  },
];

const CAPACITY_ICON_MAP = {
  guests: FiUsers,
  bedrooms: FaBed,
  beds: FaBed,
  bathrooms: FaBath,
};

const API_AMENITY_TO_FORM_KEY = {
  WiFi: "wifi",
  wifi: "wifi",
  hotWater: "hotWater",
  sheets: "sheets",
  towels: "towels",
  toiletries: "toiletries",
  "Hair dryer": "hairDryer",
  hairDryer: "hairDryer",
  refrigerator: "refrigerator",
  Kitchen: "kitchen",
  kitchen: "kitchen",
  microwave: "microwave",
  oven: "oven",
  kettle: "kettle",
  coffeeMachine: "coffeeMachine",
  dishes: "dishes",
  "Air Conditioning": "airConditioning",
  airConditioning: "airConditioning",
  heating: "heating",
  washingMachine: "washingMachine",
  dryer: "dryer",
  tv: "tv",
  sofa: "sofa",
  workspace: "workspace",
  desk: "desk",
  fastWifi: "fastWifi",
  smartTv: "smartTv",
  Crib: "crib",
  crib: "crib",
  "Children books/toys": "childrenBooksToys",
  childrenBooksToys: "childrenBooksToys",
  "Baby bath": "babyBath",
  babyBath: "babyBath",
  "Window guards": "windowGuards",
  windowGuards: "windowGuards",
  "High chair": "highChair",
  highChair: "highChair",
  "Baby monitor": "babyMonitor",
  babyMonitor: "babyMonitor",
  balcony: "balcony",
  terrace: "terrace",
  "Sea View": "seaView",
  seaView: "seaView",
  mountainView: "mountainView",
  medinaView: "medinaView",
  natureView: "natureView",
  beachAccess: "beachAccess",
  Pool: "pool",
  pool: "pool",
  bbq: "bbq",
  garden: "garden",
  breakfast: "breakfast",
  Parking: "parking",
  parking: "parking",
  petFriendly: "petFriendly",
  housekeeping: "housekeeping",
  airportShuttle: "airportShuttle",
  reception: "reception",
  smokeDetector: "smokeDetector",
  fireExtinguisher: "fireExtinguisher",
  outdoorCamera: "outdoorCamera",
  safeBox: "safeBox",
};

const NORTH_MOROCCO_CITIES = [
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
].sort((a, b) => a.localeCompare(b));

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const isWithinNorthernMorocco = (lat, lng) =>
  lat >= NORTHERN_MOROCCO_LIMITS.south &&
  lat <= NORTHERN_MOROCCO_LIMITS.north &&
  lng >= NORTHERN_MOROCCO_LIMITS.west &&
  lng <= NORTHERN_MOROCCO_LIMITS.east;

const getLocationFieldValue = (...values) =>
  values.find((value) => typeof value === "string" && value.trim())?.trim() ||
  "";

const normalizeEditDate = (value) =>
  value ? String(value).split("T")[0] : "";

const normalizeEditTime = (value, fallback) =>
  value ? String(value).slice(0, 5) : fallback;

const normalizeExistingImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return buildApiUrl(imagePath.startsWith("/") ? imagePath : `/${imagePath}`);
};

const buildEditAmenities = (apiAmenities = []) => {
  const nextAmenities = { ...INITIAL_FORM_DATA.amenities };

  apiAmenities.forEach((amenityName) => {
    const key = API_AMENITY_TO_FORM_KEY[amenityName] || amenityName;

    if (Object.prototype.hasOwnProperty.call(nextAmenities, key)) {
      nextAmenities[key] = true;
    }
  });

  return nextAmenities;
};

const buildReverseGeocodePatch = (result) => {
  const address = result?.address || {};
  const city = getLocationFieldValue(
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.county,
  );
  const neighborhood = getLocationFieldValue(
    address.suburb,
    address.neighbourhood,
    address.neighborhood,
    address.city_district,
    address.quarter,
    address.hamlet,
  );
  const street = getLocationFieldValue(
    [address.house_number, address.road].filter(Boolean).join(" "),
    address.road,
    address.pedestrian,
    address.residential,
    address.footway,
    address.path,
    address.amenity,
    address.building,
  );
  const addressFallback = result?.display_name
    ?.split(",")
    .slice(0, 2)
    .join(", ")
    .trim();
  const patch = {};

  if (city) patch.city = city;
  if (street || addressFallback) patch.address = street || addressFallback;
  if (address.postcode) patch.postalCode = address.postcode;
  if (neighborhood) patch.neighborhood = neighborhood;

  return patch;
};

const getGeolocationErrorMessage = (error) => {
  if (!error) {
    return "We couldn’t retrieve your location at the moment.";
  }

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Access to your location was denied. You can still choose a point on the map.";
    case error.POSITION_UNAVAILABLE:
      return "Your location could not be determined. Please try again in a few moments.";
    case error.TIMEOUT:
      return "Location detection took too long. Please try again when your connection is more stable.";
    default:
      return "We couldn’t retrieve your location at the moment.";
  }
};

function LocationMapMarker({ position, onPick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPick(lat, lng);
    },
  });

  return <Marker position={position} icon={markerIcon} />;
}

function LocationMapView({ position }) {
  const map = useMap();
  const hasInitialBounds = useRef(false);

  useEffect(() => {
    if (!hasInitialBounds.current) {
      map.fitBounds(NORTHERN_MOROCCO_BOUNDS, {
        padding: [20, 20],
      });
      hasInitialBounds.current = true;
      return;
    }

    map.flyTo(position, Math.max(map.getZoom(), 13), {
      animate: true,
      duration: 0.8,
    });
  }, [map, position]);

  return null;
}

export default function Publish() {
  // a state for a success alert
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editingStatus, setEditingStatus] = useState("");
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [publishNotice, setPublishNotice] = useState(null);
  const [accountBioSnapshot, setAccountBioSnapshot] = useState("");
  const [hostBioStatus, setHostBioStatus] = useState("idle");
  const [locationMessage, setLocationMessage] = useState({
    type: "info",
    text: "",
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const fileInputRef = useRef(null);
  const reverseGeocodeRequestRef = useRef(0);
  const accountBioRef = useRef("");
  const hostBioTouchedRef = useRef(false);
  const editPropertyId = new URLSearchParams(location.search).get("edit");
  const isEditMode = Boolean(editPropertyId);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleHostBioChange = (event) => {
    hostBioTouchedRef.current = true;
    setHostBioStatus("idle");
    setFormData((current) => ({
      ...current,
      hostDescription: event.target.value,
    }));
  };

  const syncHostBioProfile = async ({ quiet = false } = {}) => {
    const token = localStorage.getItem("token");
    const nextBio = formData.hostDescription.trim();

    if (nextBio === accountBioSnapshot.trim()) {
      return true;
    }

    if (!token) {
      if (!quiet) {
        setHostBioStatus("error");
        setPublishNotice({
          type: "error",
          text: "Please sign in before updating your host bio.",
        });
      }
      return false;
    }

    try {
      setHostBioStatus("saving");
      const response = await fetch(buildApiUrl("/api/users/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: nextBio }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Could not update your host bio.");
      }

      const savedBio = data?.user?.bio || "";
      accountBioRef.current = savedBio;
      setAccountBioSnapshot(savedBio);
      setFormData((current) => ({ ...current, hostDescription: savedBio }));
      setHostBioStatus("saved");

      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, bio: savedBio }),
        );
      } catch {
        /* Keep the form usable if local storage is unavailable. */
      }

      return true;
    } catch (error) {
      setHostBioStatus("error");
      if (!quiet) {
        setPublishNotice({
          type: "error",
          text: error.message || "Could not update your host bio.",
        });
      }
      return false;
    }
  };

  const handleStepperChange = (id, increment) => {
    setFormData((prev) => {
      const currentValue = Number(prev[id]) || 0;
      const newValue = Math.max(0, currentValue + increment);
      return { ...prev, [id]: newValue };
    });
    setErrors((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const handleCapacityInputChange = (id, value) => {
    if (value === "") {
      setFormData((prev) => ({ ...prev, [id]: "" }));
      return;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [id]: Math.min(99, Math.floor(numericValue)),
    }));
    setErrors((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      amenities: {
        ...formData.amenities,
        [name]: checked,
      },
    });
  };

  const handlePropertyTypeSelect = (value) => {
    setFormData({
      ...formData,
      propertyType: value,
    });
  };

  const reverseGeocodeLocation = async (lat, lng) => {
    const requestId = reverseGeocodeRequestRef.current + 1;
    reverseGeocodeRequestRef.current = requestId;
    setIsReverseGeocoding(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=en`,
      );

      if (!response.ok) {
        throw new Error("reverse_geocode_failed");
      }

      const result = await response.json();

      if (reverseGeocodeRequestRef.current !== requestId) return;

      const patch = buildReverseGeocodePatch(result);

      setFormData((prev) => ({
        ...prev,
        ...patch,
      }));

      setLocationMessage({
        type: Object.keys(patch).length > 0 ? "success" : "info",
        text:
          Object.keys(patch).length > 0
            ? "Location saved. Available information was added automatically."
            : "Location saved. Some address details could not be retrieved.",
      });
    } catch {
      if (reverseGeocodeRequestRef.current !== requestId) return;

      setLocationMessage({
        type: "info",
        text: "Location saved. We couldn’t retrieve the address details automatically at the moment.",
      });
    } finally {
      if (reverseGeocodeRequestRef.current === requestId) {
        setIsReverseGeocoding(false);
      }
    }
  };

  const applyPickedLocation = async (lat, lng, source = "map") => {
    if (!isWithinNorthernMorocco(lat, lng)) {
      setLocationMessage({
        type: "error",
        text:
          source === "geolocation"
            ? "Your current location appears to be outside Northern Morocco and cannot be used here."
            : "Please choose a location within Northern Morocco only.",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    }));

    setLocationMessage({
      type: "info",
      text: "Location saved. Searching for address details...",
    });

    await reverseGeocodeLocation(lat, lng);
  };

  const handleMapPick = async (lat, lng) => {
    await applyPickedLocation(lat, lng, "map");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage({
        type: "error",
        text: "Geolocation is not available on your device or in this browser.",
      });
      return;
    }

    setIsLocating(true);
    setLocationMessage({
      type: "info",
      text: "Searching for your current location...",
    });

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setIsLocating(false);
        await applyPickedLocation(
          coords.latitude,
          coords.longitude,
          "geolocation",
        );
      },
      (error) => {
        setIsLocating(false);
        setLocationMessage({
          type: "error",
          text: getGeolocationErrorMessage(error),
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  const handleAvailabilityQuickFill = (daysToAdd) => {
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];

    const endDateObj = new Date();
    endDateObj.setDate(today.getDate() + daysToAdd);
    const endDate = endDateObj.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      availableFrom: startDate,
      availableTo: endDate,
    }));
  };

  const handleImageUpload = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const totalImages =
      existingImageUrls.length + formData.images.length + selectedFiles.length;
    if (totalImages > 35) {
      setPublishNotice({
        type: "error",
        text: "You can upload a maximum of 35 images.",
      });
      return;
    }

    setFormData({
      ...formData,
      images: [...formData.images, ...selectedFiles],
    });

    setImagePreviews([
      ...imagePreviews,
      ...selectedFiles.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleRemoveImage = (idx) => {
    const isExistingImage = idx < existingImageUrls.length;

    if (isExistingImage) {
      setExistingImageUrls(existingImageUrls.filter((_, i) => i !== idx));
      setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
      return;
    }

    const newImageIndex = idx - existingImageUrls.length;
    URL.revokeObjectURL(imagePreviews[idx]);

    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== newImageIndex),
    });

    setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
  };

  const stopWheelChange = (e) => {
    e.target.blur();
  };

  const scrollToFirstError = (newErrors) => {
    const fieldOrder = [
      "title",
      "city",
      "address",
      "guests",
      "beds",
      "price",
      "description",
      "checkIn",
      "checkOut",
      "availableFrom",
      "availableTo",
      "images",
    ];

    const firstErrorField = fieldOrder.find((field) => newErrors[field]);

    if (!firstErrorField) return;

    const target =
      document.getElementById(firstErrorField) ||
      document.querySelector(`[name="${firstErrorField}"]`) ||
      document.querySelector(`[data-error-anchor="${firstErrorField}"]`);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setTimeout(() => {
        if (typeof target.focus === "function") {
          target.focus();
        }
      }, 250);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim())
      newErrors.title = "Please enter a title for your listing.";

    if (!formData.city.trim()) {
      newErrors.city = "Please select a city.";
    } else {
      const allowedCities = cities.map((city) =>
        city.name.toLowerCase().trim(),
      );

      if (!allowedCities.includes(formData.city.toLowerCase().trim())) {
        newErrors.city = "Please choose a valid city within Northern Morocco.";
      }
    }

    if (!formData.address.trim())
      newErrors.address = "Please provide the full address.";

    if (Number(formData.guests) <= 0)
      newErrors.guests = "The number of guests must be greater than 0.";

    if (Number(formData.beds) <= 0)
      newErrors.beds = "The number of beds must be greater than 0.";

    if (Number(formData.price) <= 0)
      newErrors.price = "The nightly rate must be greater than 0.";

    if (!formData.description.trim())
      newErrors.description = "Please add a description of the property.";

    if (!formData.availableFrom) {
      newErrors.availableFrom = "Please provide the start date.";
    }

    if (!formData.availableTo) {
      newErrors.availableTo = "Please provide the end date.";
    }

    if (
      formData.availableFrom &&
      formData.availableTo &&
      formData.availableTo < formData.availableFrom
    ) {
      newErrors.availableTo = "The end date must be later than the start date.";
    }

    if (existingImageUrls.length + formData.images.length < 4) {
      newErrors.images = "Please upload at least 4 images.";
    }

    return newErrors;
  };

  const buildPropertyPayload = (saveAsDraft = false) => {
    const formPayload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "amenities") {
        formPayload.append(key, JSON.stringify(value));
      } else if (key !== "images") {
        formPayload.append(
          key,
          typeof value === "string" ? value.trim() : value,
        );
      }
    });

    formData.images.forEach((file) => formPayload.append("images", file));

    if (isEditMode) {
      formPayload.append("keepImages", JSON.stringify(existingImageUrls));
    }

    if (saveAsDraft) {
      formPayload.append("saveAsDraft", "true");
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;

    if (userId) {
      formPayload.append("idUser", userId);
    }

    return { formPayload, userId };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setPublishNotice({
        type: "error",
        text: "Please sign in before publishing your property.",
      });

      navigate("/Authentication", { state: { from: location.pathname } });
      return;
    }

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
      return;
    }

    if (!formData.availableFrom || !formData.availableTo) {
      setPublishNotice({
        type: "error",
        text: "Please provide the availability period.",
      });
      return;
    }

    if (formData.availableTo < formData.availableFrom) {
      setPublishNotice({
        type: "error",
        text: "The end date must be later than the start date.",
      });
      return;
    }

    const { formPayload, userId } = buildPropertyPayload(false);

    if (!userId) {
      setPublishNotice({
        type: "error",
        text: "Session expired. Please log in again.",
      });
      return;
    }

    const bioSaved = await syncHostBioProfile();
    if (!bioSaved) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        buildApiUrl(
          isEditMode ? `/api/properties/${editPropertyId}` : "/api/publishProperty",
        ),
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formPayload,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred while publishing.");
      }

      setShowSuccess(true);
      setPublishNotice(null);

      if (!isEditMode) {
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);
        setExistingImageUrls([]);
        setFormData({
          ...INITIAL_FORM_DATA,
          hostDescription: accountBioRef.current,
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error :", err);
      setPublishNotice({
        type: "error",
        text: err.message || "An error occurred while publishing.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setPublishNotice({
        type: "error",
        text: "Please sign in before saving a draft.",
      });

      navigate("/Authentication", { state: { from: location.pathname } });
      return;
    }

    if (
      formData.availableFrom &&
      formData.availableTo &&
      formData.availableTo < formData.availableFrom
    ) {
      setPublishNotice({
        type: "error",
        text: "The availability end date must be later than the start date.",
      });
      return;
    }

    const { formPayload, userId } = buildPropertyPayload(true);

    if (!userId) {
      setPublishNotice({
        type: "error",
        text: "Session expired. Please log in again.",
      });
      return;
    }

    const bioSaved = await syncHostBioProfile();
    if (!bioSaved) return;

    setIsSavingDraft(true);
    setPublishNotice(null);

    try {
      const response = await fetch(
        buildApiUrl(
          isEditMode ? `/api/properties/${editPropertyId}` : "/api/publishProperty",
        ),
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
          body: formPayload,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save your draft.");
      }

      setPublishNotice({
        type: "success",
        text: data.message || "Draft saved. You can continue it from My Properties.",
      });
      setErrors({});

      if (!isEditMode && data.propertyId) {
        navigate(`/new-listing?edit=${data.propertyId}`, { replace: true });
      }
    } catch (err) {
      setPublishNotice({
        type: "error",
        text: err.message || "Could not save your draft.",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleGoBack = () => {
    navigate("/", { replace: true });
  };

  
  useEffect(() => {
    fetch(buildApiUrl("/api/cities"))
      .then((r) => r.json())
      .then((d) => {
        const apiNames = d.map((city) => city.name);
        const merged = [...new Set([...apiNames, ...NORTH_MOROCCO_CITIES])];

        setCities(
          merged.map((name, index) => ({
            id_city: index + 1,
            name,
          })),
        );
      })
      .catch(() => {
        setCities(
          NORTH_MOROCCO_CITIES.map((name, index) => ({
            id_city: index + 1,
            name,
          })),
        );
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    let isMounted = true;

    async function loadAccountBio() {
      try {
        const response = await fetch(buildApiUrl("/api/users/me"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "Could not load profile.");
        }

        if (!isMounted) return;

        const bio = data?.user?.bio || "";
        accountBioRef.current = bio;
        setAccountBioSnapshot(bio);
        setFormData((current) =>
          hostBioTouchedRef.current
            ? current
            : { ...current, hostDescription: bio },
        );
      } catch {
        if (isMounted) {
          setHostBioStatus("error");
        }
      }
    }

    loadAccountBio();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Authentication", { state: { from: location.pathname } });
      return;
    }

    let isMounted = true;

    async function loadPropertyForEdit() {
      setIsEditLoading(true);
      setPublishNotice(null);

      try {
        const response = await fetch(
          buildApiUrl(`/api/properties/${editPropertyId}/edit`),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load this listing.");
        }

        if (!isMounted) return;

        const property = data.property || {};
        const apiImages = Array.isArray(property.images)
          ? property.images.filter(Boolean)
          : [];

        setExistingImageUrls(apiImages);
        setImagePreviews(apiImages.map(normalizeExistingImageUrl));
        setEditingStatus(property.status || "");
        setFormData({
          ...INITIAL_FORM_DATA,
          title: property.title || "",
          city: property.city || "",
          propertyType: property.propertyType || "Appartement",
          address: property.address || "",
          neighborhood: property.neighborhood || "",
          postalCode: property.postalCode || "",
          accessInstructions: property.accessInstructions || "",
          latitude: Number(property.latitude) || DEFAULT_LOCATION.latitude,
          longitude: Number(property.longitude) || DEFAULT_LOCATION.longitude,
          guests: property.guests || "",
          bedrooms: property.bedrooms || "",
          bathrooms: property.bathrooms || "",
          beds: property.beds || "",
          price: property.price || "",
          description: property.description || "",
          hostDescription: accountBioRef.current,
          neighborhoodDescription: property.neighborhoodDescription || "",
          checkIn: normalizeEditTime(property.checkIn, "15:00"),
          checkOut: normalizeEditTime(property.checkOut, "11:00"),
          availableFrom: normalizeEditDate(property.availableFrom),
          availableTo: normalizeEditDate(property.availableTo),
          amenities: buildEditAmenities(property.amenities || []),
          images: [],
        });
        setLocationMessage({
          type: "success",
          text: "Listing loaded. Your updates will edit the existing property.",
        });
      } catch (error) {
        if (!isMounted) return;

        setPublishNotice({
          type: "error",
          text: error.message || "Could not load this listing.",
        });
      } finally {
        if (isMounted) {
          setIsEditLoading(false);
        }
      }
    }

    loadPropertyForEdit();

    return () => {
      isMounted = false;
    };
  }, [editPropertyId, isEditMode, location.pathname, navigate]);

  const mapPosition = [formData.latitude, formData.longitude];
  const totalPhotoCount = existingImageUrls.length + formData.images.length;

  return (
    <>
      <div className="pub-page">
        <header className="pub-hero">
          <div className="pub-hero__container">
            <div className="pub-hero__content">
              <button
                type="button"
                className="pub-back-btn"
                onClick={handleGoBack}
              >
                <span aria-hidden="true">←</span>
                Back
              </button>

              <span className="pub-hero__eyebrow">Dar Darek Host Area</span>

              <h1 className="pub-hero__title">
                Create a truly unique <br />
                <em>stay experience.</em>
              </h1>

              <p className="pub-hero__lead">
                Showcase your property and welcome travelers looking for
                authentic experiences across the most beautiful destinations in
                Northern Morocco.
              </p>
            </div>

            <div className="pub-hero__visual">
              <div className="pub-hero__brand">
                {/* <img
                src={logoImage}
                alt="Dar Darek logo"
                className="pub-hero__logo-image"
              /> */}
                {/* <h2 className="pub-hero__brand-name">Dar Darek</h2> */}
              </div>
            </div>
          </div>
        </header>

        <main className="pub-main">
          <form onSubmit={handleSubmit} className="pub-form" noValidate>
            <div className="pub-form-note">
              Fields marked with <span className="pub-required">*</span> are
              required to continue.
            </div>

            {isEditLoading && (
              <div className="pub-inline-message pub-inline-message--info" role="status">
                <span aria-hidden="true">!</span>
                <p>Loading your existing listing...</p>
              </div>
            )}

            {publishNotice && (
              <div
                className={`pub-inline-message pub-inline-message--${publishNotice.type}`}
                role="status"
              >
                <span aria-hidden="true">
                  {publishNotice.type === "success" ? "✓" : "!"}
                </span>
                <p>{publishNotice.text}</p>
              </div>
            )}

            <section className="pub-section">
              <div className="pub-section__head">
                <div className="pub-section__meta">
                  <h2 className="pub-section__title">Basic Information</h2>
                  <p className="pub-section__hint">
                    Set the key details that define your property.
                  </p>
                </div>
              </div>

              <div className="pub-split-grid">
                <div className="pub-subcard">
                  <div className="pub-field">
                    <label className="pub-label" htmlFor="title">
                      Listing title <span className="pub-required">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      className={`pub-input ${
                        errors.title ? "pub-input--error" : ""
                      }`}
                      placeholder="Ex: Stunning riad with medina views"
                      value={formData.title}
                      onChange={handleChange}
                    />
                    {errors.title && (
                      <p className="pub-field-error">{errors.title}</p>
                    )}
                  </div>
                </div>

                <div className="pub-subcard">
                  <div className="pub-field">
                    <label className="pub-label">Property type</label>

                    <div className="pub-property-types pub-property-types--compact">
                      {PROPERTY_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          className={`pub-property-card ${
                            formData.propertyType === type.value
                              ? "pub-property-card--active"
                              : ""
                          }`}
                          aria-describedby={`property-type-description-${type.value.replace(/\W+/g, "-")}`}
                          onClick={() => handlePropertyTypeSelect(type.value)}
                        >
                          {(() => {
                            const TypeIcon = type.icon;

                            return (
                              <span className="pub-property-card__icon">
                                <TypeIcon aria-hidden="true" />
                              </span>
                            );
                          })()}
                          <span className="pub-property-card__label">
                            {type.label}
                          </span>
                          <span
                            id={`property-type-description-${type.value.replace(/\W+/g, "-")}`}
                            role="tooltip"
                            className="pub-property-card__tooltip"
                          >
                            {type.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="pub-section">
              <div className="pub-section__head">
                <div className="pub-section__meta">
                  <h2 className="pub-section__title">Location</h2>
                  <p className="pub-section__hint">
                    Help guests find your property easily by setting its exact
                    location.
                  </p>
                </div>
              </div>

              <div className="pub-location-layout">
                <div className="pub-location-main">
                  <div className="pub-row pub-row--halves">
                    <div className="pub-field">
                      <label className="pub-label" htmlFor="city">
                        City <span className="pub-required">*</span>
                      </label>

                      <div className="pub-select-wrap">
                        <select
                          id="city"
                          name="city"
                          className={`pub-input pub-select ${
                            errors.city ? "pub-input--error" : ""
                          }`}
                          value={formData.city}
                          onChange={handleChange}
                        >
                          <option value="">Select a city</option>
                          {cities.map((c) => (
                            <option key={c.id_city} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.city && (
                        <p className="pub-field-error">{errors.city}</p>
                      )}
                    </div>

                    <div className="pub-field">
                      <label className="pub-label" htmlFor="postalCode">
                        Postal code
                      </label>
                      <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        className="pub-input"
                        placeholder="Ex: 90000"
                        value={formData.postalCode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="pub-row pub-row--halves">
                    <div className="pub-field">
                      <label className="pub-label" htmlFor="neighborhood">
                        Neighborhood / Area
                      </label>
                      <input
                        id="neighborhood"
                        name="neighborhood"
                        type="text"
                        className="pub-input"
                        placeholder="Ex: Medina, Malabata, Cabo Negro..."
                        value={formData.neighborhood}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="pub-field">
                      <label className="pub-label" htmlFor="address">
                        Full address <span className="pub-required">*</span>
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        className={`pub-input ${
                          errors.address ? "pub-input--error" : ""
                        }`}
                        placeholder="Ex: 12 Rue Outa el Hammam, Chefchaouen"
                        value={formData.address}
                        onChange={handleChange}
                      />
                      {errors.address && (
                        <p className="pub-field-error">{errors.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="pub-field">
                    <label className="pub-label" htmlFor="accessInstructions">
                      Access details
                    </label>
                    <textarea
                      id="accessInstructions"
                      name="accessInstructions"
                      className="pub-input pub-textarea pub-textarea--medium"
                      placeholder="Ex: The entrance is on the left of the main door, just past the small alley. Add anything here that may help guests find the property easily."
                      value={formData.accessInstructions}
                      onChange={handleChange}
                    />
                  </div>
                  <input
                    type="hidden"
                    name="latitude"
                    value={formData.latitude}
                  />
                  <input
                    type="hidden"
                    name="longitude"
                    value={formData.longitude}
                  />
                </div>

                <aside className="pub-location-aside">
                  <div className="pub-location-card pub-location-card--map">
                    <div className="pub-location-card__top">
                      <span className="pub-location-card__icon">📍</span>
                      <h3 className="pub-location-card__title">Map location</h3>
                    </div>

                    <div className="pub-location-actions">
                      <button
                        type="button"
                        className="pub-location-action-btn"
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                      >
                        {isLocating ? "Locating..." : "Use current location"}
                      </button>
                    </div>

                    {(isReverseGeocoding || locationMessage.text) && (
                    <div
                      className={`pub-inline-message pub-inline-message--${locationMessage.type}`}
                      role="status"
                    >
                      <span aria-hidden="true">
                        {locationMessage.type === "success" ? "✓" : "!"}
                      </span>
                      <p>
                        {isReverseGeocoding
                          ? "Searching for address details..."
                          : locationMessage.text}
                      </p>
                    </div>
                    )}

                    <div className="pub-location-map-shell">
                      <MapContainer
                        center={NORTHERN_MOROCCO_CENTER}
                        zoom={8}
                        minZoom={8}
                        maxBounds={NORTHERN_MOROCCO_BOUNDS}
                        maxBoundsViscosity={1}
                        scrollWheelZoom={true}
                        className="pub-location-map"
                      >
                        <TileLayer
                          attribution="&copy; OpenStreetMap contributors"
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMapView position={mapPosition} />
                        <LocationMapMarker
                          position={mapPosition}
                          onPick={handleMapPick}
                        />
                      </MapContainer>
                    </div>
                  </div>
                </aside>
              </div>
            </section>

            <section className="pub-section">
              <div className="pub-section__head">
                <div className="pub-section__meta">
                  <h2 className="pub-section__title">Capacity & Spaces</h2>
                  <p className="pub-section__hint">
                    Indicate how many guests your space can comfortably
                    accommodate.
                  </p>
                </div>
              </div>

              <div className="pub-details-grid">
                {[
                  { id: "guests", label: "Guests", icon: "👥" },
                  { id: "bedrooms", label: "Bedrooms", icon: "🛏️" },
                  { id: "beds", label: "Beds", icon: "🛌" },
                  { id: "bathrooms", label: "Bathrooms", icon: "🚿" },
                ].map(({ id, label }) => (
                  <div
                    className="pub-detail-card"
                    key={id}
                    data-error-anchor={id}
                  >
                    <div className="pub-detail-card__header">
                      <span className="pub-detail-card__icon">
                        {(() => {
                          const DetailIcon = CAPACITY_ICON_MAP[id];
                          return <DetailIcon aria-hidden="true" />;
                        })()}
                      </span>
                      <label className="pub-detail-card__label" htmlFor={id}>
                        {label}
                      </label>
                    </div>

                    <div className="pub-stepper">
                      <button
                        type="button"
                        className="pub-stepper__btn"
                        onClick={() => handleStepperChange(id, -1)}
                        disabled={Number(formData[id] || 0) <= 0}
                        aria-label={`Decrease ${label.toLowerCase()}`}
                      >
                        <FiMinus aria-hidden="true" />
                      </button>
                      <input
                        id={id}
                        name={id}
                        type="number"
                        min="0"
                        max="99"
                        inputMode="numeric"
                        className="pub-stepper__input"
                        value={formData[id]}
                        placeholder="0"
                        onChange={(event) =>
                          handleCapacityInputChange(id, event.target.value)
                        }
                        onWheel={stopWheelChange}
                        onKeyDown={(event) => {
                          if (["e", "E", "+", "-", "."].includes(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        aria-label={label}
                      />
                      <button
                        type="button"
                        className="pub-stepper__btn"
                        onClick={() => handleStepperChange(id, 1)}
                        aria-label={`Increase ${label.toLowerCase()}`}
                      >
                        <FiPlus aria-hidden="true" />
                      </button>
                    </div>
                    {errors[id] && (
                      <p className="pub-field-error">{errors[id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="pub-section">
              <div className="pub-section__head">
                <div className="pub-section__meta">
                  <h2 className="pub-section__title">Amenities</h2>
                  <p className="pub-section__hint">
                    Choose the amenities that will enhance your guests’
                    experience.
                  </p>
                </div>
              </div>

              <div className="pub-amenities-wrapper">
                {AMENITY_GROUPS.map((group) => (
                  <div className="pub-amenity-group" key={group.id}>
                    <div className="pub-amenity-group__info">
                      <span className="pub-amenity-group__icon">
                        {(() => {
                          const GroupIcon = group.icon;
                          return <GroupIcon aria-hidden="true" />;
                        })()}
                      </span>
                      <div>
                        <h3 className="pub-amenity-group__title">
                          {group.title}
                        </h3>
                        <p className="pub-amenity-group__description">
                          {group.description}
                        </p>
                      </div>
                    </div>

                    <div className="pub-amenity-chips">
                      {group.items.map((item) => {
                        const AmenityIcon = item.icon;

                        return (
                          <label
                            key={item.name}
                            className={`pub-chip ${
                              formData.amenities[item.name]
                                ? "pub-chip--active"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              name={item.name}
                              checked={formData.amenities[item.name]}
                              onChange={handleAmenityChange}
                              className="pub-chip__input"
                            />
                            <span className="pub-chip__icon">
                              <AmenityIcon aria-hidden="true" />
                            </span>
                            <span className="pub-chip__body">
                              <span className="pub-chip__label">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="pub-chip__badge">
                                  {item.badge}
                                </span>
                              )}
                            </span>
                            <span className="pub-chip__tooltip" role="tooltip">
                              {item.description}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="pub-section">
              <div className="pub-section__head">
                <div className="pub-section__meta">
                  <h2 className="pub-section__title">Description</h2>
                  <p className="pub-section__hint">
                    Give guests a clear sense of your space, your hosting style,
                    and the surrounding area.
                  </p>
                </div>
              </div>

              <div className="pub-description-stack">
                <div className="pub-description-card">
                  <div className="pub-description-card__head">
                    <span className="pub-description-card__icon">🏡</span>
                    <div>
                      <h3 className="pub-description-card__title">
                        About the property{" "}
                        <span className="pub-required">*</span>
                      </h3>
                      <p className="pub-description-card__hint">
                        Describe the atmosphere, key features, and what makes
                        your space memorable.
                      </p>
                    </div>
                  </div>

                  <textarea
                    id="description"
                    name="description"
                    className={`pub-input pub-textarea pub-description-textarea ${
                      errors.description ? "pub-input--error" : ""
                    }`}
                    placeholder="Ex: A bright apartment with a balcony, thoughtful décor, a calm atmosphere, and a convenient location for exploring the city..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                  {errors.description && (
                    <p className="pub-field-error">{errors.description}</p>
                  )}
                </div>

                <div className="pub-description-card">
                  <div className="pub-description-card__head">
                    <span className="pub-description-card__icon">👤</span>
                    <div>
                      <h3 className="pub-description-card__title">About you</h3>
                      <p className="pub-description-card__hint">
                        Share a few words about your hosting style or anything
                        helpful guests should know.
                      </p>
                    </div>
                  </div>

                  <textarea
                    id="hostDescription"
                    name="hostDescription"
                    className="pub-input pub-textarea pub-description-textarea pub-description-textarea--secondary"
                    placeholder="Ex: A responsive host, always happy to help and share the best local recommendations."
                    value={formData.hostDescription}
                    onChange={handleHostBioChange}
                    onBlur={() => syncHostBioProfile({ quiet: true })}
                  />
                  {hostBioStatus === "saving" && (
                    <p className="pub-field-note">Saving to your profile...</p>
                  )}
                  {hostBioStatus === "saved" && (
                    <p className="pub-field-note pub-field-note--success">
                      Saved to your Account Settings bio.
                    </p>
                  )}
                  {hostBioStatus === "error" && (
                    <p className="pub-field-error">
                      Could not sync this bio with Account Settings yet.
                    </p>
                  )}
                </div>

                <div className="pub-description-card">
                  <div className="pub-description-card__head">
                    <span className="pub-description-card__icon">📍</span>
                    <div>
                      <h3 className="pub-description-card__title">
                        About the area
                      </h3>
                      <p className="pub-description-card__hint">
                        Mention the atmosphere, nearby attractions, views, or
                        useful places around the property.
                      </p>
                    </div>
                  </div>

                  <textarea
                    id="neighborhoodDescription"
                    name="neighborhoodDescription"
                    className="pub-input pub-textarea pub-description-textarea pub-description-textarea--secondary"
                    placeholder="Ex: A lively yet pleasant neighborhood, close to the center, with cafés, restaurants, and scenic walks nearby."
                    value={formData.neighborhoodDescription}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section className="pub-section">
              <div className="pub-section__head">
                <div className="pub-section__meta">
                  <h2 className="pub-section__title">Check-in & Check-out</h2>
                  <p className="pub-section__hint">
                    Set clear arrival and departure times for your guests.
                  </p>
                </div>
              </div>

              <div className="pub-stay-grid">
                <div className="pub-stay-card">
                  <div className="pub-stay-card__top">
                    <span className="pub-stay-card__icon">🕒</span>
                    <div>
                      <h3 className="pub-stay-card__title">Check-in time</h3>
                      <p className="pub-stay-card__hint">
                        When can guests arrive?
                      </p>
                    </div>
                  </div>

                  <div className="pub-time-picker">
                    <input
                      id="checkIn"
                      name="checkIn"
                      type="time"
                      className={`pub-input pub-stay-input ${
                        errors.checkIn ? "pub-input--error" : ""
                      }`}
                      value={formData.checkIn}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.checkIn && (
                    <p className="pub-field-error">{errors.checkIn}</p>
                  )}
                </div>

                <div className="pub-stay-card">
                  <div className="pub-stay-card__top">
                    <span className="pub-stay-card__icon">🚪</span>
                    <div>
                      <h3 className="pub-stay-card__title">Check-out time</h3>
                      <p className="pub-stay-card__hint">
                        When should guests check out?
                      </p>
                    </div>
                  </div>

                  <div className="pub-time-picker">
                    <input
                      id="checkOut"
                      name="checkOut"
                      type="time"
                      className={`pub-input pub-stay-input ${
                        errors.checkOut ? "pub-input--error" : ""
                      }`}
                      value={formData.checkOut}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.checkOut && (
                    <p className="pub-field-error">{errors.checkOut}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="pub-section">
              <div className="pub-section__head">
                <div className="pub-section__meta">
                  <h2 className="pub-section__title">Availability</h2>
                  <p className="pub-section__hint">
                    Set the period during which your property is available for
                    booking.
                  </p>
                </div>
              </div>

              <div className="pub-availability-box">
                <div className="pub-availability-head">
                  <span className="pub-availability-head__icon">📅</span>
                  <div>
                    <h3 className="pub-availability-head__title">
                      Availability period
                    </h3>
                    <p className="pub-availability-head__hint">
                      Let guests know when your property is open for bookings.
                    </p>
                  </div>
                </div>

                <div className="pub-availability-actions">
                  <button
                    type="button"
                    className="pub-availability-chip"
                    onClick={() => handleAvailabilityQuickFill(7)}
                  >
                    Next 7 days
                  </button>

                  <button
                    type="button"
                    className="pub-availability-chip"
                    onClick={() => handleAvailabilityQuickFill(30)}
                  >
                    Next 30 days
                  </button>

                  <button
                    type="button"
                    className="pub-availability-chip"
                    onClick={() => handleAvailabilityQuickFill(90)}
                  >
                    Next 3 months
                  </button>
                </div>

                <div className="pub-availability-grid">
                  <div className="pub-field">
                    <label className="pub-label" htmlFor="availableFrom">
                      Available from <span className="pub-required">*</span>
                    </label>
                    <input
                      id="availableFrom"
                      name="availableFrom"
                      type="date"
                      className={`pub-input pub-availability-input ${
                        errors.availableFrom ? "pub-input--error" : ""
                      }`}
                      value={formData.availableFrom}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        const newFrom = e.target.value;

                        setFormData((prev) => {
                          let updatedTo = prev.availableTo;

                          if (!updatedTo || updatedTo < newFrom) {
                            const suggestedEnd = new Date(newFrom);
                            suggestedEnd.setDate(suggestedEnd.getDate() + 7);
                            updatedTo = suggestedEnd
                              .toISOString()
                              .split("T")[0];
                          }

                          return {
                            ...prev,
                            availableFrom: newFrom,
                            availableTo: updatedTo,
                          };
                        });
                      }}
                    />
                    {errors.availableFrom && (
                      <p className="pub-field-error">{errors.availableFrom}</p>
                    )}
                  </div>

                  <div className="pub-field">
                    <label className="pub-label" htmlFor="availableTo">
                      Available until <span className="pub-required">*</span>
                    </label>
                    <input
                      id="availableTo"
                      name="availableTo"
                      type="date"
                      className={`pub-input pub-availability-input ${
                        errors.availableTo ? "pub-input--error" : ""
                      }`}
                      value={formData.availableTo}
                      min={
                        formData.availableFrom ||
                        new Date().toISOString().split("T")[0]
                      }
                      onChange={handleChange}
                    />
                    {errors.availableTo && (
                      <p className="pub-field-error">{errors.availableTo}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="pub-section">
              <div className="pub-section__head pub-section__head--spread">
                <div className="pub-section__head-left">
                  <div className="pub-section__meta">
                    <h2 className="pub-section__title">Photo gallery</h2>
                    <p className="pub-section__hint">
                      Add bright, high-quality photos that best represent your
                      property.
                    </p>
                  </div>
                </div>

                <div
                  className={`pub-photo-counter ${
                    totalPhotoCount >= 4 ? "pub-photo-counter--ok" : ""
                  }`}
                >
                  {totalPhotoCount} / 35{" "}
                  {totalPhotoCount >= 4 && "✓"}
                </div>
              </div>

              <div className="pub-photos-layout" data-error-anchor="images">
                <div className="pub-photos-toolbar">
                  <label htmlFor="images" className="pub-upload-trigger">
                    <span className="pub-upload-trigger__icon">📷</span>
                    <span className="pub-upload-trigger__text">
                      Upload photos
                    </span>
                  </label>

                  <div className="pub-photos-helper">
                    Minimum 4 photos • Maximum 35 photos
                  </div>
                </div>
                <input
                  id="images"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="pub-file-hidden"
                />
                {errors.images && (
                  <p className="pub-field-error">{errors.images}</p>
                )}
                {imagePreviews.length > 0 ? (
                  <div className="pub-photo-grid pub-photo-grid--enhanced">
                    {imagePreviews.map((src, i) => (
                      <div
                        className="pub-photo-card pub-photo-card--enhanced"
                        key={i}
                      >
                        <img
                          src={src}
                          alt={`Preview ${i + 1}`}
                          className="pub-photo-card__img"
                        />

                        <div className="pub-photo-card__overlay">
                          {i === 0 && (
                            <span className="pub-photo-card__badge">Main</span>
                          )}

                          <button
                            type="button"
                            className="pub-photo-card__remove"
                            onClick={() => handleRemoveImage(i)}
                            aria-label="Remove"
                          >
                            ✖
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pub-photos-empty">
                    <div className="pub-photos-empty__icon">🖼️</div>
                    <h3 className="pub-photos-empty__title">
                      No photos added yet
                    </h3>
                    <p className="pub-photos-empty__text">
                      Start by adding at least 4 photos to showcase your
                      property.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="pub-section pub-section--highlight">
              <div className="pub-section__head">
                <div className="pub-section__meta">
                  <h2 className="pub-section__title">Pricing</h2>
                  <p className="pub-section__hint">
                    Set a fair and competitive nightly rate in Moroccan dirhams.
                  </p>
                </div>
              </div>

              <div className="pub-price-wrap">
                <div className="pub-price-box">
                  <span className="pub-price-currency">MAD</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    className={`pub-input pub-input--price ${
                      errors.price ? "pub-input--error" : ""
                    }`}
                    placeholder="0"
                    value={formData.price}
                    onChange={handleChange}
                    onWheel={stopWheelChange}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {errors.price && (
                    <p className="pub-field-error">{errors.price}</p>
                  )}
                  <span className="pub-price-unit">/ night</span>
                </div>

                <div className="pub-price-tip">
                  <span className="pub-price-tip__icon">💡</span>
                  <p>
                    Similar homes in Northern Morocco are typically priced
                    between <strong>350</strong> and <strong>900 MAD</strong>{" "}
                    per night.
                  </p>
                </div>
              </div>
            </section>

            <div className="pub-submit-bar">
              <div className="pub-submit-bar__text">
                <strong>
                  {isEditMode
                    ? "Ready to save your listing?"
                    : "Ready to start hosting?"}
                </strong>
                <span>
                  {isEditMode
                    ? "Your updates will be saved to this existing property."
                    : "Your listing will soon be visible to thousands of travelers."}
                </span>
              </div>

              <div className="pub-submit-bar__actions">
                <button
                  type="button"
                  className="pub-draft-btn"
                  disabled={isSubmitting || isSavingDraft || isEditLoading}
                  onClick={handleSaveDraft}
                >
                  {isSavingDraft ? (
                    <span className="pub-submit-btn__spinner pub-submit-btn__spinner--dark" />
                  ) : (
                    "Save draft"
                  )}
                </button>

                <button
                  type="submit"
                  className="pub-submit-btn"
                  disabled={isSubmitting || isSavingDraft || isEditLoading}
                >
                  {isSubmitting ? (
                    <span className="pub-submit-btn__spinner" />
                  ) : (
                    isEditMode && ["draft", "rejected"].includes(editingStatus)
                      ? "Submit listing"
                      : isEditMode
                        ? "Save changes"
                        : "Publish listing"
                  )}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
      {showSuccess && (
        <SuccessAlert
          message={
            isEditMode
              ? "Property updated successfully!"
              : "Property listed successfully!"
          }
          subMessage={
            isEditMode
              ? "Your listing changes have been saved."
              : "Your listing has been submitted successfully and is now awaiting approval."
          }
          onClose={() => setShowSuccess(false)}
        />
      )}
      {/* <div className="pub-footer-wrap">
        <Footer />
      </div> */}
    </>
  );
}

