const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);


const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' })

const app = require('./app');
const connectDatabase = require('./config/database')
const cloudinary = require('cloudinary');

connectDatabase();
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Luna Interiors server started on port: ${PORT} in ${process.env.NODE_ENV} mode`);
});
