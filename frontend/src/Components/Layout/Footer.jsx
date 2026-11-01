import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Logo from './Logo'
import { categoryLink } from '../Utils/helpers'

const Footer = () => {
    const { categories } = useSelector(state => state.catalog)

    return (
        <footer className="site-footer">
            <div className="store-container footer-columns">
                <div className="footer-brand">
                    <Link to="/" aria-label="Luna Interiors home"><Logo /></Link>
                    <p>Thoughtful furniture for every room.</p>
                </div>
                <div>
                    <h6>Shop</h6>
                    <Link to="/">All Furniture</Link>
                    {categories.map(({ category }) => <Link key={category} to={categoryLink(category)}>{category}</Link>)}
                </div>
                <div>
                    <h6>Account</h6>
                    <Link to="/me">My Profile</Link>
                    <Link to="/orders/me">My Orders</Link>
                    <Link to="/wishlist">Wishlist</Link>
                    <Link to="/cart">Cart</Link>
                </div>
                <div>
                    <h6>Good to know</h6>
                    <p>Free shipping on orders over ₱5,000.</p>
                    <p>Pay by card or cash on delivery.</p>
                    <p>Receipts are emailed with every order update.</p>
                </div>
            </div>
            <p className="footer-legal">&copy; {new Date().getFullYear()} Luna Interiors</p>
        </footer>
    )
}

export default Footer
