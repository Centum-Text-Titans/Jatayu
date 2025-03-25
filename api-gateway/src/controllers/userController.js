const jwt = require('jsonwebtoken');

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
    getProfile,
};
