const mongoose = require('mongoose')

// Order lifecycle used by the admin "update status" feature (can only move forward)
const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered']

const orderSchema = mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'Card'],
        default: 'Card'
    },
    paymentInfo: {
        id: {
            type: String
        },
        status: {
            type: String
        }
    },
    paidAt: {
        type: Date
    },

    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Processing'
    },
    // every status the order went through, with the date/time (shown as a timeline)
    statusHistory: [
        {
            status: { type: String, required: true },
            at: { type: Date, default: Date.now },
            _id: false
        }
    ],
    deliveredAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

}, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

// Friendly transaction number shown to customer and admin, e.g. LUNA-5F2A91C3
orderSchema.virtual('transactionNo').get(function () {
    return this._id ? `LUNA-${this._id.toString().slice(-8).toUpperCase()}` : undefined
})

module.exports = mongoose.model('Order', orderSchema)
module.exports.ORDER_STATUSES = ORDER_STATUSES