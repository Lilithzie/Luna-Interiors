import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Product from './Product'
import { getWishlistProducts } from '../../slices/wishlistSlice'

const Wishlist = () => {
    const dispatch = useDispatch()
    const { ids, products, loading, error } = useSelector(state => state.wishlist)

    useEffect(() => {
        dispatch(getWishlistProducts(ids))
        // only on opening the page: removing a heart updates the list on its own
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    return (
        <>
            <MetaData title={'Wishlist'} />
            <div className="store-container page-section" id="wishlist_page">
                <h1>Wishlist</h1>
                {loading && <Loader />}
                {error && <div className="alert alert-danger">{error}</div>}
                {!loading && !error && products.length === 0 && (
                    <div className="empty-state" id="wishlist_empty">
                        <p>Nothing saved yet. Tap the heart on any piece to keep it here.</p>
                        <Link to="/" className="btn btn-luna">Browse Furniture</Link>
                    </div>
                )}
                {!loading && products.length > 0 && (
                    <div className="row">
                        {products.map(product => <Product key={product._id} product={product} />)}
                    </div>
                )}
            </div>
        </>
    )
}

export default Wishlist
