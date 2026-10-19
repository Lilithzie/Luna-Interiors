import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import { CATEGORIES } from '../Utils/helpers'

const MAX_FILES = 10
const MAX_SIZE = 5 * 1024 * 1024

// Shared by NewProduct and UpdateProduct. Supports MULTIPLE photo upload with previews.
const ProductForm = ({ initial, submitLabel, submitting, onSubmit }) => {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState(CATEGORIES[0])
    const [stock, setStock] = useState('')
    const [seller, setSeller] = useState('Luna Interiors')
    const [existing, setExisting] = useState([])     // images already saved (can be removed)
    const [files, setFiles] = useState([])           // new File objects

    useEffect(() => {
        if (!initial) return
        setName(initial.name || '')
        setPrice(initial.price ?? '')
        setDescription(initial.description || '')
        setCategory(initial.category || CATEGORIES[0])
        setStock(initial.stock ?? '')
        setSeller(initial.seller || 'Luna Interiors')
        setExisting(initial.images || [])
    }, [initial])

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
    }

    const submit = (e) => {
        e.preventDefault()
        if (existing.length + files.length === 0) {
            return toast.error('Please add at least one product photo', { position: 'bottom-right' })
        }
        const fd = new FormData()
        fd.set('name', name)
        fd.set('price', price)
        fd.set('description', description)
        fd.set('category', category)
        fd.set('stock', stock)
        fd.set('seller', seller)
        fd.set('keepImages', JSON.stringify(existing.map(i => i.public_id)))
        files.forEach(f => fd.append('images', f))
        onSubmit(fd)
    }

    return (
        <form className="shadow-lg p-4 bg-white" onSubmit={submit} encType="multipart/form-data" style={{ borderRadius: 12 }}>
            <div className="form-group">
                <label htmlFor="name_field">Name</label>
                <input type="text" id="name_field" className="form-control" value={name} maxLength={100} required onChange={e => setName(e.target.value)} />
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label htmlFor="price_field">Price (₱)</label>
                    <input type="number" id="price_field" className="form-control" min="0" step="0.01" value={price} required onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="form-group col-md-6">
                    <label htmlFor="stock_field">Stock</label>
                    <input type="number" id="stock_field" className="form-control" min="0" value={stock} required onChange={e => setStock(e.target.value)} />
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="description_field">Description</label>
                <textarea id="description_field" className="form-control" rows="6" value={description} required onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="row">
                <div className="form-group col-md-6">
                    <label htmlFor="category_field">Category</label>
                    <select id="category_field" className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="form-group col-md-6">
                    <label htmlFor="seller_field">Seller</label>
                    <input type="text" id="seller_field" className="form-control" value={seller} onChange={e => setSeller(e.target.value)} />
                </div>
            </div>

            <div className="form-group">
                <label>Photos <small className="text-muted">({existing.length + files.length}/{MAX_FILES}) — you can select several files at once</small></label>
                <div className="custom-file">
                    <input type="file" name="images" className="custom-file-input" id="customFile" accept=".jpg,.jpeg,.png,.webp" multiple onChange={onPick} />
                    <label className="custom-file-label" htmlFor="customFile">Choose photos</label>
                </div>
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
