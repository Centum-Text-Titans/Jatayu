const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const userRoutes = require('./userRouter');
const employeeRoutes = require('./employeeRouter');
const adminRoutes = require('./adminRouter');

const formData = require('express-form-data');
const formMiddleware = formData.parse();
router.use(formMiddleware);

// setting up routes
router.use('/user', userRoutes);
router.use('/employee', employeeRoutes);
router.use('/admin', adminRoutes);

// middle wares 
router.post('/login', authMiddleware.login);
router.get('/profile', authMiddleware.getProfile);

module.exports = router;
