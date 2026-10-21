import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import MetaData from '../Layout/MetaData'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updateProfile, loadUser, clearErrors } from '../../actions/userActions'

import { UPDATE_PROFILE_RESET } from '../../constants/userConstants'
import { useDispatch, useSelector } from 'react-redux'

// import { getToken } from '../Utils/helpers';


const UpdateProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { error, isUpdated, loading } = useSelector(state => state.user)


    const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onTouched', defaultValues: { name: '', email: '' } })
    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')
    // const [error, setError] = useState('')
    // const [user, setUser] = useState({})
    // const [loading, setLoading] = useState(false)
    // const [isUpdated, setIsUpdated] = useState(false)
    let navigate = useNavigate();

    // const getProfile = async () => {
    //     const config = {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${getToken()}`
    //         }
    //     }
    //     try {
    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, config)
    //         console.log(data)
    //         setUser(data.user)
    //         setName(data.user.name);
    //         setEmail(data.user.email);
    //         setAvatarPreview(data.user.avatar.url)
    //         setLoading(false)
    //     } catch (error) {
    //         console.log(error)
    //         toast.error('user not found', {
    //             position: 'bottom-right'
    //         });
    //     }
    // }

    // const updateProfile = async (userData) => {
    //     const config = {
    //         headers: {
    //             'Content-Type': 'multipart/form-data',
    //             'Authorization': `Bearer ${getToken()}`
    //         }
    //     }
    //     try {
    //         const { data } = await axios.put(`${import.meta.env.VITE_API}/me/update`, userData, config)
    //         setIsUpdated(data.success)
    //         setLoading(false)
    //         toast.success('user updated', {
    //             position: 'bottom-right'
    //         });
    //         getProfile();
    //         navigate('/me', { replace: true })


    //     } catch (error) {
    //         console.log(error)
    //         toast.error('user not found', {
    //             position: 'bottom-right'
    //         });
    //     }
    // }

    // console.log(error)
    // useEffect(() => {
    //     getProfile()

    // }, [])

    useEffect(() => {
        console.log(user)
        if (user) {
            reset({ name: user.name, email: user.email })
            setAvatarPreview(user.avatar.url)
        }
        if (error) {
            // alert.error(error);
            console.log(error)
            dispatch(clearErrors());
        }
        if (isUpdated) {
            // alert.success('User updated successfully')
            dispatch(loadUser());
            navigate('/me', { replace: true })
            dispatch({
                type: UPDATE_PROFILE_RESET
            })
        }
    }, [dispatch, error, isUpdated, navigate, user, reset])

    const submitHandler = ({ name, email }) => {
        const formData = new FormData();
        formData.set('name', name.trim());
        formData.set('email', email.trim());
        formData.set('avatar', avatar);
        dispatch(updateProfile(formData))
    }

    const onChange = e => {
        const file = e.target.files[0]
        if (!file) return
        if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) return toast.error('Avatar must be a JPG, PNG or WEBP image', { position: 'bottom-right' })
        if (file.size > 2 * 1024 * 1024) return toast.error('Avatar must be 2MB or smaller', { position: 'bottom-right' })
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
        }

        reader.readAsDataURL(file)

    }
    // console.log(user)


    return (
        <>
            <MetaData title={'Update Profile'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={handleSubmit(submitHandler)} encType='multipart/form-data' noValidate>
                        <h1 className="mt-2 mb-5">Update Profile</h1>

                        <div className="form-group">
                            <label htmlFor="name_field">Name</label>
                            <input
                                type="text"
                                id="name_field"
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                {...register('name', {
                                    required: 'Name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                    maxLength: { value: 30, message: 'Name cannot exceed 30 characters' },
                                    validate: v => v.trim().length >= 2 || 'Name cannot be just spaces',
                                })}
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                        </div>

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
                                        accept='image/*'
                                        onChange={onChange}
                                    />
                                    <label className='custom-file-label' htmlFor='customFile'>
                                        Choose Avatar
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={loading ? true : false} >Update</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default UpdateProfile