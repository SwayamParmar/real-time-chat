import { Types } from "mongoose";
import User from "../models/user.model";

export const getUsers = async ( currentUserId: string, ) => {
    return User.find(
        {
            _id: {
                $ne: new Types.ObjectId(currentUserId),
            },
        },
        "name email is_online lastSeen",
    );
};