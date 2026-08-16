import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
    PORT: z.string().default("5000"),
    MONGO_URI: z.string().min(1, "MONGO_URI is required"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().default("7d"),

    CLIENT_URL: z.string().url(),

    API_BASE_URL: z.string().url().default("http://localhost:5000/api"),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    UPLOAD_PRESET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid Environment Variables");
    console.error(parsed.error.format());

    process.exit(1);
}

export const env = parsed.data;