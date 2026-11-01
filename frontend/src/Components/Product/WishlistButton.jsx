import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '../../slices/wishlistSlice'

// Admin accounts do not shop, so they get no heart
const WishlistButton = ({ productId, className = '' }) => {
    const dispatch = useDispatch()
    const saved = useSelector(state => state.wishlist.ids.includes(productId))
    const { user } = useSelector(state => state.auth)
    if (user && user.role === 'admin') return null

    return (
        <button
            type="button"
            className={`wishlist-btn ${saved ? 'saved' : ''} ${className}`}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            onClick={() => dispatch(toggleWishlist(productId))}
        >
            <i className={`fa ${saved ? 'fa-heart' : 'fa-heart-o'}`} aria-hidden="true"></i>
        </button>
    )
}

export default WishlistButton
