const mongoose = require('mongoose');
const Conversation = require('./models/Conversation'); // Update the path if needed

const insertSampleConversation = async () => {
    try {
        // Connect to your MongoDB database
        await mongoose.connect('mongodb://127.0.0.1:27017/chatapp', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Insert sample conversation
        const newConversation = new Conversation({
            sender: '6736418a35274694f529e860', // Sender ID
            receiver: '672a6b14bbad503f7e974986', // Receiver ID
            content: 'Hello! This is a test message.', // Message content
            message_type: 'text', // Message type
            status: 0, // Unread
            created_at: new Date(),
        });

        await newConversation.save();
        console.log('Sample conversation inserted:', newConversation);

        // Close the database connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error inserting sample conversation:', error);
    }
};

// Run the script
insertSampleConversation();
