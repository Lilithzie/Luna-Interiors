import  {  useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword, clearPasswordState } from '../../slices/passwordSlice'
import { validatePassword } from '../Utils/validation'
import AuthBrand from '../Layout/AuthBrand'

const NewPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    let navigate = useNavigate();
    const dispatch = useDispatch()
    const { error, success } = useSelector(state => state.forgotPassword)
    const [fieldErrors, setFieldErrors] = useState({})
    const [attempted, setAttempted] = useState(false)

    let { token } = useParams();

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
        if (error || success) dispatch(clearPasswordState())
    }, [dispatch, navigate, error, success])

    const submitHandler = (e) => {
        e.preventDefault();
        setAttempted(true)
        const nextErrors = {}
        const passwordError = validatePassword(password)
        if (passwordError) nextErrors.password = passwordError
        if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
        setFieldErrors(nextErrors)
        if (Object.keys(nextErrors).length) return
        dispatch(resetPassword({ token, passwords: { password, confirmPassword } }))
    }

    return (
        <>
            <MetaData title={'New Password Reset'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} noValidate>
                        <AuthBrand />
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