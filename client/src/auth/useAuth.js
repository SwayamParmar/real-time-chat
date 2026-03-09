// src/auth/useAuth.js
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const getToken = () => localStorage.getItem("token");
const getUser = () => JSON.parse(localStorage.getItem("user"));

const useAuth = () => {
    const [user, setUser] = useState(null);

    const checkAuth = () => {
    const token = getToken();
    const userData = getUser();

    if (!token || !userData) return false;

    try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
            logout();
            return false;
        }
        setUser(userData);
        return true;
        } catch {
        logout();
        return false;
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = "/login"; // Optional: redirect
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return {
        user,
        isAuthenticated: !!user,
        logout,
    };
};

export default useAuth;
