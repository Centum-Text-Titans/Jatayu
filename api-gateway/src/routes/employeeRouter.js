const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/profile', employeeController.getProfile);

module.exports = router;
