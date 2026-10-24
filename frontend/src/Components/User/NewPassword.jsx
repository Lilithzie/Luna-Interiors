import  {  useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { validatePassword } from '../Utils/validation'

const NewPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    let navigate = useNavigate();
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [fieldErrors, setFieldErrors] = useState({})
    const [attempted, setAttempted] = useState(false)

    let { token } = useParams();
    console.log(token)

    const resetPassword = async (token, passwords) => {
        console.log(passwords)
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const { data } = await axios.put(`http://localhost:4001/api/v1/password/reset/${token}`, passwords, config)
            
            setSuccess(data.success)
        } catch (error) {
            console.log(error)
            setError(error)
        }
    }
    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
        }
        if (success) {
            toast.success('password updated', {
                position: 'bottom-right'
            });
            navigate('/login')
        }

    }, [error, success,])

    const submitHandler = (e) => {
        e.preventDefault();
        setAttempted(true)
        const nextErrors = {}
        const passwordError = validatePassword(password)
        if (passwordError) nextErrors.password = passwordError
        if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
        setFieldErrors(nextErrors)
        if (Object.keys(nextErrors).length) return
        const formData = new FormData();
        formData.set('password', password);
        formData.set('confirmPassword', confirmPassword);
        resetPassword(token, formData)
    }

    return (
        <>
            <MetaData title={'New Password Reset'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} noValidate>
                        <h1 className="mb-3">New Password</h1>

                        <div className="form-group">
                            <label htmlFor="password_field">Password</label>
                            <input
                                type="password"
                                id="password_field"
                                className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); if (attempted) setFieldErrors(current => ({ ...current, password: '' })) }}
                            />
                            {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm_password_field">Confirm Password</label>
                            <input
                                type="password"
                                id="confirm_password_field"
                                className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); if (attempted) setFieldErrors(current => ({ ...current, confirmPassword: '' })) }}
                            />
                            {fieldErrors.confirmPassword && <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>}
                        </div>

                        <button
                            id="new_password_button"
                            type="submit"
                            className="btn btn-block py-3">
                            Set Password
                        </button>

                    </form>
                </div>
            </div>

        </>
    )
}

export default NewPassword