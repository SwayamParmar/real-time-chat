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

        /*
         * Drop the socket first. It emits `presenceLogout`, which decrements
         * this account's socket ref count server-side and skips the reconnect
         * grace period — so by the time the REST call lands, the presence
         * record already reflects reality (still online if another tab is
         * open, offline if this was the last one).
         */
        disconnectSocket();

        /*
         * Then tell the server, while the token is still being sent, so it can
         * clear the presence record for the case where no socket was ever
         * connected — otherwise the account keeps reading as "online" until
         * the JWT expires.
         *
         * A failure here must never strand someone in a signed-in UI they can't
         * leave, so the local teardown below runs either way.
         */ 
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