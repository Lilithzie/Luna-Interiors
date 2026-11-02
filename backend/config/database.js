const mongoose = require('mongoose');

let connectionPromise;

const connectDatabase = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.DB_URI, {
            serverSelectionTimeoutMS: 10000
        });
    }

    try {
        await connectionPromise;
        console.log(
            `MongoDB Connected: ${mongoose.connection.host}`
        );
    } catch (error) {
        connectionPromise = undefined;
        throw error;
    }
};

module.exports = connectDatabase;