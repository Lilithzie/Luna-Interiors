const Order = require('../models/order');
const Product = require('../models/product');



// Create a new order   =>  /api/v1/order/new
const SHIPPING_FREE_OVER = 5000;
const SHIPPING_FEE = 250;
const TAX_RATE = 0.05;
const PAYMENT_METHODS = ['Cash on Delivery', 'Card'];

// POST /order/new   (customers only - admins manage the shop, they do not buy)
exports.newOrder = async (req, res) => {
    const { orderItems, shippingInfo, paymentMethod, paymentInfo } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Your cart is empty' })
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
        return res.status(400).json({ success: false, message: 'Please choose a payment method (Cash on Delivery or Card)' })
    }

    // Never trust prices from the browser: rebuild the items from the database
    const items = [];
    for (const line of orderItems) {
        const qty = Number(line.quantity);
        const product = await Product.findById(line.product);
        if (!product) {
            return res.status(404).json({ success: false, message: `A product in your cart no longer exists` })
        }
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}` })
        }
        if (product.stock < qty) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} left in stock for ${product.name}` })
        }
        items.push({
            name: product.name,
            quantity: qty,
            image: product.images && product.images.length ? product.images[0].url : '/images/no-image.svg',
            price: product.price,
            product: product._id,
            _doc: product
        });
    }

    const itemsPrice = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const shippingPrice = itemsPrice > SHIPPING_FREE_OVER ? 0 : SHIPPING_FEE;
    const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const isCard = paymentMethod === 'Card';
    const order = await Order.create({
        orderItems: items.map(({ _doc, ...rest }) => rest),
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentMethod,
        // Card is simulated (no real gateway): only the last 4 digits are ever kept
        paymentInfo: isCard
            ? { id: `card_${Date.now()}_${(paymentInfo && paymentInfo.last4) || '0000'}`, status: 'succeeded' }
            : { id: `cod_${Date.now()}`, status: 'Pending (Cash on Delivery)' },
        paidAt: isCard ? Date.now() : undefined,
        user: req.user._id
    })

    // reserve the stock as soon as the order is placed
    for (const i of items) {
        i._doc.stock -= i.quantity;
        await i._doc.save({ validateBeforeSave: false });
    }

    res.status(201).json({ success: true, order })
}

exports.myOrders = async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id })
    // console.log(req.user)
    res.status(200).json({
        success: true,
        orders
    })
}

exports.getSingleOrder = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
        return res.status(404).json({ success: false, message: 'No Order found with this ID' })
    }
    // a customer can only open their own order, admins can open any
    const ownerId = order.user && order.user._id ? order.user._id.toString() : String(order.user);
    if (req.user.role !== 'admin' && ownerId !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not allowed to view this order' })
    }
    res.status(200).json({ success: true, order })
}

exports.allOrders = async (req, res, next) => {
    const orders = await Order.find()
    // console.log(orders)
    let totalAmount = 0;

    orders.forEach(order => {

        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
}

exports.deleteOrder = async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id)

    if (!order) {
        return res.status(400).json({
            message: 'No Order found with this ID',

        })

    }
    return res.status(200).json({
        success: true
    })
}

const STATUSES = ['Processing', 'Shipped', 'Delivered'];

// PUT /admin/order/:id   body: { status }
exports.updateOrder = async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
        return res.status(404).json({ success: false, message: 'No Order found with this ID' })
    }
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' })
    }
    if (order.orderStatus === 'Delivered') {
        return res.status(400).json({ success: false, message: 'You have already delivered this order' })
    }

    order.orderStatus = status
    if (status === 'Delivered') {
        order.deliveredAt = Date.now()
        // Cash on Delivery is paid when the customer receives the order
        if (order.paymentMethod === 'Cash on Delivery') {
            order.paymentInfo = { id: order.paymentInfo && order.paymentInfo.id, status: 'succeeded' }
            order.paidAt = Date.now()
        }
    }
    await order.save()
    res.status(200).json({ success: true, order })
}

exports.totalOrders = async (req, res, next) => {
    const totalOrders = await Order.aggregate([
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ])
    if (!totalOrders) {
        return res.status(404).json({
            message: 'error total orders',
        })
    }
    res.status(200).json({
        success: true,
        totalOrders
    })

}

exports.totalSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: "$totalPrice" }
            }
        }
    ])
    if (!totalSales) {
        return res.status(404).json({
            message: 'error total sales',
        })
    }
    res.status(200).json({
        success: true,
        totalSales
    })
}

exports.customerSales = async (req, res, next) => {
    const customerSales = await Order.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            },
        },
        // {
        //     $group: {
        //         _id: "$user",
        //         total: { $sum: "$totalPrice" },
        //     }
        // },

        { $unwind: "$userDetails" },
        {
            $group: {
                _id: "$user",
                total: { $sum: "$totalPrice" },
                doc: { "$first": "$$ROOT" },

            }
        },

        {
            $replaceRoot: {
                newRoot: { $mergeObjects: [{ total: '$total' }, '$doc'] },
            },
        },
        // {
        //     $group: {
        //         _id: "$userDetails.name",
        //         total: { $sum: "$totalPrice" }
        //     }
        // },
        {
            $project: {
                _id: 0,
                "userDetails.name": true,
                total: true,
            }
        },
        { $sort: { total: 1 } },

    ])
    console.log(customerSales)
    if (!customerSales) {
        return res.status(404).json({
            message: 'error customer sales',
        })


    }
    // return console.log(customerSales)
    res.status(200).json({
        success: true,
        customerSales
    })

}

exports.salesPerMonth = async (req, res, next) => {
    // select monthname(paidAt) sum(price * quantity)
    // from orders
    // group by month(date_placed), year(date_placed)
    const salesPerMonth = await Order.aggregate([

        {
            $group: {
                // _id: {month: { $month: "$paidAt" } },
                _id: {
                    year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } },
                    month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } }
                },
                total: { $sum: "$totalPrice" },
            },
        },

        {
            $addFields: {
                month: {
                    $let: {
                        vars: {
                            monthsInString: [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', "$_id.month"]
                        }
                    }
                }
            }
        },
        { $sort: { "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                month: true,
                total: true,
            }
        }

    ])
    if (!salesPerMonth) {
        return res.status(404).json({
            message: 'error sales per month',
        })
    }
    // return console.log(customerSales)
    res.status(200).json({
        success: true,
        salesPerMonth
    })

}

// GET /admin/sales-chart?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Returns daily order sales for the dashboard date-range chart.
exports.salesChart = async (req, res) => {
    const start = req.query.startDate ? new Date(`${req.query.startDate}T00:00:00.000Z`) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = req.query.endDate ? new Date(`${req.query.endDate}T23:59:59.999Z`) : new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
        return res.status(400).json({ success: false, message: 'Please provide a valid date range' });
    }

    const sales = await Order.aggregate([
        { $match: { $or: [{ paidAt: { $gte: start, $lte: end } }, { paidAt: null, createdAt: { $gte: start, $lte: end } }] } },
        { $project: { saleDate: { $ifNull: ['$paidAt', '$createdAt'] }, totalPrice: 1 } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } }, total: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', total: 1, orders: 1 } },
    ]);

    return res.status(200).json({ success: true, startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), sales });
};