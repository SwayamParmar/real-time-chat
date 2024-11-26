const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    photo: { type: String, default: '' }, // Profile picture URL
    about: { type: String, default: '' }, // User bio
    is_online: { type: Number, default: 0 }, // 0 = offline, 1 = online
    lastSeen: { type: Date, default: Date.now }, // Last activity timestamp
    isVerified: { type: Number, default: 0 }, // 0 = not verified, 1 = verified
    token: { type: String, default: '' }, // JWT token (optional)
}, { timestamps: true });

// Hash password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to validate password
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
