import { Router } from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.middleware";
import { uploadFile } from "../controllers/upload-file.controller";

const router = Router();
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "video/mp4",
            "video/quicktime",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
            return;
        }
        callback(new Error("File type not allowed"));
    },
});

router.post("/", authMiddleware, upload.single("file"), uploadFile);

export default router;
