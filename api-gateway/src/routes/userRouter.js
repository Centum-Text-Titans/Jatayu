const express = require('express');
const router = express.Router();
const { proxyToUserService } = require('../controllers/userController');

router.get('/users', proxyToUserService);

module.exports = router;
