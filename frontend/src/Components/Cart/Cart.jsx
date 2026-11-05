import { useCallback, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { useDispatch, useSelector } from 'react-redux'
import { addItemToCart, removeItemFromCart, setSelectedCartItems } from '../../slices/cartSlice'
import { toast } from 'react-toastify'


const Cart = () => {
    const dispatch = useDispatch();
    const { cartItems, selectedCartItems } = useSelector(state => state.cart)
    const { isAuthenticated } = useSelector(state => state.auth)

    const navigate = useNavigate()
    const location = useLocation()
    const closeDrawer = useCallback(() => navigate(location.state?.backgroundLocation ? -1 : '/'), [location, navigate])

    useEffect(() => {
        const handleEscape = event => {
            if (event.key === 'Escape') closeDrawer()
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [closeDrawer])


    const increaseQty = (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (newQty > stock) return;
        dispatch(addItemToCart({ id, quantity: newQty }))
    }

    const decreaseQty = (id, quantity) => {
        const newQty = quantity - 1;
        if (newQty <= 0) return;
        dispatch(addItemToCart({ id, quantity: newQty }))
    }

    const removeCartItemHandler = (id) => {
        dispatch(removeItemFromCart(id))
    }

    const selectedIds = selectedCartItems === null
        ? cartItems.map(item => item.product)
        : selectedCartItems
    const selectedItems = cartItems.filter(item => selectedIds.includes(item.product))
    const allItemsSelected = cartItems.length > 0 && selectedItems.length === cartItems.length

    const toggleItemSelection = (id) => {
        const nextIds = selectedIds.includes(id)
            ? selectedIds.filter(itemId => itemId !== id)
            : [...selectedIds, id]
        dispatch(setSelectedCartItems(nextIds))
    }

    const toggleAllItems = () => {
        dispatch(setSelectedCartItems(allItemsSelected ? [] : cartItems.map(item => item.product)))
    }

    const checkoutHandler = () => {
        if (selectedItems.length === 0) {
            toast.error('Select at least one item to continue.', { position: 'bottom-right' })
            return
        }
        navigate(isAuthenticated ? '/shipping' : '/login?redirect=shipping')
    }
    // localStorage.setItem('cartItems', JSON.stringify(cartItems))
    // useEffect(() => {
    //     localStorage.setItem('cartItems', JSON.stringify(cartItems));
    // }, [cartItems]);
    return (
        <div className="cart-drawer-layer" role="dialog" aria-modal="true" aria-labelledby="cart_drawer_title">
            <MetaData title={'Your Cart'} />
            <button type="button" className="cart-drawer-backdrop" onClick={closeDrawer} aria-label="Close cart panel"></button>
            <aside className="cart-drawer">
                <button type="button" className="cart-drawer-close" onClick={closeDrawer} aria-label="Close cart panel">
                    <i className="fa fa-times" aria-hidden="true"></i>
                </button>
                <div className="cart-drawer-header">
                    <p className="cart-drawer-eyebrow">LUNA INTERIORS</p>
                    <h1 id="cart_drawer_title">Your Cart</h1>
                    <p>{selectedItems.length} of {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} selected</p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="cart-empty-state">
                        <i className="fa fa-shopping-bag" aria-hidden="true"></i>
                        <h2>Your cart is empty</h2>
                        <p>Discover something beautiful for your home.</p>
                        <Link to="/#catalog" className="btn btn-luna">Browse Furniture</Link>
                    </div>
                ) : (
                    <>
                        <div className="cart-selection-toolbar">
                            <label htmlFor="select_all_cart_items">
                                <input
                                    type="checkbox"
                                    id="select_all_cart_items"
                                    checked={allItemsSelected}
                                    onChange={toggleAllItems}
                                />
                                <span>Select all items</span>
                            </label>
                            <span>{selectedItems.length} selected</span>
                        </div>
                        <div className="cart-drawer-items">
                            {cartItems.map(item => (
                                <article className="cart-drawer-item" key={item.product}>
                                    <label className="cart-item-selection" htmlFor={`cart_item_${item.product}`}>
                                        <input
                                            type="checkbox"
                                            id={`cart_item_${item.product}`}
                                            checked={selectedIds.includes(item.product)}
                                            onChange={() => toggleItemSelection(item.product)}
                                            aria-label={`Select ${item.name} for checkout`}
                                        />
                                    </label>
                                    <Link to={`/product/${item.product}`} onClick={closeDrawer} className="cart-drawer-image">
                                        <img src={item.image} alt={item.name} />
                                    </Link>
                                    <div className="cart-drawer-item-details">
                                        <div className="cart-drawer-item-heading">
                                            <Link to={`/product/${item.product}`} onClick={closeDrawer}>{item.name}</Link>
                                            <button type="button" className="cart-item-remove" onClick={() => removeCartItemHandler(item.product)} aria-label={`Remove ${item.name}`}>
                                                <i className="fa fa-trash-o" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <strong className="cart-drawer-price">₱{Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                                        <div className="cart-drawer-item-footer">
                                            <div className="cart-quantity">
                                                <button type="button" onClick={() => decreaseQty(item.product, item.quantity)} aria-label={`Decrease ${item.name} quantity`}>−</button>
                                                <span>{item.quantity}</span>
                                                <button type="button" onClick={() => increaseQty(item.product, item.quantity, item.stock)} aria-label={`Increase ${item.name} quantity`}>+</button>
                                            </div>
                                            <span className="cart-item-total">₱{(item.quantity * item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <div className="cart-drawer-summary">
                            <div><span>Subtotal ({selectedItems.reduce((acc, item) => acc + Number(item.quantity), 0)} items)</span><strong>₱{selectedItems.reduce((acc, item) => acc + item.quantity * item.price, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></div>
                            <button id="checkout_btn" className="btn btn-luna btn-block" onClick={checkoutHandler} disabled={selectedItems.length === 0}>Continue to checkout</button>
                        </div>
                    </>
                )}
            </aside>
        </div>
    )
}

export default Cart