import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import MetaData from '../Layout/MetaData'
import { OrderTimeline, OrderTotals, ReceiptButton, fmtDate, money, paymentLabel } from '../Order/OrderParts'

// Shown right after checkout: the completed transaction (like a receipt).
const OrderSuccess = () => {
    sessionStorage.removeItem('orderInfo')
    const { order: created } = useSelector(state => state.newOrder)
    const order = created && created.order

    // opened without placing an order (e.g. page refreshed) -> simple message
    if (!order) {
        return (
            <>
                <MetaData title={'Order Success'} />
                <div className="row justify-content-center">
                    <div className="col-6 mt-5 text-center">
                        <img className="my-5 img-fluid d-block mx-auto" src="/images/order_success.png" alt="Order Success" width="200" height="200" />
                        <h2>Your Order has been placed successfully.</h2>
                        <Link to="/orders/me">Go to Orders</Link>
                    </div>
                </div>
            </>
        )
    }

    const pay = paymentLabel(order)
    const s = order.shippingInfo || {}

    return (
        <>
            <MetaData title={'Order Success'} />
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8 mt-5" id="transaction_receipt">
                    <div className="text-center mb-4">
                        <h2 className="mb-1">Thank you! Your order has been placed.</h2>
                        <p className="text-muted mb-0">Transaction <strong id="transaction_no">{order.transactionNo || order._id}</strong> · {fmtDate(order.createdAt)}</p>
                    </div>

                    {created.emailSent ? (
                        <div className="alert alert-success" id="email_note">A confirmation email with your PDF receipt was sent to <strong>{created.emailTo}</strong>.</div>
                    ) : (
                        <div className="alert alert-warning" id="email_note">Your order is placed, but we could not send the confirmation email right now. You can still download your receipt below.</div>
                    )}

                    <div className="filter-panel">
                        <h5>Order status</h5>
                        <OrderTimeline order={order} />
                    </div>

                    <div className="filter-panel mt-3">
                        <h5>Items</h5>
                        <table className="table table-sm">
                            <thead><tr><th>Product</th><th className="text-right">Price</th><th className="text-right">Qty</th><th className="text-right">Subtotal</th></tr></thead>
                            <tbody>
                                {order.orderItems.map(item => (
                                    <tr key={item.product}>
                                        <td>{item.name}</td>
                                        <td className="text-right">{money(item.price)}</td>
                                        <td className="text-right">{item.quantity}</td>
                                        <td className="text-right">{money(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <OrderTotals order={order} />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mt-3">
                            <div className="filter-panel h-100">
                                <h5>Payment</h5>
                                <p className="mb-1"><b>Method:</b> {order.paymentMethod}</p>
                                <p className={`mb-0 ${pay.cls}`}><b>{pay.text}</b></p>
                            </div>
                        </div>
                        <div className="col-md-6 mt-3">
                            <div className="filter-panel h-100">
                                <h5>Ship to</h5>
                                <p className="mb-0">{s.address}, {s.city}, {s.postalCode}, {s.country}<br />Phone: {s.phoneNo}</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center my-4">
                        <Link to={`/order/${order._id}`} className="btn btn-luna mr-2" id="view_order">View order details</Link>
                        <span className="mr-2"><ReceiptButton order={order} /></span>
                        <Link to="/orders/me" className="btn btn-outline-luna mr-2">My Orders</Link>
                        <Link to="/" className="btn btn-link">Continue shopping</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default OrderSuccess
