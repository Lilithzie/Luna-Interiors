import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { clearOrderDetailsError, getOrderDetails } from '../../slices/orderSlice'
import { OrderItemsTable, OrderTimeline, OrderTotals, PaymentAndShipping, ReceiptButton, StatusPill, fmtDate } from './OrderParts'

// same layout as the success page
const OrderDetails = () => {
    const dispatch = useDispatch();
    const { loading, error, order = {} } = useSelector(state => state.orderDetails);
    const { user: viewer } = useSelector(state => state.auth)
    const isAdmin = !!(viewer && viewer.role === 'admin')
    let { id } = useParams();

    useEffect(() => {
        dispatch(getOrderDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            dispatch(clearOrderDetailsError())
        }
    }, [dispatch, error])

    return (
        <>
            <MetaData title={'Order Details'} />

            {loading ? <Loader /> : !order._id ? (
                <div className="order-page order-page-header">
                    <h2>Order not found</h2>
                    <Link to={isAdmin ? '/admin/orders' : '/orders/me'} className="btn btn-outline-luna mt-2">Back to orders</Link>
                </div>
            ) : (
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-8 order-page" id="order_details">
                        <div className="order-page-header">
                            <h2>Order # {order.transactionNo || order._id}</h2>
                            <p className="text-muted mb-2">Placed on {fmtDate(order.createdAt)}</p>
                            <StatusPill status={order.orderStatus} id="order_status" />
                        </div>

                        <div className="panel-card">
                            <h5>Order status</h5>
                            <OrderTimeline order={order} />
                        </div>

                        <div className="panel-card mt-3">
                            <h5>Items</h5>
                            <OrderItemsTable items={order.orderItems} />
                            <OrderTotals order={order} />
                        </div>

                        <PaymentAndShipping order={order} name={order.user && order.user.name} />

                        <div className="order-actions">
                            <ReceiptButton order={order} className="btn btn-luna" />
                            {isAdmin
                                ? <Link to={`/admin/order/${order._id}`} className="btn btn-outline-luna">Process order</Link>
                                : <Link to="/orders/me" className="btn btn-outline-luna">My Orders</Link>}
                            <Link to="/#catalog" className="btn btn-link">Continue shopping</Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default OrderDetails
