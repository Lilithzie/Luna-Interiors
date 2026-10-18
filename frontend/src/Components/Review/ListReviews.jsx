import React from 'react'
import { Stars } from '../Layout/Stars'

const ListReviews = ({ reviews = [], currentUserId }) => {
    return (
        <div className="reviews w-75">
            <h3>Customer Reviews</h3>
            <hr />
            {reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
            {[...reviews].reverse().map(review => (
                <div key={review._id} className="review-card" id={`review_${review._id}`}>
                    <Stars value={review.rating} />
                    <p className="review_user mb-1">
                        by {review.name}{currentUserId && review.user === currentUserId && <span className="badge badge-secondary ml-2">You</span>}
                        <small className="text-muted ml-2">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                            {review.updatedAt ? ' (edited)' : ''}
                        </small>
                    </p>
                    <p className="review_comment mb-0">{review.comment}</p>
                </div>
            ))}
        </div>
    )
}

export default ListReviews
