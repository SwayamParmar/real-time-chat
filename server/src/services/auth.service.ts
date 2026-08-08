import User from "../models/user.model";
import { generateToken } from "../utils/jwt.util";

import type { SignupRequest } from "../types/signup-request.type";
import type { LoginRequest } from "../types/login-request.type";
import type { AuthResponse } from "../types/auth-response.type";

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