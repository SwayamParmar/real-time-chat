import { io } from "socket.io-client";

// Replace with your server URL (ensure CORS is configured properly)
const SERVER_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

// Initialize and export the socket instance
export const socket = io(SERVER_URL, {
    autoConnect: false, // Prevents automatic connection until explicitly triggered
});