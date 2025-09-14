import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// // Request interceptor
// apiClient.interceptors.request.use(
//   (config) => {
//     // Add auth token if available
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle common errors
//     if (error.response?.status === 401) {
//       // Redirect to login
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
