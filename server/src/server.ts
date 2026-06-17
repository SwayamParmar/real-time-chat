import http from "http";

import app from "./app";

import { connectDB } from "./config/db";
import { env } from "./config/env";
import { initSocket } from "./socket/socket";

const startServer = async (): Promise<void> => {
    try {
        await connectDB();
        const server = http.createServer(app);
        initSocket(server);
        server.listen(env.PORT, () => {
            console.log(`🚀 Server running on port ${env.PORT}`);
        })
    } catch (error) {
        console.error("Failed to start server.");
        console.error(error);
        process.exit(1);
    }
};

startServer();