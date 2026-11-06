import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { OrderItemsTable, OrderTotals } from '../Order/OrderParts'
import { useSelector } from 'react-redux'
const ConfirmOrder = () => {
    let navigate = useNavigate();
    const { cartItems, selectedCartItems, shippingInfo } = useSelector(state => state.cart)
    const checkoutItems = selectedCartItems === null
        ? cartItems
        : cartItems.filter(item => selectedCartItems.includes(item.product))
    const { user } = useSelector(state => state.auth)
    // order prices
    const itemsPrice = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shippingPrice = itemsPrice > 5000 ? 0 : 250
    const taxPrice = Number((0.05 * itemsPrice).toFixed(2))
    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2)

    const processToPayment = () => {
        const data = {
            itemsPrice: itemsPrice.toFixed(2),
            shippingPrice,
            taxPrice,
            totalPrice
        }

        sessionStorage.setItem('orderInfo', JSON.stringify(data))
        navigate('/payment')
    }

    return (
        <>
            <MetaData title={'Confirm Order'} />
            <CheckoutSteps shipping confirmOrder />
            <div className="row order-page">
                <div className="col-12 col-lg-8">
                    <div className="panel-card">
                        <h5>Ship to</h5>
                        {user && <p className="mb-1"><b>{user.name}</b></p>}
                        <p className="mb-0">{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.country}<br />Phone: {shippingInfo.phoneNo}</p>
                    </div>

                    <div className="panel-card mt-3">
                        <h5>Items</h5>
                        <OrderItemsTable items={checkoutItems} />
                    </div>
                </div>

                <div className="col-12 col-lg-4 mt-3 mt-lg-0">
                    <div className="panel-card order-status-card" id="order_summary">
                        <h5>Order summary</h5>
                        <OrderTotals order={{ itemsPrice, shippingPrice, taxPrice, totalPrice }} />
                        <button id="checkout_btn" className="btn btn-luna btn-block" onClick={processToPayment}>Proceed to Payment</button>                    </div>
                </div>
            </div>
        </>
    )
}

export default ConfirmOrder