import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'

import { errMsg, successMsg } from '../Utils/helpers'

import { useDispatch, useSelector } from 'react-redux'
import { getUserDetails, updateUser, clearAdminUserError } from '../../slices/adminUserSlice'

const UpdateUser = () => {
    const [role, setRole] = useState('')
    const dispatch = useDispatch()
    const { user, error } = useSelector(state => state.adminUsers)
    const { user: currentUser } = useSelector(state => state.auth)
    const [fieldErrors, setFieldErrors] = useState({})
    const [attempted, setAttempted] = useState(false)
    let navigate = useNavigate();

    const { id } = useParams();
    const loaded = user._id === id   // name and email are shown only: admins change the role alone
    const isEditingOwnAccount = loaded && currentUser?._id === id

    useEffect(() => {
        dispatch(getUserDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (user._id === id) {
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
        if (!['user', 'admin'].includes(role)) nextErrors.role = 'Please select a valid role.'
        setFieldErrors(nextErrors)
        if (Object.keys(nextErrors).length) return
        try {
            await dispatch(updateUser({ id, userData: { role } })).unwrap()
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
                                        className="form-control"
                                        name='name'
                                        value={loaded ? user.name : ''}
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className="form-control"
                                        name='email'
                                        value={loaded ? user.email : ''}
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role_field">Role</label>
                                    <select
                                        id="role_field"
                                        className={`form-control ${fieldErrors.role ? 'is-invalid' : ''}`}
                                        name='role'
                                        value={role}
                                        disabled={isEditingOwnAccount}
                                        onChange={(e) => { setRole(e.target.value); if (attempted) setFieldErrors(current => ({ ...current, role: '' })) }}
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                    {isEditingOwnAccount && <small className="form-text text-muted">You can't change your own role.</small>}
                                    {fieldErrors.role && <div className="invalid-feedback">{fieldErrors.role}</div>}
                                </div>
                                <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={isEditingOwnAccount}>Update</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateUser