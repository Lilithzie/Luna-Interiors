import React from 'react'
import { Link } from 'react-router-dom'
import { Stars } from '../Layout/Stars'
import { firstImage, peso } from '../Utils/helpers'

const Product = ({ product }) => {
    return (
        <div className="col-sm-12 col-md-6 col-lg-4 my-3">
            <div className="card luna-card p-0">
                <Link to={`/product/${product._id}`}>
                    <img className="luna-card-img" src={firstImage(product)} alt={product.name} />
                </Link>
                <div className="card-body d-flex flex-column">
                    <div className="luna-cat">{product.category}</div>
                    <h5 className="card-title mb-1">
                        <Link to={`/product/${product._id}`}>{product.name}</Link>
                    </h5>
                    <div className="ratings mt-auto">
                        <Stars value={product.ratings} />
                        <span id="no_of_reviews">({product.numOfReviews} {product.numOfReviews === 1 ? 'review' : 'reviews'})</span>
                    </div>
                    <p className="card-text mb-2"><b>{peso(product.price)}</b></p>
                    <Link to={`/product/${product._id}`} id="view_btn" className="btn btn-block btn-luna">View Details</Link>
                </div>
            </div>
        </div>
    )
}

export default Product
