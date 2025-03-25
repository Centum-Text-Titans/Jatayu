const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const maxAge = process.env.REACT_APP_MAX_AGE;


// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { username: user.username, role: user.role },
        process.env.REACT_APP_SECRET_KEY,
        { expiresIn: '3d' } // Token expires in 3 days
    );
};



// Login Controller
const login = async (req, res) => {
    console.log('Login Request:', req.body);
    const { identifier, password } = req.body;

    try {
        // Check if the credentials match the admin credentials from the environment variables
        const isAdmin = (identifier === process.env.REACT_APP_ADMIN_ID) && (password === process.env.REACT_APP_ADMIN_KEY);

        if (isAdmin) {
            console.log("Admin login successful");

            // Use admin credentials from environment variables
            const adminUser = {
                username: process.env.REACT_APP_ADMIN_ID,
                role: process.env.REACT_APP_ADMIN_ROLE || "admin", // Default to "admin" if not set
            };

            // Generate a token for the admin user
            const token = generateToken(adminUser);

            res.cookie("jwt", token, {
                withCredentials: true,
                httpOnly: true,
                maxAge: maxAge,
            });

            return res.json({ status: 'success', token, created: true, user: adminUser.username, role: adminUser.role });
        }

        // Normal user authentication via MongoDB
        const user = await UserModel.findOne({ username: identifier });

        if (!user) {
            console.log("User not found");
            return res.status(401).json({ error: 'UserNotFound', message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Incorrect password");
            return res.status(401).json({ error: 'IncorrectPassword', message: 'Incorrect password' });
        }

        // Generate a JWT token for the user
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
    login,
    getProfile,
};
