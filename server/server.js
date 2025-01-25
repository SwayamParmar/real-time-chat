const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/user');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/message');
const Conversation = require("./models/Conversation");

dotenv.config(); // Load environment variables

const app = express();
const server = http.createServer(app); // Use HTTP server with Express
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL, // Allow connections from the client
        methods: ["GET", "POST"]
    }
});

app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS

// Routes
app.use('/api/user', userRoutes); // User-related routes (signup, login)
app.use('/api/conversations', conversationRoutes); // Conversations route (protected)
app.use('/api/messages', messageRoutes); // message route (protected)

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Real-time socket handling
io.on('connection', (socket) => {
    // console.log('New client connected:', socket.id);

    // Join a room for the logged-in user
    const { userId } = socket.handshake.query;
    if (userId) {
        socket.join(userId); // Join a room with the user's ID
        // console.log(`User ${userId} joined room ${userId}`);
    }

    // Listen for messages from the client
    socket.on('sendMessage', async (data) => {
        // console.log('Message received:', data);

        // Send the message only to the recipient's room
        const { conversationId, receiver, content } = data; // receiverId in the messageData
        const isRoomExist = io.sockets.adapter.rooms.get(receiver)?.size > 0; // Check if the receiver room exists
        if (isRoomExist) {
            io.to(receiver).emit('receiveMessage', data);
            // console.log(`Message sent to user ${receiver}`);
        } else {
            console.log(`Room for receiver ${receiver} does not exist.`);
        }

        // Update conversation
        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { content, updated_at: new Date() },
            { new: true }
        ).populate('sender', 'name') // Include sender's name
        .populate('receiver', 'name'); // Include receiver's name

        io.emit('conversationUpdated', updatedConversation); // Emit event for conversation list update

    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));