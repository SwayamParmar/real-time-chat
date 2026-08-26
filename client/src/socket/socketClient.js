import { io } from "socket.io-client";
import config from "../config";
import { useAuthStore } from "../store/authStore";

let socket;
let heartbeatTimer;

// Must stay well under the server's PRESENCE_TTL_MS (45s) so a live tab is
// never swept as stale.
const HEARTBEAT_MS = 15000;

const startHeartbeat = () => {
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
        if (socket?.connected) socket.emit("presencePing");
    }, HEARTBEAT_MS);
};

const stopHeartbeat = () => {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
};

export const connectSocket = () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    // Never stack a second socket on top of a live one: two sockets for one
    // tab means two presence entries, and closing one used to look like the
    // user going offline.
    if (socket) return socket;

    socket = io(config.SOCKET_URL, {
        query: { token },
        transports: ["websocket"], // ✅ skip long-polling, go straight to websocket
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
    });

    socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        socket.emit("presencePing");
        startHeartbeat();
    });
    socket.on("disconnect", stopHeartbeat);
    socket.on("connect_error", (err) => console.error("❌ Socket error:", err.message));

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    stopHeartbeat();
    if (socket) {
        // Tell the server this is a deliberate sign-out, not a dropped
        // connection, so it skips the reconnect grace period.
        if (socket.connected) socket.emit("presenceLogout");
        socket.disconnect();
        socket = null;
    }
};