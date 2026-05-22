import { FiHome } from "react-icons/fi";
import {
  FaConciergeBell,
  FaHotel,
  FaMountain,
  FaStoreAlt,
  FaWarehouse,
} from "react-icons/fa";

export const PROPERTY_TYPES = [
  {
    value: "Appartement",
    label: "Apartment",
    icon: FaHotel,
    description: "A private apartment in a residential building.",
  },
  {
    value: "Studio",
    label: "Studio",
    icon: FiHome,
    description: "A compact private space ideal for solo travelers or couples.",
  },
  {
    value: "Maison",
    label: "House",
    icon: FiHome,
    description: "A full home for guests who want more privacy and space.",
  },
  {
    value: "Villa",
    label: "Villa",
    icon: FaWarehouse,
    description:
      "A spacious stay with a premium feel, often with outdoor areas.",
  },
  {
    value: "Riad",
    label: "Riad",
    icon: FaStoreAlt,
    description: "A traditional Moroccan stay with authentic charm.",
  },
  {
    value: "Maison d'hôtes",
    label: "Guest house",
    icon: FaConciergeBell,
    description: "A hosted guest house with a warmer local experience.",
  },
  {
    value: "Traditional House",
    label: "Traditional House",
    icon: FaStoreAlt,
    description: "A local-style home with cultural character.",
  },
  {
    value: "Cabin / Chalet",
    label: "Cabin / Chalet",
    icon: FaMountain,
    description: "A cozy nature-inspired stay for calm escapes.",
  },
];

export const PROPERTY_TYPE_VALUES = PROPERTY_TYPES.map((type) => type.value);

export const PROPERTY_TYPE_LEGACY_VALUE_MAP = {
  Apartment: "Appartement",
  House: "Maison",
  "Guest house": "Maison d'hôtes",
};

export function normalizePropertyTypeValue(value) {
  return PROPERTY_TYPE_LEGACY_VALUE_MAP[value] || value;
}

export function getPropertyTypeLabel(value) {
  const normalizedValue = normalizePropertyTypeValue(value);
  return (
    PROPERTY_TYPES.find((type) => type.value === normalizedValue)?.label ||
    normalizedValue ||
    "Property"
  );
}
