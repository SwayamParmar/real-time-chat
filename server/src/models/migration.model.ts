import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface Migration extends Document {
    name: string;
    appliedAt: Date;
}

const migrationSchema = new Schema<Migration>({
    name: { type: String, required: true, unique: true },
    appliedAt: { type: Date, default: Date.now },
});

const Migration: Model<Migration> = mongoose.model<Migration>("Migration", migrationSchema);

export default Migration;
