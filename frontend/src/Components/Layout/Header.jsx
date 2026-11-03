import { useEffect, useState } from 'react'
import '../../App.css'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../slices/authSlice'
import { getCategorySummary } from '../../slices/catalogSlice'
import { categoryLink } from '../Utils/helpers'
import Logo from './Logo'
import Search from './Search'

export const Header = () => {
    const [announcementVisible, setAnnouncementVisible] = useState(() => {
        try {
            return sessionStorage.getItem('luna-announcement-dismissed') !== 'true'
        } catch {
            return true
        }
    })
    const [announcementClosing, setAnnouncementClosing] = useState(false)
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth)
    const { cartItems } = useSelector(state => state.cart)
    const { ids: wishlistIds } = useSelector(state => state.wishlist)
    const { categories } = useSelector(state => state.catalog)
    const location = useLocation()
    const backgroundLocation = location.state?.backgroundLocation
    const displayedLocation = backgroundLocation || location
    const { pathname } = displayedLocation
    const [searchParams] = useSearchParams()
    const activeCategory = pathname === '/' ? searchParams.get('category') : null
    const isAdmin = !!(user && user.role === 'admin')
    const inAdminArea = pathname === '/dashboard' || pathname.startsWith('/admin')

    useEffect(() => { dispatch(getCategorySummary()) }, [dispatch])

    const dismissAnnouncement = () => {
        setAnnouncementClosing(true)
        window.setTimeout(() => setAnnouncementVisible(false), 200)
        try {
            sessionStorage.setItem('luna-announcement-dismissed', 'true')
        } catch {
            // Session storage may be unavailable in privacy-restricted browsers.
        }
    }

    const logoutHandler = () => {
        dispatch(logout());
        toast.success('log out', {
            position: 'bottom-right'
        });
    }

    return (
        <header className="site-header">
            {!inAdminArea && announcementVisible && (
                <div className={`announcement-bar ${announcementClosing ? 'is-closing' : ''}`} id="announcement_bar">
                    <span>Free shipping on orders over ₱5,000 &nbsp;·&nbsp; Cash on delivery available</span>
                    <button type="button" className="announcement-dismiss" onClick={dismissAnnouncement} aria-label="Dismiss announcement">
                        <i className="fa fa-times" aria-hidden="true"></i>
                    </button>
                </div>
            )}

            <div className="header-main">
                <Link to="/" className="header-logo" aria-label="Luna Interiors home">
                    <Logo className="d-none d-md-block" />
                    <Logo symbol className="d-md-none" />
                </Link>

                {!inAdminArea && <div className="header-search"><Search /></div>}

                <div className="header-actions">
                    {user ? (
                        <div className="dropdown">
                            <Link to="#!" className="header-action dropdown-toggle" type="button" id="dropDownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <figure className="avatar avatar-nav">
                                    <img
                                        src={user.avatar && user.avatar.url}
                                        alt={user && user.name}
                                        className="rounded-circle"
                                    />
                                </figure>
                                <span className="header-action-label d-none d-lg-inline">{user && user.name}</span>
                            </Link>
                            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropDownMenuButton">
                                {isAdmin ? (
                                    <>
                                        <Link className="dropdown-item" to="/dashboard">Dashboard</Link>
                                        <Link className="dropdown-item" to="/admin/products">Products</Link>
                                        <Link className="dropdown-item" to="/admin/orders">Orders</Link>
                                    </>
                                ) : (
                                    <Link className="dropdown-item" to="/orders/me">My Orders</Link>
                                )}
                                <Link className="dropdown-item" to="/me" state={{ backgroundLocation: displayedLocation }}>Profile</Link>
                                <Link
                                    className="dropdown-item text-danger" to="/"
                                    onClick={logoutHandler}
                                >
                                    Logout
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" state={{ backgroundLocation: displayedLocation }} className="header-action" id="login_btn" aria-label="Login">
                            <i className="fa fa-user-o" aria-hidden="true"></i>
                            <span className="header-action-label d-none d-lg-inline">Login</span>
                        </Link>
                    )}

                    {!isAdmin && (
                        <>
                            <Link to="/wishlist" state={{ backgroundLocation: displayedLocation }} className="header-action" id="wishlist_link" aria-label="Wishlist">
                                <i className="fa fa-heart-o" aria-hidden="true"></i>
                                <span className="header-count" id="wishlist_count">{wishlistIds.length}</span>
                            </Link>
                            <Link to="/cart" state={{ backgroundLocation: displayedLocation }} className="header-action" id="cart_link" aria-label="Cart">
                                <i className="fa fa-shopping-cart" aria-hidden="true"></i>
                                <span className="header-count" id="cart_count">{cartItems ? cartItems.length : null}</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {!inAdminArea && (
                <nav className="category-nav" aria-label="Shop by category">
                    <Link to="/" className={pathname === '/' && !activeCategory ? 'active' : ''}>All Furniture</Link>
                    {categories.map(({ category }) => (
                        <Link key={category} to={categoryLink(category)} className={activeCategory === category ? 'active' : ''}>{category}</Link>
                    ))}
                </nav>
            )}
        </header>
    )
}
