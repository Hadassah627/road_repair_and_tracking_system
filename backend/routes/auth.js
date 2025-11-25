const express = require('express');
const router = express.Router();
const { register, login, getMe, getSupportPersons } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/support-persons', protect, authorize('supervisor', 'administrator'), getSupportPersons);

module.exports = router;
