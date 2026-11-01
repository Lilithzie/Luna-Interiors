import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

import MetaData from '../Layout/MetaData'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword, clearPasswordState } from '../../slices/passwordSlice';
import { isValidEmail } from '../Utils/validation'
import AuthBrand from '../Layout/AuthBrand'



const ForgotPassword = () => {
    const dispatch = useDispatch();
    const { loading, message, error } = useSelector(state => state.forgotPassword)


    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [attempted, setAttempted] = useState(false)
    // const [loading, setLoading] = useState('')


    // const forgotPassword = async (formData) => {
    //     const config = {
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     }
    //     try {
    //         const { data } = await axios.post(`http://localhost:4001/api/v1/password/forgot`, formData, config)
    //         console.log(data.message)

    //         setLoading(false)
    //         toast.success(data.message, {
    //             position: 'bottom-center'
    //         });
    //         navigate('/login')
    //     } catch (error) {
    //         toast.error(error.response.data.message, {
    //             position: 'top-right'
    //         });
    //     }
    // }


    useEffect(() => {
        if (message) toast.success(message, { position: 'bottom-right' })
        if (error) toast.error(error, { position: 'bottom-right' })
        if (message || error) dispatch(clearPasswordState())
    }, [dispatch, message, error])

    const submitHandler = (e) => {
        e.preventDefault();
        setAttempted(true)
        if (!isValidEmail(email)) {
            setEmailError('Please enter a valid email address.')
            return
        }
        setEmailError('')
        dispatch(forgotPassword(email.trim()))
    }

    return (
        <>
            <MetaData title={'Forgot Password'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} noValidate>
                        <AuthBrand />
                        <h1 className="mb-3">Forgot Password</h1>
                        <div className="form-group">
                            <label htmlFor="email_field">Enter Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className={`form-control ${emailError ? 'is-invalid' : ''}`}
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if (attempted) setEmailError('') }}
                            />
                            {emailError && <div className="invalid-feedback">{emailError}</div>}
                        </div>

                        <button
                            id="forgot_password_button"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading ? true : false} >
                            Send Email
                        </button>

                    </form>
                </div>
            </div>

        </>
    )
}

export default ForgotPassword