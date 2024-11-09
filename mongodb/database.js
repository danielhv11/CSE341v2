const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
let db;

const client = new MongoClient(uri); // Removed deprecated options

async function connectDB() {
    try {
        await client.connect();
        db = client.db('CSE341pt2'); 
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        throw err; // Rethrow the error for further handling if needed
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Please call connectDB first.');
    }
    return db;
}

module.exports = { connectDB, getDB };