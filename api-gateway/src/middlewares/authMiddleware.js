const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');




// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { username: user.username, role: user.role,userid:user.id },
        process.env.REACT_APP_SECRET_KEY,
        { expiresIn: '3d' } // Token expires in 3 days
    );
};



// Login Controller
const login = async (req, res) => {
    console.log('Login Request:', req.body);
    const { identifier, password } = req.body;

    try {
 
        // Normal user authentication via MongoDB
        // console.log(process.env);    
        const user = await UserModel.findOne({ username: identifier });

        if (!user) {
            console.log("User not found");
            return res.status(401).json({ error: 'UserNotFound', message: 'User not found' });
        }
        console.log(user);

        // Compare the provided password with the stored hashed password

        console.log("Stored Hash:", user.password);
        console.log("Entered Password:", password);
        console.log("Password Match:", await bcrypt.compare(password, user.password));

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Matching",isMatch);



        if (!isMatch) {
            console.log("Incorrect password");
            return res.status(401).json({ error: 'IncorrectPassword', message: 'Incorrect password' });
        }

        // Generate a JWT token for the user
        const token = generateToken(user);
       

        res.cookie("jwt", token, {
            withCredentials: true,
            httpOnly: false,
            maxAge: process.env.REACT_APP_MAX_AGE,
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
    console.log("im cooked");
    console.log(token);
    
    if (!token) {
        return res.status(401).json({ message: 'No token found' });
    }

    try {
        const decoded = jwt.verify(token, process.env.REACT_APP_SECRET_KEY);
        res.json({ username: decoded.username, role: decoded.role ,userid : decoded.userid});
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};


module.exports = {
    login,
    getProfile,
};
