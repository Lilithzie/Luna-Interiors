const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const {
    newProduct,
    getSingleProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    getAdminProducts,
    createProductReview,
    reviewEligibility,
    getProductReviews,
    getAllReviews,
    deleteReview,
    productSales,
} = require('../controllers/product');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')

const admin = [isAuthenticatedUser, authorizeRoles('admin')];

// ---- shop (public)
router.get('/products', getProducts)
router.get('/product/:id', getSingleProduct)

// ---- MP1: admin product CRUD (+ multiple photos, bulk delete)
router.get('/admin/products', ...admin, getAdminProducts)
router.post('/admin/product/new', ...admin, upload.array('images', 10), newProduct);
router.delete('/admin/products', ...admin, bulkDeleteProducts);
router.route('/admin/product/:id')
    .put(...admin, upload.array('images', 10), updateProduct)
    .delete(...admin, deleteProduct);

// ---- MP3: reviews & ratings
router.put('/review', isAuthenticatedUser, createProductReview)
router.get('/review/eligibility', isAuthenticatedUser, reviewEligibility)
router.get('/reviews', getProductReviews)
router.get('/admin/reviews', ...admin, getAllReviews)
router.delete('/reviews', ...admin, deleteReview)

router.get('/admin/product-sales', ...admin, productSales);
module.exports = router
