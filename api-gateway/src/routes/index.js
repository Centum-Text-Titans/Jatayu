const express = require('express');
const router = express.Router();

const userRoutes = require('./user_routes');

router.use('/users', userRoutes);

module.exports = router;
