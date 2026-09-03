import User from "../models/user.model";
import { generateToken } from "../utils/jwt.util";
import { HttpError } from "../utils/http-error.util";
import { isUserOnline } from "../socket/socket";

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
        throw new HttpError(409, "An account with this email already exists.");
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
        throw new HttpError(404, "No account found with this email. Please sign up first.");
    }

    const isPasswordValid = await user.isValidPassword(password);

    if (!isPasswordValid) {
        throw new HttpError(401, "Incorrect password. Please try again.");
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

// Clear the presence record unless another tab still holds a live socket.
export const logout = async (
    userId: string,
): Promise<LogoutResponse> => {
    const update = isUserOnline(userId) ? {} : { is_online: 0, lastSeen: new Date() };

    const user = await User.findByIdAndUpdate(userId, update);

    if (!user) {
        throw new HttpError(404, "User not found.");
    }

    return {
        message: "Logout successful.",
    };
};
