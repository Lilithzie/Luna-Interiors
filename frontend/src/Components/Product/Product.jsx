import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { Stars } from '../Layout/Stars'
import { discountPercent, firstImage, peso } from '../Utils/helpers'
import { addItemToCart } from '../../slices/cartSlice'
import WishlistButton from './WishlistButton'

export const ProductPrice = ({ product }) => {
    const discount = discountPercent(product)
    return (
        <p className="product-price">
            <b>{peso(product.price)}</b>
            {discount > 0 && (
                <>
                    <s className="price-was">{peso(product.compareAtPrice)}</s>
                    <span className="price-off">{discount}% off</span>
                </>
            )}
        </p>
    )
}

const Product = ({ product }) => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const inCart = useSelector(state => state.cart.cartItems.find(item => item.product === product._id))
    const isAdmin = !!(user && user.role === 'admin')
    const quantity = inCart ? inCart.quantity : 0
    const canAdd = quantity < product.stock

    const addToCart = async () => {
        try {
            await dispatch(addItemToCart({ id: product._id, quantity: quantity + 1 })).unwrap()
            toast.success('Item added to cart', { position: 'bottom-right' })
        } catch (message) {
            toast.error(message, { position: 'bottom-right' })
        }
    }

    return (
        <div className="col-6 col-xl-4 product-col">
            <article className="product-card">
                <div className="product-card-media">
                    <Link to={`/product/${product._id}`}>
                        <img src={firstImage(product)} alt={product.name} loading="lazy" />
                    </Link>
                    {discountPercent(product) > 0 && <span className="product-badge">Sale</span>}
                    <WishlistButton productId={product._id} />
                </div>
                <div className="product-card-body">
                    <div className="luna-cat">{product.category}</div>
                    <h5 className="card-title">
                        <Link to={`/product/${product._id}`}>{product.name}</Link>
                    </h5>
                    <div className="ratings">
                        <Stars value={product.ratings} />
                        <span id="no_of_reviews">({product.numOfReviews})</span>
                    </div>
                    <ProductPrice product={product} />
                    <div className="product-card-actions">
                        {!isAdmin && (
                            <button type="button" className="btn btn-luna add-to-cart" disabled={!canAdd} onClick={addToCart}>
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        )}
                        <Link to={`/product/${product._id}`} id="view_btn" className="btn btn-outline-luna">View Details</Link>
                    </div>
                </div>
            </article>
        </div>
    )
}

export default Product
