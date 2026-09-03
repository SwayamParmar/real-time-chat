import { create } from "zustand";
import config from "../config";
import { toast } from "react-toastify";
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
    // Off until the server says otherwise.
    notificationsEnabled: false,
    loaded: false,

    fetchSettings: async () => {
        try {
            const res = await request("GET");
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load settings");

            set({
                notificationsEnabled: data.settings?.notifications_enabled === true,
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
            toast.error("Could not save your notification setting", {
                position: "top-right",
                autoClose: 4000,
                theme: "colored",
            });
            set({ notificationsEnabled: previous });
        }
    },

    reset: () => set({ notificationsEnabled: false, loaded: false }),
}));
