const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');

// Helper function to generate a 7-character unique ID
const generateUniqueId = () => uuidv4().replace(/-/g, '').substring(0, 7);

// addUser Controller
const addUser = async (req, res) => {
    try {
        console.log('Add User Request:', req.body);

        // Check if the user already exists
        const existingUser = await UserModel.findOne({
            $or: [{ username: req.body.username }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const newUser = new UserModel({
            id: generateUniqueId(),
            username: req.body.username,
            role: req.body.role, // Ensure role is set correctly
            password: hashedPassword,
        });

        const result = await newUser.save();
        console.log('User saved:', result);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Retrieve all users
const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find({}, 'id username role');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await UserModel.findOneAndDelete({ id });

        if (!deletedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {
    addUser,
    getAllUsers,
    deleteUser,
};
