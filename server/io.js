const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from a `.env` file
const app = express();
const server = http.createServer(app); // Use HTTP server with Express
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL, // Allow connections from the client
        methods: ["GET", "POST"]
    }
});

module.exports = { io, server };