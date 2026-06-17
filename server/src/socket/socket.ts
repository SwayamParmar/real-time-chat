import { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { env } from "../config/env";

let io: Server;

export const initSocket = (server: HttpServer): Server => {
    io = new Server(server, {
        cors: {
            origin: env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    console.log("✅ Socket.IO initialized");

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized.");
    }

    return io;
};