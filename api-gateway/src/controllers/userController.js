const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const maxAge = 3 * 24 * 60 * 60 * 1000;

const { v4: uuidv4 } = require('uuid');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { username: user.username, role: user.role },
        process.env.REACT_APP_SECRET_KEY,
        { expiresIn: '3d' } // Token expires in 3 days
    );
};

// Signup Controller
const signup = async (req, res) => {
    try {
        console.log('Signup Request:', req.body);
        console.log('Signup Request:', process.env.REACT_APP_SECRET_KEY);

        // Check if the user already exists
        const existingUser = await UserModel.findOne({ 
            $or: [{ username: req.body.uname }, { email: req.body.mail }] 
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const newUser = new UserModel({
            username: req.body.uname,
            email: req.body.mail,
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

// Login Controller
const login = async (req, res) => {
    console.log('Login Request:', req.body);
    const { identifier, password } = req.body;

    try {
        const user = await UserModel.findOne({
            $or: [{ username: identifier }, { email: identifier }],
        });

        if (!user) {
            console.log("User not found");
            return res.status(401).json({ error: 'UserNotFound', message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Incorrect password");
            return res.status(401).json({ error: 'IncorrectPassword', message: 'Incorrect password' });
        }

        // Generate JWT token   
        const token = generateToken(user);

        res.cookie("jwt", token, {
            withCredentials: true,
            httpOnly: true,
            maxAge: maxAge,
        });

        res.json({ status: 'success', token, created: true, user: user.username, role: user.role });
    } catch (error) {
        console.error('Login error:', error);
        res.sendStatus(500);
    }
};

// Get Profile Controller
const getProfile = (req, res) => {
    const token = req.cookies.jwt;
    
    if (!token) {
        return res.status(401).json({ message: 'No token found' });
    }

    try {
        const decoded = jwt.verify(token, process.env.REACT_APP_SECRET_KEY);
        res.json({ username: decoded.username, role: decoded.role });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};






module.exports = {
    signup,
    login,
    getProfile,
};
