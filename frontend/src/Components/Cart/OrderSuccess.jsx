import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import MetaData from '../Layout/MetaData'
import { OrderItemsTable, OrderTimeline, OrderTotals, PaymentAndShipping, ReceiptButton, fmtDate } from '../Order/OrderParts'

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
                <div className="order-page order-page-header">
                    <img className="mb-4 img-fluid d-block mx-auto" src="/images/order_success.png" alt="Order Success" width="160" height="160" />
                    <h2>Your order has been placed.</h2>
                    <Link to="/orders/me" className="btn btn-luna mt-2">Go to My Orders</Link>
                </div>
            </>
        )
    }

    return (
        <>
            <MetaData title={'Order Success'} />
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8 order-page" id="transaction_receipt">
                    <div className="order-page-header">
                        <h2>Thank you! Your order has been placed.</h2>
                        <p className="text-muted mb-0">Transaction <strong id="transaction_no">{order.transactionNo || order._id}</strong> · {fmtDate(order.createdAt)}</p>
                    </div>

                    {created.emailSent ? (
                        <div className="alert alert-success" id="email_note">A confirmation email with your PDF receipt was sent to <strong>{created.emailTo}</strong>.</div>
                    ) : (
                        <div className="alert alert-warning" id="email_note">Your order is placed, but we could not send the confirmation email right now. You can still download your receipt below.</div>
                    )}

                    <div className="panel-card">
                        <h5>Order status</h5>
                        <OrderTimeline order={order} />
                    </div>

                    <div className="panel-card mt-3">
                        <h5>Items</h5>
                        <OrderItemsTable items={order.orderItems} />
                        <OrderTotals order={order} />
                    </div>

                    <PaymentAndShipping order={order} />

                    <div className="order-actions">
                        <Link to={`/order/${order._id}`} className="btn btn-luna" id="view_order">View order details</Link>
                        <ReceiptButton order={order} />
                        <Link to="/orders/me" className="btn btn-outline-luna">My Orders</Link>
                        <Link to="/#catalog" className="btn btn-link">Continue shopping</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default OrderSuccess
