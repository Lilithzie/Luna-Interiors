const mongoose = require('mongoose')

// Luna Interiors furniture categories (shared with the frontend filter + forms)
const CATEGORIES = [
    'Living Room',
    'Bedroom',
    'Dining Room',
    'Outdoor',
    'Storage',
    'Kitchen',
    'Entryway',
    'Kids & Nursery'
]

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        min: [0, 'Price cannot be negative'],
        default: 0.0
    },
    // optional regular price, shown struck through when it is higher than `price`.
    // Display only: orders are always charged `price`.
    compareAtPrice: {
        type: Number,
        min: [0, 'Compare-at price cannot be negative'],
        default: null
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: CATEGORIES,
            message: 'Please select correct category for product'
        }
    },
    seller: {
        type: String,
        default: 'Luna Interiors'
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
