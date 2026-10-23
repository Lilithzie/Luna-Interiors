const express = require('express')
const router = express.Router();

const { newOrder,
	myOrders,
	getSingleOrder,

	deleteOrder,
	allOrders,
	updateOrder,
	totalOrders,
	totalSales,
	customerSales,
	salesPerMonth,
	salesChart,
	downloadReceipt,


} = require('../controllers/order')
const { isAuthenticatedUser, authorizeRoles, forbidAdmin } = require('../middleware/auth')

router.post('/order/new', isAuthenticatedUser, forbidAdmin, newOrder);
router.get('/orders/me', isAuthenticatedUser, myOrders);
router.get('/order/:id', isAuthenticatedUser, getSingleOrder);
router.get('/order/:id/receipt', isAuthenticatedUser, downloadReceipt);
router.get('/admin/orders/', isAuthenticatedUser, authorizeRoles('admin'), allOrders);
// // router.route('/admin/order/:id').delete(isAuthenticatedUser, deleteOrder);
router.route('/admin/order/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder).delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);
router.get('/admin/total-orders', isAuthenticatedUser, authorizeRoles('admin'), totalOrders);
router.get('/admin/total-sales', isAuthenticatedUser, authorizeRoles('admin'), totalSales);
router.get('/admin/customer-sales', isAuthenticatedUser, authorizeRoles('admin'), customerSales);
router.get('/admin/sales-per-month', isAuthenticatedUser, authorizeRoles('admin'), salesPerMonth);
router.get('/admin/sales-chart', isAuthenticatedUser, authorizeRoles('admin'), salesChart);
module.exports = router;