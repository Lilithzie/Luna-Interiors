import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Carousel } from 'react-bootstrap'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { Stars, StarInput } from '../Layout/Stars'
import ListReviews from '../Review/ListReviews'
import { peso, NO_IMAGE } from '../Utils/helpers'
import { getProductDetails } from '../../actions/productActions'
import { addItemToCart } from '../../actions/cartActions'

const ProductDetails = () => {
    const { loading, error, product } = useSelector(state => state.productDetails);
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [quantity, setQuantity] = useState(1)

    // MP3 review state
    const [canReview, setCanReview] = useState(false)
    const [myReview, setMyReview] = useState(null)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [saving, setSaving] = useState(false)
    const [reviewErrors, setReviewErrors] = useState({})
    const [reviewAttempted, setReviewAttempted] = useState(false)

    const { id } = useParams()
    const dispatch = useDispatch()

    const isAdmin = !!(user && user.role === 'admin')

    const increaseQty = () => { if (quantity < product.stock) setQuantity(quantity + 1) }
    const decreaseQty = () => { if (quantity > 1) setQuantity(quantity - 1) }

    const addToCart = async () => {
        await dispatch(addItemToCart(id, quantity));
        toast.success('Item added to cart', { position: 'bottom-right' })
    }

    const loadEligibility = useCallback(async () => {
        if (!isAuthenticated) { setCanReview(false); setMyReview(null); return }
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/review/eligibility`, { params: { productId: id }, withCredentials: true })
            setCanReview(data.canReview)
            setMyReview(data.review)
            setRating(data.review ? data.review.rating : 0)
            setComment(data.review ? data.review.comment : '')
        } catch (e) {
            setCanReview(false)
        }
    }, [id, isAuthenticated])

    const submitReview = async (e) => {
        e.preventDefault()
        setReviewAttempted(true)
        const nextErrors = {}
        if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) nextErrors.rating = 'Please select a rating from 1 to 5 stars.'
        if (comment.trim().length < 3) nextErrors.comment = 'Review must be at least 3 characters.'
        setReviewErrors(nextErrors)
        if (Object.keys(nextErrors).length) return
        setSaving(true)
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/review`, { rating, comment, productId: id }, { withCredentials: true })
            toast.success(data.updated ? 'Your review was updated' : 'Thanks! Your review was posted', { position: 'bottom-right' })
            if (data.masked) toast.info('Some words in your review were masked (****) because they are not allowed.', { position: 'bottom-right' })
            dispatch(getProductDetails(id))
            loadEligibility()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not save review', { position: 'bottom-right' })
        }
        setSaving(false)
    }

    useEffect(() => { dispatch(getProductDetails(id)) }, [dispatch, id]);
    useEffect(() => { loadEligibility() }, [loadEligibility]);

    if (loading && !product._id) return <Loader />
    if (error && !product._id) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>

    const images = product.images && product.images.length ? product.images : [{ public_id: 'none', url: NO_IMAGE }]

    return (
        <>
            <MetaData title={product.name} />
            <div className="container container-fluid">
                <div className="row d-flex justify-content-around mt-4">
                    <div className="col-12 col-lg-5 img-fluid" id="product_image">
                        <Carousel pause='hover' interval={null} indicators={images.length > 1} controls={images.length > 1}>
                            {images.map(image => (
                                <Carousel.Item key={image.public_id}>
                                    <img className="d-block w-100" src={image.url} alt={product.name} style={{ borderRadius: 12, maxHeight: 420, objectFit: 'cover' }} />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </div>

                    <div className="col-12 col-lg-5 mt-4 mt-lg-0">
                        <div className="luna-cat">{product.category}</div>
                        <h3>{product.name}</h3>
                        <p id="product_id" className="text-muted">Product # {product._id}</p>
                        <hr />
                        <Stars value={product.ratings} />
                        <span id="no_of_reviews">({product.numOfReviews} {product.numOfReviews === 1 ? 'Review' : 'Reviews'})</span>
                        <hr />
                        <p id="product_price">{peso(product.price)}</p>
                        {isAdmin ? (
                            <div className="alert alert-secondary" id="admin_notice">
                                You are logged in as an admin. Admin accounts manage the shop and cannot order.{' '}
                                <Link to={`/admin/product/${product._id}`}>Edit this product</Link>
                            </div>
                        ) : (
                            <>
                                <div className="stockCounter d-inline">
                                    <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>
                                    <input type="number" className="form-control count d-inline" value={quantity} readOnly />
                                    <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
                                </div>
                                <button type="button" id="cart_btn" className="btn btn-luna d-inline ml-4" disabled={product.stock === 0} onClick={addToCart}>Add to Cart</button>
                            </>
                        )}
                        <hr />
                        <p>Status: <span id="stock_status" className={product.stock > 0 ? 'greenColor' : 'redColor'}>{product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</span></p>
                        <hr />
                        <h4 className="mt-2">Description:</h4>
                        <p>{product.description}</p>
                        <hr />
                        <p id="product_seller">Sold by: <strong>{product.seller}</strong></p>

                        {/* ---------------- MP3: write / update my review ---------------- */}
                        <div id="review_section" className="mt-4">
                            {!isAuthenticated && (
                                <div className="alert alert-secondary">
                                    <Link to="/login">Login</Link> to review products you've ordered.
                                </div>
                            )}
                            {isAuthenticated && !isAdmin && !canReview && (
                                <div className="alert alert-secondary" id="review_locked">
                                    Only customers who have ordered this product can write a review.
                                </div>
                            )}
                            {isAuthenticated && !isAdmin && canReview && (
                                <form onSubmit={submitReview} className="filter-panel" id="review_form">
                                    <h5>{myReview ? 'Update your review' : 'Write a review'}</h5>
                                    <StarInput value={rating} onChange={(value) => { setRating(value); if (reviewAttempted) setReviewErrors(current => ({ ...current, rating: '' })) }} />
                                    {reviewErrors.rating && <div className="text-danger small mt-1" role="alert">{reviewErrors.rating}</div>}
                                    <textarea
                                        id="review"
                                        className={`form-control mt-3 ${reviewErrors.comment ? 'is-invalid' : ''}`}
                                        rows="3"
                                        placeholder="Tell others what you think of this piece…"
                                        value={comment}
                                        onChange={(e) => { setComment(e.target.value); if (reviewAttempted) setReviewErrors(current => ({ ...current, comment: '' })) }}
                                    />
                                    {reviewErrors.comment && <div className="invalid-feedback">{reviewErrors.comment}</div>}
                                    <small className="text-muted">Inappropriate words are automatically masked (****).</small>
                                    <button type="submit" id="submit_review" className="btn btn-luna mt-3" disabled={saving}>
                                        {saving ? 'Saving…' : myReview ? 'Update Review' : 'Submit Review'}
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="mt-4 mb-5">
                            <ListReviews reviews={product.reviews || []} currentUserId={user && user._id} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductDetails
