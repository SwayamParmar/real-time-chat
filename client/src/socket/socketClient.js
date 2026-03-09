import { io } from "socket.io-client";
import config from "../config";
import { useAuthStore } from "../store/authStore";

let socket;

export const connectSocket = () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    socket = io(config.SOCKET_URL, {
        query: { token },
        transports: ["websocket"], // ✅ skip long-polling, go straight to websocket
    });

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("❌ Socket error:", err.message));

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};