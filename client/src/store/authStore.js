import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { disconnectSocket } from "../socket/socketClient";
import config from "../config";

const getInitialAuth = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) return { token: null, user: null };

    try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.clear();
            return { token: null, user: null };
        }

        return {
            token,
            user: JSON.parse(user),
        };
    } catch {
        localStorage.clear();
        return { token: null, user: null };
    }
};

export const useAuthStore = create((set, get) => ({
    // avoids the undefined case
    token: null,
    user: null,
    ...getInitialAuth(),

    login: (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        set({
            token: data.token,
            user: data.user,
        });
    },

    logout: async () => {
        const { token } = get();

        // Drop the socket first: it emits presenceLogout, so the presence
        // record is already correct by the time the REST call lands.
        disconnectSocket();

        // Then tell the server, which covers the case where no socket was ever
        // connected. The local teardown below runs either way.
        if (token) {
            try {
                await fetch(`${config.API_BASE_URL}/user/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
            } catch (error) {
                console.error("Logout request failed:", error);
            }
        }

        localStorage.clear();
        set({ token: null, user: null });
    },
}));