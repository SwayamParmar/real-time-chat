import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(env.MONGO_URI);

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        console.error(error);

        process.exit(1);
    }
};