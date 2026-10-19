const Product = require('../models/product')
const Order = require('../models/order')
const APIFeatures = require('../utils/apiFeatures');
const { uploadImages, destroyImages } = require('../utils/imageUpload');

const RES_PER_PAGE = 8;

// Recompute the cached rating summary from the embedded reviews.
const recalcRatings = (product) => {
    product.numOfReviews = product.reviews.length;
    product.ratings = product.reviews.length
        ? Number((product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(2))
        : 0;
}

const pickFields = (body) => {
    const fields = {};
    ['name', 'price', 'description', 'category', 'seller', 'stock'].forEach(k => {
        if (body[k] !== undefined) fields[k] = body[k];
    });
    return fields;
}

/* ------------------------------------------------------------------ */
/* MP1 - Product CRUD                                                  */
/* ------------------------------------------------------------------ */

// POST /admin/product/new   (multipart/form-data, field "images" x many)
exports.newProduct = async (req, res) => {
    const images = await uploadImages(req.files, req);
    if (!images.length) {
        return res.status(400).json({ success: false, message: 'Please upload at least one product photo' })
    }
    const product = await Product.create({ ...pickFields(req.body), images, user: req.user._id });
    return res.status(201).json({ success: true, product })
}

exports.getSingleProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
    }
    return res.status(200).json({ success: true, product })
}

// PUT /admin/product/:id   (multipart: new "images" files + "keepImages" JSON array of public_ids)
exports.updateProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
    }

    let keep = product.images.map(i => i.public_id);
    if (req.body.keepImages !== undefined) {
        try { keep = JSON.parse(req.body.keepImages); } catch (e) { keep = []; }
    }
    const kept = product.images.filter(i => keep.includes(i.public_id));
    const removed = product.images.filter(i => !keep.includes(i.public_id));
    const added = await uploadImages(req.files, req);

    if (kept.length + added.length === 0) {
        await destroyImages(added);
        return res.status(400).json({ success: false, message: 'A product needs at least one photo' })
    }

    product.set({ ...pickFields(req.body), images: [...kept, ...added] });
    await product.save();
    await destroyImages(removed);

    return res.status(200).json({ success: true, product })
}

exports.deleteProduct = async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
    }
    await destroyImages(product.images);
    return res.status(200).json({ success: true, message: 'Product deleted' })
}

// DELETE /admin/products   body: { ids: [..] }   (bulk delete from datatable checkboxes)
exports.bulkDeleteProducts = async (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) {
        return res.status(400).json({ success: false, message: 'No products selected' })
    }
    const products = await Product.find({ _id: { $in: ids } });
    await Product.deleteMany({ _id: { $in: products.map(p => p._id) } });
    for (const p of products) await destroyImages(p.images);
    return res.status(200).json({ success: true, deletedCount: products.length })
}

exports.getAdminProducts = async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products })
}

/* ------------------------------------------------------------------ */
/* MP2 - Shop listing with filters                                     */
/* ------------------------------------------------------------------ */

exports.getProducts = async (req, res) => {
    const productsCount = await Product.countDocuments();

    const features = new APIFeatures(Product.find(), req.query).search().filter();
    // count AFTER filters so pagination matches what the shopper sees
    const filteredProductsCount = await Product.countDocuments(features.conditions);

    features.sort().pagination(RES_PER_PAGE);
    const products = await features.query;

    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        resPerPage: RES_PER_PAGE,
        productsCount,
        categories: Product.CATEGORIES,
    })
}

/* ------------------------------------------------------------------ */
/* MP3 - Reviews & ratings                                             */
/* ------------------------------------------------------------------ */

// A user has "availed" a product when it appears in one of their orders.
const hasAvailed = (userId, productId) =>
    Order.exists({ user: userId, 'orderItems.product': productId });

// GET /review/eligibility?productId=...
exports.reviewEligibility = async (req, res) => {
    const product = await Product.findById(req.query.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    const availed = !!(await hasAvailed(req.user._id, product._id));
    const mine = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    return res.status(200).json({ success: true, canReview: availed, review: mine || null })
}

// PUT /review   -> create the user's review, or update it if it already exists
exports.createProductReview = async (req, res) => {
    const { rating, comment, productId } = req.body;
    const value = Number(rating);

    if (!Number.isFinite(value) || value < 1 || value > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be from 1 to 5' })
    }
    if (!comment || !String(comment).trim()) {
        return res.status(400).json({ success: false, message: 'Please write a comment' })
    }

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
    }
    if (!(await hasAvailed(req.user._id, product._id))) {
        return res.status(403).json({ success: false, message: 'Only customers who ordered this product can review it' })
    }

    const existing = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (existing) {
        existing.rating = value;
        existing.comment = String(comment).trim();
        existing.name = req.user.name;
        existing.updatedAt = Date.now();
    } else {
        product.reviews.push({
            user: req.user._id,
            name: req.user.name,
            rating: value,
            comment: String(comment).trim(),
        });
    }
    recalcRatings(product);
    await product.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, updated: !!existing })
}

// GET /reviews?id=<productId>
exports.getProductReviews = async (req, res) => {
    const product = await Product.findById(req.query.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.status(200).json({ success: true, reviews: product.reviews })
}

// GET /admin/reviews  -> every review of every product (admin datatable)
exports.getAllReviews = async (req, res) => {
    const products = await Product.find({ 'reviews.0': { $exists: true } }).select('name reviews');
    const reviews = [];
    products.forEach(p => p.reviews.forEach(r => reviews.push({
        _id: r._id,
        productId: p._id,
        productName: p.name,
        user: r.user,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    })));
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ success: true, reviews })
}

// DELETE /reviews?productId=..&id=<reviewId>   (admin only)
exports.deleteReview = async (req, res) => {
    const product = await Product.findById(req.query.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

    const before = product.reviews.length;
    product.reviews = product.reviews.filter(r => r._id.toString() !== String(req.query.id));
    if (product.reviews.length === before) {
        return res.status(404).json({ success: false, message: 'Review not found' })
    }
    recalcRatings(product);
    await product.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true })
}

/* ------------------------------------------------------------------ */
/* Dashboard (unchanged behaviour from the reference system)           */
/* ------------------------------------------------------------------ */

exports.productSales = async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$itemsPrice" } } },
    ])
    const sales = await Order.aggregate([
        { $project: { _id: 0, "orderItems": 1, totalPrice: true } },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: { product: "$orderItems.name" },
                total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
            },
        },
    ])

    const grand = totalSales[0] ? totalSales[0].total : 0;
    const totalPercentage = sales.map(item => ({
        name: item._id.product,
        percent: grand ? Number(((item.total / grand) * 100).toFixed(2)) : 0
    }))

    res.status(200).json({ success: true, totalPercentage, sales, totalSales })
}
