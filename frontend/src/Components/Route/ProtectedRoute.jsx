import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Loader from '../Layout/Loader'

// Uses the Redux auth state (cookie/JWT session loaded by App via /me)
//   isAdmin      -> admin accounts only (customers are sent to the shop)
//   customerOnly -> customer accounts only (admins are sent to their dashboard)
const ProtectedRoute = ({ children, isAdmin = false, customerOnly = false }) => {
    const { isAuthenticated, user, loading } = useSelector(state => state.auth)

    if (loading) return <Loader />
    if (!isAuthenticated || !user) return <Navigate to='/login' />
    if (isAdmin === true && user.role !== 'admin') return <Navigate to='/' />
    if (customerOnly === true && user.role === 'admin') return <Navigate to='/dashboard' />
    return children
};

export default ProtectedRoute;
