const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/addUser', adminController.addUser);
router.get('/listUsers', adminController.getAllUsers);
router.delete('/deleteUser/:id',adminController.deleteUser);
module.exports = router;
