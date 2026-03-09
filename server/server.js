const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const userRoutes = require('./routes/user');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/message');
const Conversation = require("./models/Conversation");
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./socket/socket');

dotenv.config(); // Load environment variables

const app = express();
const server = http.createServer(app); // Use HTTP server with Express
initSocket(server);

app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS

// Routes
app.use('/api/user', userRoutes); // User-related routes (signup, login)
app.use('/api/conversations', conversationRoutes); // Conversations route (protected)
app.use('/api/messages', messageRoutes); // message route (protected)
app.use(errorHandler); 

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));