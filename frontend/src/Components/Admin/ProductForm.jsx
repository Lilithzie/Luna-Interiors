import React, { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { CATEGORIES } from '../Utils/helpers'

const MAX_FILES = 10
const MAX_SIZE = 5 * 1024 * 1024

// Shared by NewProduct and UpdateProduct. Supports MULTIPLE photo upload with previews.
const ProductForm = ({ initial, submitLabel, submitting, onSubmit }) => {
    // React Hook Form handles the text fields; photos are managed separately below
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        mode: 'onTouched',
        defaultValues: { name: '', price: '', stock: '', description: '', category: CATEGORIES[0], seller: 'Luna Interiors' },
    })
    const [photoError, setPhotoError] = useState('')
    const [existing, setExisting] = useState([])     // images already saved (can be removed)
    const [files, setFiles] = useState([])           // new File objects

    useEffect(() => {
        if (!initial) return
        reset({
            name: initial.name || '',
            price: initial.price ?? '',
            stock: initial.stock ?? '',
            description: initial.description || '',
            category: initial.category || CATEGORIES[0],
            seller: initial.seller || 'Luna Interiors',
        })
        setExisting(initial.images || [])
    }, [initial, reset])

    const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files])
    useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

    const onPick = (e) => {
        const picked = Array.from(e.target.files || [])
        e.target.value = ''
        const accepted = []
        for (const f of picked) {
            if (!/\.(jpe?g|png|webp)$/i.test(f.name)) { toast.error(`${f.name}: only JPG, PNG or WEBP`, { position: 'bottom-right' }); continue }
            if (f.size > MAX_SIZE) { toast.error(`${f.name} is larger than 5MB`, { position: 'bottom-right' }); continue }
            accepted.push(f)
        }
        const room = MAX_FILES - existing.length - files.length
        if (accepted.length > room) toast.warn(`Maximum of ${MAX_FILES} photos per product`, { position: 'bottom-right' })
        setFiles([...files, ...accepted.slice(0, Math.max(room, 0))])
        if (accepted.length) setPhotoError('')
    }

    const submit = (values) => {
        if (existing.length + files.length === 0) {
            setPhotoError('Please add at least one product photo')
            return toast.error('Please add at least one product photo', { position: 'bottom-right' })
        }
        const fd = new FormData()
        fd.set('name', values.name.trim())
        fd.set('price', values.price)
        fd.set('description', values.description.trim())
        fd.set('category', values.category)
        fd.set('stock', values.stock)
        fd.set('seller', values.seller.trim())
        fd.set('keepImages', JSON.stringify(existing.map(i => i.public_id)))
        files.forEach(f => fd.append('images', f))
        onSubmit(fd)
    }

    return (
        <form className="shadow-lg p-4 bg-white" onSubmit={handleSubmit(submit, () => { if (existing.length + files.length === 0) setPhotoError('Please add at least one product photo') })} noValidate encType="multipart/form-data" style={{ borderRadius: 12 }}>
            <div className="form-group">
                <label htmlFor="name_field">Name</label>
                <input type="text" id="name_field" className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    {...register('name', {
                        required: 'Product name is required',
                        minLength: { value: 3, message: 'Name must be at least 3 characters' },
                        maxLength: { value: 100, message: 'Name cannot exceed 100 characters' },
                        validate: v => v.trim().length >= 3 || 'Name cannot be just spaces',
                    })} />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label htmlFor="price_field">Price (₱)</label>
                    <input type="number" id="price_field" className={`form-control ${errors.price ? 'is-invalid' : ''}`} step="0.01"
                        {...register('price', {
                            required: 'Price is required',
                            validate: v => Number(v) > 0 || 'Price must be greater than 0',
                            max: { value: 9999999, message: 'Price is too high (max ₱9,999,999)' },
                        })} />
                    {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
                </div>
                <div className="form-group col-md-6">
                    <label htmlFor="stock_field">Stock</label>
                    <input type="number" id="stock_field" className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                        {...register('stock', {
                            required: 'Stock is required',
                            validate: v => (Number.isInteger(Number(v)) && Number(v) >= 0) || 'Stock must be a whole number, 0 or more',
                            max: { value: 100000, message: 'Stock is too high (max 100,000)' },
                        })} />
                    {errors.stock && <div className="invalid-feedback">{errors.stock.message}</div>}
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="description_field">Description</label>
                <textarea id="description_field" className={`form-control ${errors.description ? 'is-invalid' : ''}`} rows="6"
                    {...register('description', {
                        required: 'Description is required',
                        minLength: { value: 10, message: 'Description must be at least 10 characters' },
                        maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' },
                        validate: v => v.trim().length >= 10 || 'Description cannot be just spaces',
                    })} />
                {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label htmlFor="category_field">Category</label>
                    <select id="category_field" className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                        {...register('category', { required: 'Please choose a category', validate: v => CATEGORIES.includes(v) || 'Please choose a valid category' })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
                </div>
                <div className="form-group col-md-6">
                    <label htmlFor="seller_field">Seller</label>
                    <input type="text" id="seller_field" className={`form-control ${errors.seller ? 'is-invalid' : ''}`}
                        {...register('seller', {
                            required: 'Seller is required',
                            maxLength: { value: 50, message: 'Seller cannot exceed 50 characters' },
                            validate: v => v.trim().length > 0 || 'Seller cannot be just spaces',
                        })} />
                    {errors.seller && <div className="invalid-feedback">{errors.seller.message}</div>}
                </div>
            </div>

            <div className="form-group">
                <label>Photos <small className="text-muted">({existing.length + files.length}/{MAX_FILES}) — you can select several files at once</small></label>
                <div className="custom-file">
                    <input type="file" name="images" className="custom-file-input" id="customFile" accept=".jpg,.jpeg,.png,.webp" multiple onChange={onPick} />
                    <label className="custom-file-label" htmlFor="customFile">Choose photos</label>
                </div>
                {photoError && <div className="text-danger small mt-2" id="photo_error">{photoError}</div>}
                <div className="thumb-grid" id="photo_previews">
                    {existing.map(img => (
                        <div className="thumb" key={img.public_id}>
                            <img src={img.url} alt="" />
                            <button type="button" aria-label="Remove photo" onClick={() => setExisting(existing.filter(i => i.public_id !== img.public_id))}>×</button>
                        </div>
                    ))}
                    {files.map((f, i) => (
                        <div className="thumb" key={f.name + f.size + i}>
                            <img src={previews[i]} alt="" />
                            <span className="new-tag">NEW</span>
                            <button type="button" aria-label="Remove photo" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>×</button>
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit" id="product_submit" className="btn btn-luna btn-block py-3" disabled={submitting}>
                {submitting ? 'Saving…' : submitLabel}
            </button>
        </form>
    )
}

export default ProductForm
