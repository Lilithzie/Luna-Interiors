import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import MetaData from '../Layout/MetaData'
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updateProfile, resetUserUpdate, clearUserError } from '../../slices/userSlice'

import { useDispatch, useSelector } from 'react-redux'

const UpdateProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { error, isUpdated, loading } = useSelector(state => state.user)

    const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onTouched', defaultValues: { name: '', email: '' } })
    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.svg')
    let navigate = useNavigate();
    const location = useLocation()
    // side drawer
    const closeDrawer = useCallback(() => {
        if (location.state?.backgroundLocation) navigate(-1)
        else navigate('/me', { replace: true })
    }, [location, navigate])

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') closeDrawer()
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [closeDrawer])

    useEffect(() => {
        if (user) {
            reset({ name: user.name, email: user.email })
            setAvatarPreview(user.avatar.url)
        }
    }, [user, reset])

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearUserError());
        }
        if (isUpdated) {
            toast.success('Profile updated', { position: 'bottom-right' })
            closeDrawer()
            dispatch(resetUserUpdate())
        }
    }, [dispatch, error, isUpdated, closeDrawer])

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

    return (
        <>
            <MetaData title={'Update Profile'} />

            <div className="profile-drawer-layer" role="dialog" aria-modal="true" aria-labelledby="update_profile_drawer_title">
                <button type="button" className="profile-drawer-backdrop" onClick={closeDrawer} aria-label="Close edit profile panel"></button>
                <aside className="profile-drawer update-profile-drawer">
                    <button type="button" className="profile-drawer-close" onClick={closeDrawer} aria-label="Close edit profile panel">
                        <i className="fa fa-times" aria-hidden="true"></i>
                    </button>
                    <h1 className="profile-page-title" id="update_profile_drawer_title">Edit Profile</h1>
                    <form className="profile-card" onSubmit={handleSubmit(submitHandler)} encType='multipart/form-data' noValidate>

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
                </aside>
            </div>
        </>
    )
}

export default UpdateProfile