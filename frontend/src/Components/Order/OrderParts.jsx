import React from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { NO_IMAGE } from '../Utils/helpers'

export const STATUSES = ['Processing', 'Shipped', 'Delivered']
export const money = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : '')

// status timeline
export const OrderTimeline = ({ order }) => {
    const current = Math.max(STATUSES.indexOf(order.orderStatus), 0)
    const when = (status) => {
        const hit = (order.statusHistory || []).find(h => h.status === status)
        if (hit) return hit.at
        if (status === 'Processing') return order.createdAt
        if (status === 'Delivered') return order.deliveredAt
        return null
    }
    return (
        <ol className="order-timeline" id="order_timeline">
            {STATUSES.map((s, i) => (
                <li key={s} className={i < current ? 'done' : i === current ? 'current' : ''}>
                    <span className="dot">{i <= current ? '✓' : i + 1}</span>
                    <div>
                        <strong>{s}</strong>
                        <small className="d-block text-muted">{i <= current ? fmtDate(when(s)) : 'Waiting'}</small>
                    </div>
                </li>
            ))}
        </ol>
    )
}

// items / shipping / tax / grand total
export const OrderTotals = ({ order }) => (
    <table className="table table-sm order-totals" id="order_totals">
        <tbody>
            <tr><td>Items subtotal</td><td className="text-right">{money(order.itemsPrice)}</td></tr>
            <tr><td>Shipping</td><td className="text-right">{Number(order.shippingPrice) === 0 ? 'FREE' : money(order.shippingPrice)}</td></tr>
            <tr><td>Tax (5%)</td><td className="text-right">{money(order.taxPrice)}</td></tr>
            <tr className="grand"><td><strong>Grand total</strong></td><td className="text-right"><strong id="grand_total">{money(order.totalPrice)}</strong></td></tr>
        </tbody>
    </table>
)

// item rows
export const OrderItemsTable = ({ items = [] }) => (
    <div className="table-responsive">
        <table className="table table-sm order-items" id="order_items">
            <thead><tr><th>Product</th><th className="text-right">Price</th><th className="text-right">Qty</th><th className="text-right">Subtotal</th></tr></thead>
            <tbody>
                {items.map(item => (
                    <tr key={item.product}>
                        <td>
                            <Link to={`/product/${item.product}`} className="order-item-name">
                                <img src={item.image || NO_IMAGE} alt="" />
                                <span>{item.name}</span>
                            </Link>
                        </td>
                        <td className="text-right">{money(item.price)}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">{money(item.price * item.quantity)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)

export const StatusPill = ({ status, id }) => (
    <span id={id} className={`status-pill ${status === 'Delivered' ? 'done' : ''}`}>{status}</span>
)

// Payment and Ship to, side by side
export const PaymentAndShipping = ({ order, name, collect = false }) => {
    const pay = paymentLabel(order)
    const s = order.shippingInfo || {}
    return (
        <div className="row">
            <div className="col-md-6 mt-3">
                <div className="panel-card h-100">
                    <h5>Payment</h5>
                    <p className="mb-1"><b>Method:</b> {order.paymentMethod || 'Card'}</p>
                    <p className={`mb-0 ${pay.cls}`}><b>{collect && pay.text === 'TO PAY ON DELIVERY' ? 'TO COLLECT ON DELIVERY' : pay.text}</b></p>
                    {collect && order.paymentInfo && <p className="mb-0 mt-2 text-muted small">Reference: {order.paymentInfo.id}</p>}
                </div>
            </div>
            <div className="col-md-6 mt-3">
                <div className="panel-card h-100">
                    <h5>Ship to</h5>
                    {name && <p className="mb-1"><b>{name}</b></p>}
                    <p className="mb-0">{s.address}, {s.city}, {s.postalCode}, {s.country}<br />Phone: {s.phoneNo}</p>
                </div>
            </div>
        </div>
    )
}

export const paymentLabel = (order) => {
    const paid = order.paymentInfo && order.paymentInfo.status === 'succeeded'
    if (paid) return { text: 'PAID', cls: 'greenColor' }
    return order.paymentMethod === 'Cash on Delivery'
        ? { text: 'TO PAY ON DELIVERY', cls: 'redColor' }
        : { text: 'NOT PAID', cls: 'redColor' }
}

// download PDF receipt
export const ReceiptButton = ({ order, className = 'btn btn-outline-luna' }) => {
    const [busy, setBusy] = React.useState(false)
    const download = async () => {
        setBusy(true)
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/order/${order._id}/receipt`, { responseType: 'blob', withCredentials: true })
            const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
            const a = document.createElement('a')
            a.href = url
            a.download = `Receipt-${order.transactionNo || order._id}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch {
            toast.error('Could not download the receipt. Please try again.', { position: 'bottom-right' })
        }
        setBusy(false)
    }
    return (
        <button type="button" id="download_receipt" className={className} onClick={download} disabled={busy}>
            {busy ? 'Preparing PDF…' : 'Download receipt (PDF)'}
        </button>
    )
}
