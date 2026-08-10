import express from "express";
import cors from "cors";

// Routes
import userRoutes from "./routes/user.routes";
import conversationRoutes from "./routes/conversation.routes";
import messageRoutes from "./routes/message.routes";
import uploadRoutes from "./routes/upload-file.routes";

// // Middleware
// import errorHandler from "./middleware/errorHandler";

const app = express();

/**
 * Global Middlewares
 */
app.use(express.json());
app.use(cors());

/**
 * API Routes
 */
app.use("/api/user", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

/**
 * Global Error Handler
 * (Must always be the last middleware)
 */
// app.use(errorHandler);

export default app;