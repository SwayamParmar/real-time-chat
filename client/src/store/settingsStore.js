import { create } from "zustand";
import config from "../config";
import { useAuthStore } from "./authStore";

const request = (method, body) => {
    const token = useAuthStore.getState().token;
    return fetch(`${config.API_BASE_URL}/user/settings`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        ...(body ? { body: JSON.stringify(body) } : null),
    });
};

export const useSettingsStore = create((set, get) => ({
    // Assume on until the server says otherwise, so the first message after a
    // reload is not silently dropped while the fetch is in flight.
    notificationsEnabled: true,
    loaded: false,

    fetchSettings: async () => {
        try {
            const res = await request("GET");
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load settings");

            set({
                notificationsEnabled: data.settings?.notifications_enabled !== false,
                loaded: true,
            });
        } catch (error) {
            console.error("Fetch settings error:", error);
        }
    },

    setNotificationsEnabled: async (enabled) => {
        const previous = get().notificationsEnabled;
        set({ notificationsEnabled: enabled });

        try {
            const res = await request("PATCH", { notifications_enabled: enabled });
            if (!res.ok) throw new Error("Failed to save setting");
        } catch (error) {
            console.error("Update settings error:", error);
            set({ notificationsEnabled: previous });
        }
    },

    reset: () => set({ notificationsEnabled: true, loaded: false }),
}));
