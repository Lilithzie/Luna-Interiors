import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Loader from '../Layout/Loader'

// uses the Redux auth state
// isAdmin: admins only
// customerOnly: customers only
const ProtectedRoute = ({ children, isAdmin = false, customerOnly = false }) => {
    const { isAuthenticated, user, loading } = useSelector(state => state.auth)

    if (loading) return <Loader />
    if (!isAuthenticated || !user) return <Navigate to='/login' />
    if (isAdmin === true && user.role !== 'admin') return <Navigate to='/' />
    if (customerOnly === true && user.role === 'admin') return <Navigate to='/dashboard' />
    return children
};

export default ProtectedRoute;
