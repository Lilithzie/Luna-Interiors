const express = require('express');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

dotenv.config();
connectDatabase();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});