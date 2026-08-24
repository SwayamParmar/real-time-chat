import type { NextFunction, Request, Response, } from "express";
import * as authService from "../services/auth.service";
import * as userService from "../services/user.service";

export const signup = async ( req: Request, res: Response, next: NextFunction, ): Promise<void> => {
    try {
        const result = await authService.signup({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const login = async ( req: Request, res: Response, next: NextFunction, ): Promise<void> => {
    try {
        const result = await authService.login({
            email: req.body.email,
            password: req.body.password,
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const logout = async ( req: Request, res: Response, next: NextFunction, ): Promise<void> => {
    try {
        const result = await authService.logout(req.user!.userId);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getUsers = async ( req: Request, res: Response, next: NextFunction, ): Promise<void> => {
    try {
        const users = await userService.getUsers(req.user!.userId);
        res.status(200).json({ users });
    } catch (error) {
        next(error);
    }
};