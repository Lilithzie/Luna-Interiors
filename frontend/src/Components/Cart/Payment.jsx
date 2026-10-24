import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { createOrder } from '../../actions/orderActions'
import { clearCart } from '../../actions/cartActions';

const COD = 'Cash on Delivery'
const CARD = 'Card'

const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const [method, setMethod] = useState(COD)
    const [cardName, setCardName] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvc, setCvc] = useState('')
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    let orderInfo = null
    try { orderInfo = JSON.parse(sessionStorage.getItem('orderInfo')) } catch { orderInfo = null }

    // "4242 4242 4242 4242" style grouping, digits only
    const onCardNumber = (v) => setCardNumber(v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())
    const onExpiry = (v) => {
        const d = v.replace(/\D/g, '').slice(0, 4)
        setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d)
    }

    const validateCard = () => {
        const e = {}
        if (!cardName.trim()) e.cardName = 'Enter the name on the card'
        if (cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'Card number must be 16 digits'
        const m = /^(\d{2})\/(\d{2})$/.exec(expiry)
        if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) e.expiry = 'Use MM/YY'
        else {
            const end = new Date(2000 + Number(m[2]), Number(m[1]), 1)    // first day after the expiry month
            if (end <= new Date()) e.expiry = 'This card has expired'
        }
        if (!/^\d{3,4}$/.test(cvc)) e.cvc = 'CVC must be 3 or 4 digits'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!orderInfo || cartItems.length === 0) {
            toast.error('Your cart is empty', { position: 'bottom-right' })
            return navigate('/cart')
        }
        if (method === CARD && !validateCard()) return

        setSubmitting(true)
        // The server recalculates prices from the database; the browser only sends what was chosen.
        const order = {
            orderItems: cartItems.map(i => ({ product: i.product, quantity: i.quantity })),
            shippingInfo,
            paymentMethod: method,
            // card payment is simulated: never send the full number or the CVC
            paymentInfo: method === CARD ? { last4: cardNumber.replace(/\s/g, '').slice(-4) } : {}
        }
        const ok = await dispatch(createOrder(order))
        if (ok) {
            dispatch(clearCart())
            sessionStorage.removeItem('orderInfo')
            navigate('/success')
        } else {
            toast.error('Your order could not be placed. Please check your cart and try again.', { position: 'bottom-right' })
            setSubmitting(false)
        }
    }

    return (
        <>
            <MetaData title={'Payment'} />
            <CheckoutSteps shipping confirmOrder payment />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} noValidate>
                        <h1 className="mb-4">Payment Method</h1>

                        <div className="form-check mb-2">
                            <input className="form-check-input" type="radio" name="payment_method" id="pay_cod"
                                checked={method === COD} onChange={() => setMethod(COD)} />
                            <label className="form-check-label" htmlFor="pay_cod"><b>Cash on Delivery</b> — pay in cash when your order arrives</label>
                        </div>
                        <div className="form-check mb-4">
                            <input className="form-check-input" type="radio" name="payment_method" id="pay_card"
                                checked={method === CARD} onChange={() => setMethod(CARD)} />
                            <label className="form-check-label" htmlFor="pay_card"><b>Credit / Debit Card</b></label>
                        </div>

                        {method === CARD && (
                            <div id="card_section">
                                <div className="form-group">
                                    <label htmlFor="card_name_field">Name on Card</label>
                                    <input type="text" id="card_name_field" className={`form-control ${errors.cardName ? 'is-invalid' : ''}`}
                                        value={cardName} onChange={(e) => setCardName(e.target.value)} autoComplete="cc-name" />
                                    <div className="invalid-feedback">{errors.cardName}</div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="card_num_field">Card Number</label>
                                    <input type="text" id="card_num_field" className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
                                        inputMode="numeric" placeholder="1234 5678 9012 3456"
                                        value={cardNumber} onChange={(e) => onCardNumber(e.target.value)} autoComplete="cc-number" />
                                    <div className="invalid-feedback">{errors.cardNumber}</div>
                                </div>
                                <div className="row">
                                    <div className="form-group col-6">
                                        <label htmlFor="card_exp_field">Card Expiry</label>
                                        <input type="text" id="card_exp_field" className={`form-control ${errors.expiry ? 'is-invalid' : ''}`}
                                            placeholder="MM/YY" value={expiry} onChange={(e) => onExpiry(e.target.value)} autoComplete="cc-exp" />
                                        <div className="invalid-feedback">{errors.expiry}</div>
                                    </div>
                                    <div className="form-group col-6">
                                        <label htmlFor="card_cvc_field">Card CVC</label>
                                        <input type="password" id="card_cvc_field" className={`form-control ${errors.cvc ? 'is-invalid' : ''}`}
                                            inputMode="numeric" maxLength={4} value={cvc}
                                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))} autoComplete="cc-csc" />
                                        <div className="invalid-feedback">{errors.cvc}</div>
                                    </div>
                                </div>
                                <small className="text-muted d-block mb-3">Demo checkout: the card is not actually charged and only the last 4 digits are saved.</small>
                            </div>
                        )}

                        <button id="pay_btn" type="submit" className="btn btn-luna btn-block py-3" disabled={submitting}>
                            {submitting ? 'Placing order…' : method === COD ? `Place Order - ₱${orderInfo ? orderInfo.totalPrice : ''}` : `Pay - ₱${orderInfo ? orderInfo.totalPrice : ''}`}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Payment
