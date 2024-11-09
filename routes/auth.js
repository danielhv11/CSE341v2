const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { createUser, findUserByUsername, comparePassword } = require('../mongodb/user'); // Adjust path as needed
const JWT_SECRET = 'your_jwt_secret'; // Use an environment variable in production

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const userId = await createUser(username, password);
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);
        if (!user || !(await comparePassword(user, password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Failed to log in user', error: error.message });
    }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'User logged out successfully' });
});

module.exports = router;
