import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'

import { errMsg, successMsg } from '../Utils/helpers'

import { useDispatch, useSelector } from 'react-redux'
import { getUserDetails, updateUser, clearAdminUserError } from '../../slices/adminUserSlice'
import { isValidEmail } from '../Utils/validation'

const UpdateUser = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const dispatch = useDispatch()
    const { user, error } = useSelector(state => state.adminUsers)
    const [fieldErrors, setFieldErrors] = useState({})
    const [attempted, setAttempted] = useState(false)
    let navigate = useNavigate();

    const { id } = useParams();

    useEffect(() => {
        dispatch(getUserDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (user._id === id) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role)
        }
    }, [id, user])

    useEffect(() => {
        if (error) {
            errMsg(error);
            dispatch(clearAdminUserError())
        }
    }, [dispatch, error])

    const submitHandler = async (e) => {
        e.preventDefault();
        setAttempted(true)
        const nextErrors = {}
        if (name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters.'
        if (!isValidEmail(email)) nextErrors.email = 'Please enter a valid email address.'
        if (!['user', 'admin'].includes(role)) nextErrors.role = 'Please select a valid role.'
        setFieldErrors(nextErrors)
        if (Object.keys(nextErrors).length) return
        try {
            await dispatch(updateUser({ id, userData: { name: name.trim(), email: email.trim(), role } })).unwrap()
            successMsg('User updated successfully')
            navigate('/admin/users')
        } catch (message) {
            errMsg(message)
        }
    }

    return (
        <>
            <MetaData title={`Update User`} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            <form className="shadow-lg" onSubmit={submitHandler} noValidate>
                                <h1 className="mt-2 mb-5">Update User</h1>
                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <input
                                        type="name"
                                        id="name_field"
                                        className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                                        name='name'
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); if (attempted) setFieldErrors(current => ({ ...current, name: '' })) }}
                                    />
                                    {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                                        name='email'
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (attempted) setFieldErrors(current => ({ ...current, email: '' })) }}
                                    />
                                    {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role_field">Role</label>
                                    <select
                                        id="role_field"
                                        className={`form-control ${fieldErrors.role ? 'is-invalid' : ''}`}
                                        name='role'
                                        value={role}
                                        onChange={(e) => { setRole(e.target.value); if (attempted) setFieldErrors(current => ({ ...current, role: '' })) }}
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                    {fieldErrors.role && <div className="invalid-feedback">{fieldErrors.role}</div>}
                                </div>
                                <button type="submit" className="btn update-btn btn-block mt-4 mb-3" >Update</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateUser