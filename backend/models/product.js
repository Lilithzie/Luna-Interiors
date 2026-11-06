const mongoose = require('mongoose')
const { maskBadWords } = require('../utils/profanity')

// furniture categories
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
    // optional compare-at price (display only)
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

// mask bad words on output
productSchema.set('toJSON', {
    transform: (doc, ret) => {
        if (Array.isArray(ret.reviews)) {
            ret.reviews = ret.reviews.map(r => ({ ...r, comment: maskBadWords(r.comment).text }));
        }
        return ret;
    }
});

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
