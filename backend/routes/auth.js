const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { body } = require('express-validator');

router.post('/register', [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], register);

router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], login);

module.exports = router; 