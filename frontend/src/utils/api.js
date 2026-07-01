const DEFAULT_API_ORIGIN = "http://localhost:5000";

const normalizeOrigin = (value) => {
  if (!value) {
    return DEFAULT_API_ORIGIN;
  }

  return value.replace(/\/$/, "");
};

export const API_ORIGIN = normalizeOrigin(import.meta.env.VITE_API_ORIGIN);
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const getAuthToken = () => localStorage.getItem("token");

export const buildApiUrl = (path = "") => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export const buildOriginUrl = (path = "") => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
};

export const apiFetch = (path, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(buildApiUrl(path), {
    ...options,
    cache: options.cache || "no-store",
    headers,
  });
};

export default API_BASE_URL;
