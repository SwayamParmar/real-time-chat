import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { disconnectSocket } from "../socket/socketClient";

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

export const useAuthStore = create((set) => ({
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

    logout: () => {
        disconnectSocket();
        localStorage.clear();
        set({ token: null, user: null });
    },
}));