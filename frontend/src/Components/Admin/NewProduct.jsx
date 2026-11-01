import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'

import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import ProductForm from './ProductForm'
import { createProduct } from '../../slices/adminProductSlice'

const NewProduct = () => {
    const dispatch = useDispatch()
    const { submitting } = useSelector(state => state.adminProducts)
    const navigate = useNavigate()

    const create = async (formData) => {
        try {
            await dispatch(createProduct(formData)).unwrap()
            toast.success('Product created', { position: 'bottom-right' })
            navigate('/admin/products')
        } catch (message) {
            toast.error(message || 'Could not create product', { position: 'bottom-right' })
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
