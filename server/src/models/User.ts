import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    photo: string;
    about: string;
    is_online: number;
    lastSeen: Date;
    isVerified: number;
    createdAt: Date;
    updatedAt: Date;
    isValidPassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, unique: true, required: true, lowercase: true },
        password: { type: String, required: true },
        photo: { type: String, default: "" },
        about: { type: String, default: "" },
        is_online: { type: Number, default: 0 },
        lastSeen: { type: Date, default: Date.now },
        isVerified: { type: Number, default: 0 },
    },
    { timestamps: true },
);

// Hash password before saving the user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to validate password
userSchema.methods.isValidPassword = async function (
    this: IUser,
    password: string,
): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
