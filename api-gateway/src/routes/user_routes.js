const express = require('express');
const router = express.Router();
const { proxyToUserService } = require('../controllers/user.controller');

router.get('/users', proxyToUserService);

module.exports = router;
