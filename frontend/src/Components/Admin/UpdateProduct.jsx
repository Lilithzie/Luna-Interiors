import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import ProductForm from './ProductForm'

const UpdateProduct = () => {
    const [product, setProduct] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const { id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API}/product/${id}`)
            .then(({ data }) => setProduct(data.product))
            .catch(() => { toast.error('Product not found', { position: 'bottom-right' }); navigate('/admin/products') })
    }, [id, navigate])

    const update = async (formData) => {
        setSubmitting(true)
        try {
            await axios.put(`${import.meta.env.VITE_API}/admin/product/${id}`, formData, { withCredentials: true })
            toast.success('Product updated', { position: 'bottom-right' })
            navigate('/admin/products')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not update product', { position: 'bottom-right' })
            setSubmitting(false)
        }
    }

    return (
        <>
            <MetaData title="Update Product" />
            <div className="row">
                <div className="col-12 col-md-2"><Sidebar /></div>
                <div className="col-12 col-md-10">
                    <div className="wrapper my-5" style={{ maxWidth: 760, margin: '0 auto' }}>
                        <h1 className="mb-4 admin-page-title">Update Product</h1>
                        {product ? <ProductForm initial={product} submitLabel="UPDATE PRODUCT" submitting={submitting} onSubmit={update} /> : <Loader />}
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateProduct
