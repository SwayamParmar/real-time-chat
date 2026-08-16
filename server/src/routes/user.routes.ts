import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middleware/auth.middleware";
import validateRequest from "../middleware/validate-request.middleware";
import * as userController from "../controllers/user.controller";

const router = Router();

/**
 * Get all users
 */
router.get("/", authMiddleware, userController.getUsers);

/**
 * User Registration
 */
router.post("/signup", [
        body("name")
            .notEmpty()
            .withMessage("Full Name is required"),

        body("email")
            .isEmail()
            .withMessage("Valid email is required"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ],
    validateRequest,
    userController.signup,
);

/**
 * User Login
 */
router.post("/login", [
        body("email")
            .isEmail()
            .withMessage("Valid email is required"),

        body("password")
            .notEmpty()
            .withMessage("Password is required"),
    ],
    validateRequest,
    userController.login,
);

export default router;