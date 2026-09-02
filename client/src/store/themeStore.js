import { create } from "zustand";

const STORAGE_KEY = "theme";

// Dark is the default, so anyone who used the app before the toggle existed
// keeps the look they already had.
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
            // Private mode or blocked storage — the choice just won't persist.
        }
        set({ theme });
    },

    toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
}));

// Keeps the attribute in sync when the module loads, which covers the case
// where localStorage was written by another tab since the inline boot script
// in index.html ran.
apply(useThemeStore.getState().theme);
