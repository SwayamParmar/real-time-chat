import User from "../models/user.model";
import { generateToken } from "../utils/jwt.util";

import type { SignupRequest } from "../types/signup-request.type";
import type { LoginRequest } from "../types/login-request.type";
import type { AuthResponse } from "../types/auth-response.type";
import type { LogoutResponse } from "../types/logout-response.type";

export const signup = async (
    data: SignupRequest,
): Promise<AuthResponse> => {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Email already registered.");
    }

    const newUser = await User.create({
        name,
        email,
        password,
        isVerified: 1,
    });

    const token = generateToken(newUser._id.toString());

    return {
        message: "User registered successfully.",
        token,
        user: {
            id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
        },
    };
};

export const login = async (
    data: LoginRequest,
): Promise<AuthResponse> => {
    const { email, password } = data;

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const isPasswordValid = await user.isValidPassword(password);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password.");
    }

    const token = generateToken(user._id.toString());

    return {
        message: "Login successful.",
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        },
    };
};
/**
 * Sign the current user out.
 *
 * The access token is a stateless JWT, so there is nothing server-side to
 * invalidate — the client discards it and the signature simply stops being
 * presented. What the server *is* responsible for is the presence record:
 * without this, a user who signs out stays "online" until their JWT expires
 * or their socket happens to drop.
 *
 * This mirrors the socket "disconnect" handler on purpose, and is safe to
 * run twice (the socket teardown may well write the same values a moment
 * later), because both are idempotent field updates rather than deltas.
 */
export const logout = async (
    userId: string,
): Promise<LogoutResponse> => {
    const user = await User.findByIdAndUpdate(userId, {
        is_online: 0,
        lastSeen: new Date(),
    });

    if (!user) {
        throw new Error("User not found.");
    }

    return {
        message: "Logout successful.",
    };
};
