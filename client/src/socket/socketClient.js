import { io } from "socket.io-client";
import config from "../config";
import { useAuthStore } from "../store/authStore";

let socket;
let heartbeatTimer;

// Must stay well under the server's PRESENCE_TTL_MS.
const HEARTBEAT_MS = 15000;

const newId = () =>
    crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Stable for the life of the tab. The server uses it to drop this tab's
// previous socket on reconnect.
const getTabId = () => {
    try {
        let id = sessionStorage.getItem("socketTabId");
        if (!id) {
            id = newId();
            sessionStorage.setItem("socketTabId", id);
        }
        return id;
    } catch {
        return newId();
    }
};

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

// Reconnect on focus instead of waiting out the backoff.
const onVisibilityChange = () => {
    if (document.visibilityState === "visible" && socket && !socket.connected) {
        socket.connect();
    }
};

export const connectSocket = () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    // Never stack a second socket on top of a live one.
    if (socket) return socket;

    socket = io(config.SOCKET_URL, {
        query: { token, tabId: getTabId() },
        transports: ["websocket"], // ✅ skip long-polling, go straight to websocket
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        timeout: 10000,
    });

    socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        socket.emit("presencePing");
        startHeartbeat();
    });

    socket.on("disconnect", stopHeartbeat);

    socket.on("connect_error", (err) => {
        console.error("❌ Socket error:", err.message);
        // A rejected token fails the same way every time; let the auth layer
        // deal with it instead of retrying forever.
        if (/token/i.test(err.message)) socket.disconnect();
    });

    document.addEventListener("visibilitychange", onVisibilityChange);

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    stopHeartbeat();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    if (socket) {
        // A deliberate sign-out, so the server skips the reconnect grace.
        if (socket.connected) socket.emit("presenceLogout");
        socket.disconnect();
        socket = null;
    }
};
