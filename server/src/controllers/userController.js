// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

exports.getUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const users = await User.find({ _id: { $ne: currentUserId } }, 'name email is_online lastSeen');
        res.status(200).json({ users });
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
};

exports.signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already registered' });

        const newUser = new User({
            name: fullName,
            email,
            password, // hashed in model if middleware is used
            isVerified: 1,
        });

        await newUser.save();

        const token = generateToken(newUser._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email },
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(400).json({ message: 'Invalid Password' });

        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.log('login error found ' , error)
        res.status(500).json({ message: 'Something went wrong' });
    }
};
