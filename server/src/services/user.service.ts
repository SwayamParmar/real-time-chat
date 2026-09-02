import { HttpError } from "../utils/http-error.util";
import type { UserSettings, UpdateUserSettingsRequest } from "../types/user-settings.type";
import { Types } from "mongoose";
import User from "../models/user.model";

export const getUsers = async (currentUserId: string,) => {
    return User.find(
        {
            _id: {
                $ne: new Types.ObjectId(currentUserId),
            },
        },
        "name email is_online lastSeen",
    );
};
export const getSettings = async (userId: string): Promise<UserSettings> => {
    const user = await User.findById(userId, "notifications_enabled");
    if (!user) {
        throw new HttpError(404, "User not found.");
    }
    return { notifications_enabled: user.notifications_enabled };
};

export const updateSettings = async (
    userId: string,
    data: UpdateUserSettingsRequest,
): Promise<UserSettings> => {
    const update: Partial<UserSettings> = {};

    if (typeof data.notifications_enabled === "boolean") {
        update.notifications_enabled = data.notifications_enabled;
    }
    const user = await User.findByIdAndUpdate(userId, update, {
        new: true,
        select: "notifications_enabled",
    });
    if (!user) {
        throw new HttpError(404, "User not found.");
    }
    return { notifications_enabled: user.notifications_enabled };
};