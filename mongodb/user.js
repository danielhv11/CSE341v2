const { getDB } = require('./database'); // Adjust path as needed
const bcrypt = require('bcrypt');

// Create a new user and hash the password
async function createUser(username, password) {
    const db = getDB();
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ username });
    if (existingUser) {
        throw new Error('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const result = await users.insertOne({ username, password: hashedPassword });
    return result.insertedId;
}

// Find a user by username
async function findUserByUsername(username) {
    const db = getDB();
    const users = db.collection('users');
    return await users.findOne({ username });
}

// Compare a given password with the stored hashed password
async function comparePassword(user, inputPassword) {
    return await bcrypt.compare(inputPassword, user.password);
}

module.exports = {
    createUser,
    findUserByUsername,
    comparePassword,
};
