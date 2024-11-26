// src/config.js
const BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const config = {
    API_BASE_URL: BASE_URL, // Base API URL
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || "http://localhost:5000",
    ENVIRONMENT: process.env.NODE_ENV || "development",
  // Add other reusable constants if needed
};

export default config;
