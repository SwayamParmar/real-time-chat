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
         * Tell the server first, while the token is still being sent, so it can
         * clear the presence record — otherwise the account keeps reading as
         * "online" to everyone else until the JWT expires or the socket happens
         * to drop on its own.
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

        disconnectSocket();
        localStorage.clear();
        set({ token: null, user: null });
    },
}));