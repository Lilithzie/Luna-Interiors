import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import ProductForm from './ProductForm'

const NewProduct = () => {
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    const create = async (formData) => {
        setSubmitting(true)
        try {
            await axios.post(`${import.meta.env.VITE_API}/admin/product/new`, formData, { withCredentials: true })
            toast.success('Product created', { position: 'bottom-right' })
            navigate('/admin/products')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not create product', { position: 'bottom-right' })
            setSubmitting(false)
        }
    }

    return (
        <>
            <MetaData title="New Product" />
            <div className="row">
                <div className="col-12 col-md-2"><Sidebar /></div>
                <div className="col-12 col-md-10">
                    <div className="wrapper my-5" style={{ maxWidth: 760, margin: '0 auto' }}>
                        <h1 className="mb-4 admin-page-title">New Product</h1>
                        <ProductForm submitLabel="CREATE PRODUCT" submitting={submitting} onSubmit={create} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewProduct
