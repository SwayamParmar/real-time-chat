import { v2 as cloudinary } from "cloudinary";

import { env } from "./env";

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Extract public_id from a Cloudinary URL.
 *
 * Example:
 * https://res.cloudinary.com/cloud/image/upload/v123/chatapp/filename.jpg
 *
 * Result:
 * chatapp/filename
 */
const getPublicId = (url: string): string => {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) {
        throw new Error("Invalid Cloudinary URL");
    }

    // Everything after "upload"
    const withVersion = parts.slice(uploadIndex + 1).join("/");
    // Remove version segment such as v1234567/
    const withoutVersion = withVersion.replace(/^v\d+\//, "");
    // Remove file extension
    return withoutVersion.replace(/\.[^/.]+$/, "");
};

export const deleteFromCloudinary = async (
    url: string,
    resourceType: "image" | "video" | "raw" = "image"
) => {
    try {
        const publicId = getPublicId(url);

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        console.log(`🗑️ Cloudinary delete: ${publicId} →`, result.result);
        return result;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw error;
    }
};

export { cloudinary };