import axios from "axios";

const DEFAULT_API_URL = "http://localhost:5000";
const DEFAULT_GOOGLE_CLIENT_ID =
  "1053795619331-gldssns0qs9dol9j9rrfouf8ajkqkmj6.apps.googleusercontent.com";

const normalizeBaseUrl = (value) =>
  (value || DEFAULT_API_URL).replace(/\/+$/, "");

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

axios.defaults.baseURL = API_BASE_URL;

export const buildApiUrl = (path = "") => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const createAuthConfig = (token) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
