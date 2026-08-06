import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // This ensures cookies are sent with requests
});

export default apiClient;
