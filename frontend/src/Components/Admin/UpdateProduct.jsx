import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import ProductForm from './ProductForm'
import { getProductDetails } from '../../slices/productSlice'
import { updateProduct } from '../../slices/adminProductSlice'

const UpdateProduct = () => {
    const dispatch = useDispatch()
    const { product } = useSelector(state => state.productDetails)
    const { submitting } = useSelector(state => state.adminProducts)
    const { id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(getProductDetails(id)).unwrap()
            .catch(() => { toast.error('Product not found', { position: 'bottom-right' }); navigate('/admin/products') })
    }, [dispatch, id, navigate])

    const update = async (formData) => {
        try {
            await dispatch(updateProduct({ id, formData })).unwrap()
            toast.success('Product updated', { position: 'bottom-right' })
            navigate('/admin/products')
        } catch (message) {
            toast.error(message || 'Could not update product', { position: 'bottom-right' })
        }
    }

    return (
        <>
            <MetaData title="Update Product" />
            <div className="row">
                <div className="col-12 col-md-2"><Sidebar /></div>
                <div className="col-12 col-md-10">
                    <div className="admin-form-page my-5">
                        {product._id === id ? <ProductForm title="Update Product" initial={product} submitLabel="UPDATE PRODUCT" submitting={submitting} onSubmit={update} /> : <Loader />}
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateProduct
