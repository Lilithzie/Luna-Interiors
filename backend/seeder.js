// Usage:  npm run seed            -> adds demo users + products (skips what already exists)
//         npm run seed -- --reset -> also wipes the products collection first

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });
const mongoose = require('mongoose');
const Product = require('./models/product');
const User = require('./models/user');

const avatar = { public_id: 'avatars/default', url: '/images/default_avatar.svg' };

const products = [
    { name: 'Solene Lounge Chair', price: 18900, category: 'Living Room', stock: 12, description: 'A sculpted lounge chair with a solid oak frame and boucle upholstery. Deep seat, gentle recline, made for slow evenings.' },
    { name: 'Arco Three-Seater Sofa', price: 54900, category: 'Living Room', stock: 5, description: 'Low-profile three-seater sofa with removable linen covers and high-resilience foam cushions.' },
    { name: 'Mira Bedside Table', price: 7500, category: 'Bedroom', stock: 20, description: 'Compact bedside table with a soft-close drawer and an open shelf for books. Finished in warm walnut veneer.' },
    { name: 'Luna Queen Bed Frame', price: 38500, category: 'Bedroom', stock: 6, description: 'Upholstered queen bed frame with a curved headboard in dusty rose fabric and solid wood slats.' },
    { name: 'Arco Dining Set (6 seats)', price: 32500, category: 'Dining Room', stock: 4, description: 'Six-seater dining table with rounded corners and six matching chairs. Seats the whole family comfortably.' },
    { name: 'Terra Dining Chair', price: 4200, category: 'Dining Room', stock: 40, description: 'Stackable dining chair with a curved backrest and powder-coated steel legs.' },
    { name: 'Palma Rattan Patio Set', price: 27800, category: 'Outdoor', stock: 7, description: 'Weather-resistant rattan patio set: two armchairs, a loveseat, and a glass-top coffee table.' },
    { name: 'Haven Garden Bench', price: 9800, category: 'Outdoor', stock: 15, description: 'Teak garden bench with a slatted back, treated for outdoor use.' },
    { name: 'Nook Open Bookcase', price: 12900, category: 'Storage', stock: 14, description: 'Five-tier open bookcase with an adjustable shelf and a hidden cable channel.' },
    { name: 'Tidy Wardrobe 3-Door', price: 24500, category: 'Storage', stock: 9, description: 'Three-door wardrobe with a mirrored centre panel, hanging rail and four internal drawers.' },
    { name: 'Hearth Kitchen Island', price: 21900, category: 'Kitchen', stock: 6, description: 'Butcher-block top kitchen island on locking casters with towel rail and two drawers.' },
    { name: 'Brew Bar Cart', price: 6500, category: 'Kitchen', stock: 18, description: 'Two-tier serving cart with a wine rack and glass holder. Rolls easily between kitchen and dining room.' },
    { name: 'Welcome Console Table', price: 8900, category: 'Entryway', stock: 11, description: 'Slim console table with a shoe shelf, perfect behind a door or sofa.' },
    { name: 'Hook & Hold Coat Rack', price: 3200, category: 'Entryway', stock: 30, description: 'Wall-mounted coat rack with six brass hooks and a floating shelf.' },
    { name: 'Cloud Kids Bunk Bed', price: 29900, category: 'Kids & Nursery', stock: 5, description: 'Safe, sturdy bunk bed with rounded rails, a built-in ladder and underbed storage drawers.' },
    { name: 'Little Moon Nursery Crib', price: 15800, category: 'Kids & Nursery', stock: 8, description: 'Convertible crib that adapts to a toddler bed, with three mattress heights and non-toxic finish.' },
];

(async () => {
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to', mongoose.connection.host);

    if (process.argv.includes('--reset')) {
        await Product.deleteMany({});
        console.log('Products collection cleared');
    }

    const people = [
        { name: 'Luna Admin', email: 'admin@lunainteriors.com', password: 'admin123', role: 'admin' },
        { name: 'Demo Customer', email: 'customer@lunainteriors.com', password: 'customer123', role: 'user' },
    ];
    for (const p of people) {
        if (!(await User.findOne({ email: p.email }))) {
            await User.create({ ...p, avatar });
            console.log(`Created ${p.role}: ${p.email} / ${p.password}`);
        }
    }

    for (const p of products) {
        if (!(await Product.findOne({ name: p.name }))) await Product.create({ ...p, images: [] });
    }
    console.log(`Products in database: ${await Product.countDocuments()}`);
    await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
