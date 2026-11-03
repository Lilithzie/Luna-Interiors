import { useCallback, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'

import { useSelector } from 'react-redux'

const Profile = () => {
    const { user, loading } = useSelector(state => state.auth)
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

    // const [loading, setLoading] = useState(true)
    // const [user, setUser] = useState({})


    // const getProfile = async () => {
    //     const config = {
    //         headers: {
    //             'Authorization': `Bearer ${getToken()}`
    //         }
    //     }
    //     try {
    //         const { data } = await axios.get(`http://localhost:4001/api/v1/me`, config)
    //         console.log(data.user)
    //         setUser(data.user)
    //         setLoading(false)
    //     } catch (error) {
    //         console.log(error)
    //         toast.error("invalid user or password", {
    //             position: 'bottom-center'
    //         })
    //     }

    // }

    // useEffect(() => {

    //     getProfile()

    // }, [])
    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title={'Your Profile'} />

                    <div className="profile-drawer-layer" role="dialog" aria-modal="true" aria-labelledby="profile_drawer_title">
                        <button type="button" className="profile-drawer-backdrop" onClick={closeDrawer} aria-label="Close profile panel"></button>
                        <aside className="profile-drawer">
                            <button type="button" className="profile-drawer-close" onClick={closeDrawer} aria-label="Close profile panel">
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                            <h1 className="profile-page-title" id="profile_drawer_title">My Profile</h1>
                            <section className="profile-card">
                            <div className="profile-identity">
                                <figure className="avatar avatar-profile">
                                    <img className="rounded-circle img-fluid" src={user.avatar ? user.avatar.url : null} alt={user.name} />
                                </figure>
                                <h2>{user.name}</h2>
                                <p>{user.email}</p>
                                {user.role === 'admin' && <span className="profile-role">Administrator</span>}
                            </div>

                            <div className="profile-details">
                                <div className="profile-detail">
                                    <span className="profile-detail-label">Full Name</span>
                                    <strong>{user.name}</strong>
                                </div>
                                <div className="profile-detail">
                                    <span className="profile-detail-label">Email Address</span>
                                    <strong>{user.email}</strong>
                                </div>
                                <div className="profile-detail">
                                    <span className="profile-detail-label">Joined On</span>
                                    <strong>{String(user.createdAt).substring(0, 10)}</strong>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <Link to="/me/update" id="edit_profile" className="btn btn-luna">
                                    Edit Profile
                                </Link>
                                {user.role !== 'admin' && (
                                    <Link to="/orders/me" className="btn btn-outline-luna">
                                        My Orders
                                    </Link>
                                )}
                                <Link to="/password/update" className="btn btn-outline-luna">
                                    Change Password
                                </Link>
                            </div>
                            </section>
                        </aside>
                    </div>
                </>
            )}
        </>
    )
}

export default Profile