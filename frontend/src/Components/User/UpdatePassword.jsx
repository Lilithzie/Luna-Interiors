import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import axios from 'axios';
// import { getToken } from '../Utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { updatePassword, clearErrors } from '../../actions/userActions'
import { UPDATE_PASSWORD_RESET } from '../../constants/userConstants'
import { validatePassword } from '../Utils/validation'




const UpdatePassword = () => {
    const dispatch = useDispatch()
    const { error, isUpdated, loading } = useSelector(state => state.user)

    const [oldPassword, setOldPassword] = useState('')
    const [password, setPassword] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [attempted, setAttempted] = useState(false)
    // const [error, setError] = useState('')
    // const [isUpdated, setIsUpdated] = useState(false)
    // const [loading, setLoading] = useState(false)
    let navigate = useNavigate();

    // const updatePassword = async (formData) => {
    //     console.log(formData)
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`

    //             }
    //         }

    //         const { data } = await axios.put(`${import.meta.env.VITE_API}/password/update`, formData, config)
    //         setIsUpdated(data.success)
    //         setLoading(false)
    //         toast.success('password updated', {
    //             position: 'bottom-right'
    //         });
    //         navigate('/me')


    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }

    // useEffect(() => {

    //     if (error) {
    //         toast.error(error, {
    //             position: 'bottom-right'
    //         });
    //     }


    // }, [error,])

    useEffect(() => {
        if (error) {
            console.log(error)
            dispatch(clearErrors());
        }
        if (isUpdated) {
            navigate('/me')
            dispatch({
                type: UPDATE_PASSWORD_RESET
            })
        }
    }, [dispatch, error, navigate, isUpdated])



    const submitHandler = (e) => {
        e.preventDefault();
        setAttempted(true)
        const nextErrors = {}
        if (!oldPassword) nextErrors.oldPassword = 'Current password is required.'
        const passwordError = validatePassword(password)
        if (passwordError) nextErrors.password = passwordError
        if (oldPassword && password && oldPassword === password) nextErrors.password = 'New password must be different from the current password.'
        setFieldErrors(nextErrors)
        if (Object.keys(nextErrors).length) return

        const formData = new FormData();
        formData.set('oldPassword', oldPassword);
        formData.set('password', password);

        dispatch(updatePassword(formData))
    }

    return (
        <>
            <MetaData title={'Change Password'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} noValidate>
                        <h1 className="mt-2 mb-5">Update Password</h1>
                        <div className="form-group">
                            <label htmlFor="old_password_field">Old Password</label>
                            <input
                                type="password"
                                id="old_password_field"
                                className={`form-control ${fieldErrors.oldPassword ? 'is-invalid' : ''}`}
                                value={oldPassword}
                                onChange={(e) => { setOldPassword(e.target.value); if (attempted) setFieldErrors(current => ({ ...current, oldPassword: '' })) }}
                            />
                            {fieldErrors.oldPassword && <div className="invalid-feedback">{fieldErrors.oldPassword}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="new_password_field">New Password</label>
                            <input
                                type="password"
                                id="new_password_field"
                                className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); if (attempted) setFieldErrors(current => ({ ...current, password: '' })) }}
                            />
                            {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
                        </div>

                        <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={loading ? true : false} >Update Password</button>
                    </form>
                </div>
            </div>

        </>
    )
}

export default UpdatePassword