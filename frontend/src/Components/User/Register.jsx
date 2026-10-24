import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
// import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearErrors } from '../../actions/userActions'
import { isValidEmail, validatePassword } from '../Utils/validation'


const Register = () => {
    const dispatch = useDispatch()
    const { isAuthenticated, error, loading } = useSelector(state => state.auth);
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    })

    // const [user, setUser] = useState({
    //     name: '',
    //     email: '',
    //     password: '',
    // })

    const { name, email, password } = user;

    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')
    const [errors, setErrors] = useState({})
    const [attempted, setAttempted] = useState(false)

    // const [error, setError] = useState('')
    // const [loading, setLoading] = useState(true)


    let navigate = useNavigate()
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }

        if (error) {
            console.log(error)
            dispatch(clearErrors());

        }

    }, [error, navigate, isAuthenticated])

    const submitHandler = (e) => {
        e.preventDefault();
        setAttempted(true)
        const nextErrors = {}
        if (name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters.'
        if (!isValidEmail(email)) nextErrors.email = 'Please enter a valid email address.'
        const passwordError = validatePassword(password)
        if (passwordError) nextErrors.password = passwordError
        if (!avatar) nextErrors.avatar = 'Please choose an avatar image.'
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length) return

        const formData = new FormData();
        formData.set('name', name.trim());
        formData.set('email', email.trim());
        formData.set('password', password);
        formData.set('avatar', avatar);

        dispatch(register(formData))
    }

    const onChange = e => {
        if (e.target.name === 'avatar') {
            const file = e.target.files[0]
            if (!file) return
            if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) {
                setErrors(current => ({ ...current, avatar: 'Avatar must be a JPG, PNG, or WEBP image.' }))
                return
            }
            if (file.size > 2 * 1024 * 1024) {
                setErrors(current => ({ ...current, avatar: 'Avatar must be 2MB or smaller.' }))
                return
            }

            const reader = new FileReader();

            reader.onload = () => {
                if (reader.readyState === 2) {
                    setAvatarPreview(reader.result)
                    setAvatar(reader.result)
                    setErrors(current => ({ ...current, avatar: '' }))
                }
            }

            reader.readAsDataURL(e.target.files[0])

        } else {
            const { name: field, value } = e.target
            setUser({ ...user, [field]: value })
            if (attempted) setErrors(current => ({ ...current, [field]: '' }))
        }
    }

    // const register = async (userData) => {
    //     console.log(userData)
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data'
    //             }
    //         }

    //         const { data } = await axios.post(`http://localhost:4001/api/v1/register`, userData, config)
    //         console.log(data.user)

    //         setLoading(false)
    //         setUser(data.user)
    //         navigate('/')

    //     } catch (error) {
    //         setLoading(false)
    //         setUser(null)
    //         setError(error.response.data.message)
    //         console.log(error.response.data.message)
    //     }
    // }




    return (
        <>

            <MetaData title={'Register User'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data' noValidate>
                        <h1 className="mb-3">Register</h1>

                        <div className="form-group">
                            <label htmlFor="email_field">Name</label>
                            <input
                                type="name"
                                id="name_field"
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                name='name'
                                value={name}
                                onChange={onChange}
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                name='email'
                                value={email}
                                onChange={onChange}
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_field">Password</label>
                            <input
                                type="password"
                                id="password_field"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                name='password'
                                value={password}
                                onChange={onChange}
                            />
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>

                        <div className='form-group'>
                            <label htmlFor='avatar_upload'>Avatar</label>
                            <div className='d-flex align-items-center'>
                                <div>
                                    <figure className='avatar mr-3 item-rtl'>
                                        <img
                                            src={avatarPreview}
                                            className='rounded-circle'
                                            alt='Avatar Preview'
                                        />
                                    </figure>
                                </div>
                                <div className='custom-file'>
                                    <input
                                        type='file'
                                        name='avatar'
                                        className='custom-file-input'
                                        id='customFile'
                                        accept="images/*"
                                        onChange={onChange}
                                    />
                                    <label className='custom-file-label' htmlFor='customFile'>
                                        Choose Avatar
                                    </label>
                                </div>
                            </div>
                            {errors.avatar && <div className="text-danger small mt-2">{errors.avatar}</div>}
                        </div>

                        <button
                            id="register_button"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading}
                        >
                            REGISTER
                        </button>
                    </form>
                </div>
            </div>

        </>
    )
}

export default Register