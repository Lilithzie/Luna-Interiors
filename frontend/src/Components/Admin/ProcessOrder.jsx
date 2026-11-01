import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails, updateOrder, clearOrderDetailsError } from '../../slices/orderSlice'
import { OrderTimeline, OrderTotals, ReceiptButton, STATUSES, fmtDate, paymentLabel } from '../Order/OrderParts'

const ProcessOrder = () => {

    const dispatch = useDispatch()
    const { order, loading, updating, error } = useSelector(state => state.orderDetails)
    const [selectedStatus, setSelectedStatus] = useState(null)

    let { id } = useParams();
    const { shippingInfo, orderItems, paymentInfo, user, totalPrice, orderStatus } = order
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
        // the server e-mails the customer (products, subtotal, grand total + PDF receipt)
        if (data.emailSent) toast.info(`Email with the PDF receipt sent to ${data.emailTo}`, { position: 'bottom-center' })
        else toast.warn('Status saved, but the email could not be sent. Check the SMTP settings in the backend .env.', { position: 'bottom-center' })
    }

    const shippingDetails = shippingInfo && `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`
    // the status can only move forward, so earlier steps are not offered
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
                    <>
                        {loading ? <Loader /> : (
                            <div className="row d-flex justify-content-around">
                                <div className="col-12 col-lg-7 order-details">
                                    <h2 className="mt-5 mb-2">Order # {order.transactionNo || order._id}</h2>
                                    <p className="text-muted mb-4">Placed on {fmtDate(order.createdAt)} · <Link to="/admin/orders">Back to all orders</Link></p>
                                    <h4 className="mb-4">Shipping Info</h4>
                                    <p><b>Name:</b> {user && user.name}</p>
                                    <p><b>Phone:</b> {shippingInfo && shippingInfo.phoneNo}</p>
                                    <p className="mb-4"><b>Address:</b>{shippingDetails}</p>
                                    <hr />
                                    <h4 className="my-4">Payment</h4>
                                    <p><b>Method:</b> {order.paymentMethod || 'Card'}</p>
                                    <p className={paymentLabel(order).cls}><b>{paymentLabel(order).text === 'TO PAY ON DELIVERY' ? 'TO COLLECT ON DELIVERY' : paymentLabel(order).text}</b></p>
                                    <h4 className="my-4">Payment Reference</h4>
                                    <p><b>{paymentInfo && paymentInfo.id}</b></p>

                                    <h4 className="my-4">Order Status:</h4>
                                    <p className={order.orderStatus && String(order.orderStatus).includes('Delivered') ? "greenColor" : "redColor"} ><b id="current_status">{orderStatus}</b></p>
                                    <OrderTimeline order={order} />
                                    <h4 className="my-4">Order Items:</h4>
                                    <hr />
                                    <div className="cart-item my-1">
                                        {orderItems && orderItems.map(item => (
                                            <div key={item.product} className="row my-5">
                                                <div className="col-4 col-lg-2">
                                                    <img src={item.image} alt={item.name} height="45" width="65" />
                                                </div>

                                                <div className="col-5 col-lg-5">
                                                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                </div>
                                                <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                                    <p>₱{item.price}</p>
                                                </div>
                                                <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                                    <p>{item.quantity} Piece(s)</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <hr />
                                    <div className="col-md-6 px-0 mb-3"><OrderTotals order={order} /></div>
                                    <div className="mb-5"><ReceiptButton order={order} /></div>
                                </div>
                                <div className="col-12 col-lg-3 mt-5">
                                    <h4 className="my-4">Status</h4>
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
                        )}
                    </>
                </div>
            </div>
        </>
    )
}
export default ProcessOrder