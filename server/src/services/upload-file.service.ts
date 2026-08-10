import { cloudinary } from "../config/cloudinary";

export interface UploadedFileResult {
    url: string;
    name: string;
    size: number;
    type: "image" | "video" | "raw";
}

export const uploadFile = async (file: Express.Multer.File): Promise<UploadedFileResult> => {
    const isVideo = file.mimetype.startsWith("video/");
    const isImage = file.mimetype.startsWith("image/");

    const resourceType: UploadedFileResult["type"] = isVideo ? "video" : isImage ? "image" : "raw";

    const result = await new Promise<{
        secure_url: string;
    }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "chatapp",
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error("Cloudinary upload failed"));
                    return;
                }

                resolve({
                    secure_url: result.secure_url,
                });
            }
        );

        stream.end(file.buffer);
    });

    return {
        url: result.secure_url,
        name: file.originalname,
        size: file.size,
        type: resourceType,
    };
};
