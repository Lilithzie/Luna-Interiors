const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(process.env.DB_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log(
            `MongoDB Connected: ${mongoose.connection.host}`
        );

    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        throw error;
    }
};

module.exports = connectDatabase;