import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'

import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import axios from 'axios';
// import { getUser, authenticate } from '../Utils/helpers';
import { useDispatch, useSelector } from 'react-redux'
import { login, loginWithGoogle, clearErrors } from '../../actions/userActions'
import { signInWithGoogle } from '../../config/firebase'

const Login = () => {
    const { isAuthenticated, error, loading, user } = useSelector(state => state.auth)
    // React Hook Form: validation rules live next to each field (see register(...) below)
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onTouched', defaultValues: { email: '', password: '' } })
    // const [loading, setLoading] = useState(false)
    let navigate = useNavigate()
    let location = useLocation()
    const dispatch = useDispatch()

    const submitHandler = ({ email, password }) => {
        dispatch(login(email.trim(), password))
    }

    const googleLoginHandler = async () => {
        try {
            const result = await signInWithGoogle()
            dispatch(loginWithGoogle(await result.user.getIdToken()))
        } catch (googleError) {
            toast.error(googleError.message, { position: 'bottom-right' })
        }
    }

    // const login = async (email, password) => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         }
    //         const { data } = await axios.post(`http://localhost:4001/api/v1/login`, { email, password }, config)
    //         console.log(data)
    //         authenticate(data, () => navigate("/"))

    //     } catch (error) {

    //         toast.error("invalid user or password", {
    //             position: 'bottom-right'
    //         })
    //     }
    // }

    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : ''
    console.log(redirect)
    // useEffect(() => {
    //     if (getUser()) {
    //         navigate('/')
    //     }
    // }, [])

    // useEffect(() => {
    //     if (getUser() && redirect === 'shipping') {
    //         navigate(`/${redirect}`)
    //     }
    // }, [])

    useEffect(() => {
        if (isAuthenticated && user && user.role === 'admin') {
            navigate('/dashboard')        // admins go straight to their own area
        }
        else if (isAuthenticated && redirect === 'shipping') {
            navigate(`/${redirect}`)
        }
        else if (isAuthenticated)
            navigate('/')
        if (error) {
            // alert.error(error);
            console.log(error)
            dispatch(clearErrors());
        }
    }, [error, isAuthenticated, user, dispatch, navigate, redirect])

    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title={'Login'} />

                    <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            <form className="shadow-lg"
                                onSubmit={handleSubmit(submitHandler)}
                                noValidate
                            >
                                <h1 className="mb-3">Login</h1>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                                        })}
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password_field">Password</label>
                                    <input
                                        type="password"
                                        id="password_field"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                        })}
                                    />
                                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                                </div>

                                <div className="auth-forgot">
                                    <Link to="/password/forgot">Forgot Password?</Link>
                                </div>

                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                >
                                    LOGIN
                                </button>

                                <button type="button" className="btn btn-block py-3 mt-2 google-login-btn" onClick={googleLoginHandler}>
                                    <span className="google-mark" aria-hidden="true">G</span> Continue with Google
                                </button>

                                <div className="auth-register">
                                    <Link to="/register">New User?</Link>
                                </div>
                            </form>
                        </div>
                    </div>


                </>
            )}
        </>
    )
}
export default Login
