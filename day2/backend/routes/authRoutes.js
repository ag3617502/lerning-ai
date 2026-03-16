const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();

/**
 * Routes for user authentication.
 * These endpoints are public (no token required).
 */

// POST /api/auth/register -> Create a new user account
router.post('/register', registerUser);

// POST /api/auth/login -> Sign in to an existing account
router.post('/login', loginUser);

module.exports = router;
