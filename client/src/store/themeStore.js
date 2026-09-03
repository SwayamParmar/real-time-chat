import { create } from "zustand";

const STORAGE_KEY = "theme";

// Dark is the default.
const getInitialTheme = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
        return "dark";
    }
};

const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
};

export const useThemeStore = create((set, get) => ({
    theme: getInitialTheme(),

    setTheme: (theme) => {
        apply(theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Private mode or blocked storage; the choice won't persist.
        }
        set({ theme });
    },

    toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
}));

// Sync the attribute on load, in case another tab wrote localStorage after the
// inline boot script in index.html ran.
apply(useThemeStore.getState().theme);
