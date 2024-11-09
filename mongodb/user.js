const { getDB } = require('./database'); 
const bcrypt = require('bcrypt');

// Create a new user and hash the password
async function createUser(username, password) {
    const db = getDB();
    const users = db.collection('users');

   
    const existingUser = await users.findOne({ username });
    if (existingUser) {
        throw new Error('Username already exists');
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const result = await users.insertOne({ username, password: hashedPassword });
    return result.insertedId;
}

// Find a user by username
async function findUserByUsername(username) {
    const db = getDB();
    const users = db.collection('users');
    return await users.findOne({ username });
}


async function comparePassword(user, inputPassword) {
    return await bcrypt.compare(inputPassword, user.password);
}

module.exports = {
    createUser,
    findUserByUsername,
    comparePassword,
};
