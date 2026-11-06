import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails, updateOrder, clearOrderDetailsError } from '../../slices/orderSlice'
import { OrderItemsTable, OrderTimeline, OrderTotals, PaymentAndShipping, ReceiptButton, STATUSES, StatusPill, fmtDate } from '../Order/OrderParts'

const ProcessOrder = () => {

    const dispatch = useDispatch()
    const { order, loading, updating, error } = useSelector(state => state.orderDetails)
    const [selectedStatus, setSelectedStatus] = useState(null)

    let { id } = useParams();
    const { orderItems, user, orderStatus } = order
    const status = selectedStatus ?? orderStatus ?? ''
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-center'
    });

    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-center'
    });

    useEffect(() => {
        dispatch(getOrderDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (error) {
            errMsg(error);
            dispatch(clearOrderDetailsError())
        }
    }, [dispatch, error])

    const updateOrderHandler = async (id) => {
        const result = await dispatch(updateOrder({ id, status }))
        if (!updateOrder.fulfilled.match(result)) return
        const data = result.payload
        setSelectedStatus(null)
        successMsg(`Order status updated to ${data.order.orderStatus}`);
        // server emails the customer
        if (data.emailSent) toast.info(`Email with the PDF receipt sent to ${data.emailTo}`, { position: 'bottom-center' })
        else toast.warn('Status saved, but the email could not be sent. Check the SMTP settings in the backend .env.', { position: 'bottom-center' })
    }

    // forward statuses only
    const currentIdx = STATUSES.indexOf(orderStatus)
    const delivered = orderStatus === 'Delivered'
    return (
        <>
            <MetaData title={`Process Order # ${order && order._id}`} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    {loading ? <Loader /> : (
                        <div className="row order-page">
                            <div className="col-12 col-lg-8">
                                <div className="order-page-header text-lg-left">
                                    <h2>Order # {order.transactionNo || order._id}</h2>
                                    <p className="text-muted mb-2">Placed on {fmtDate(order.createdAt)} · <Link to="/admin/orders">Back to all orders</Link></p>
                                    <StatusPill status={orderStatus} id="current_status" />
                                </div>

                                <div className="panel-card">
                                    <h5>Order status</h5>
                                    <OrderTimeline order={order} />
                                </div>

                                <div className="panel-card mt-3">
                                    <h5>Items</h5>
                                    <OrderItemsTable items={orderItems} />
                                    <OrderTotals order={order} />
                                </div>

                                <PaymentAndShipping order={order} name={user && user.name} collect />

                                <div className="order-actions justify-content-lg-start">
                                    <ReceiptButton order={order} />
                                </div>
                            </div>

                            <div className="col-12 col-lg-4">
                                <div className="panel-card order-status-card">
                                    <h5>Update status</h5>
                                    <div className="form-group">
                                        <select
                                            className="form-control"
                                            name='status'
                                            value={status}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                        >
                                            {STATUSES.map((s, i) => (
                                                <option key={s} value={s} disabled={i < currentIdx}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button id="update_status" className="btn btn-luna btn-block" disabled={delivered || updating || status === orderStatus} onClick={() => updateOrderHandler(order._id)}>
                                        Update Status
                                    </button>
                                    <small className="text-muted d-block mt-2">
                                        {delivered ? 'This order is delivered, so its status is final.' : 'Status can only move forward (Processing → Shipped → Delivered). The customer is emailed with the receipt each time you update it.'}
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
export default ProcessOrder