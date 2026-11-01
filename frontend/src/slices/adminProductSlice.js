import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

// MP1 - product CRUD, multiple photos (multipart FormData) and bulk delete
export const getAdminProducts = apiThunk('adminProducts/list', async () => {
    const { data } = await axios.get(`${API}/admin/products`)
    return data.products
})

export const createProduct = apiThunk('adminProducts/create', async (formData) => {
    const { data } = await axios.post(`${API}/admin/product/new`, formData)
    return data.product
})

export const updateProduct = apiThunk('adminProducts/update', async ({ id, formData }) => {
    const { data } = await axios.put(`${API}/admin/product/${id}`, formData)
    return data.product
})

export const deleteProduct = apiThunk('adminProducts/delete', async (id) => {
    await axios.delete(`${API}/admin/product/${id}`)
    return id
})

export const bulkDeleteProducts = apiThunk('adminProducts/bulkDelete', async (ids) => {
    const { data } = await axios.delete(`${API}/admin/products`, { data: { ids } })
    return { ids, deletedCount: data.deletedCount }
})

const adminProductSlice = createSlice({
    name: 'adminProducts',
    initialState: { products: [], loading: true, submitting: false, error: null },
    reducers: {
        clearAdminProductError: (state) => { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAdminProducts.pending, (state) => { state.loading = true })
            .addCase(getAdminProducts.fulfilled, (state, action) => {
                state.loading = false
                state.products = action.payload
            })
            .addCase(getAdminProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(product => product._id !== action.payload)
            })
            .addCase(bulkDeleteProducts.fulfilled, (state, action) => {
                state.products = state.products.filter(product => !action.payload.ids.includes(product._id))
            })
            .addMatcher(isAnyOf(createProduct.pending, updateProduct.pending), (state) => { state.submitting = true })
            .addMatcher(isAnyOf(createProduct.fulfilled, updateProduct.fulfilled, createProduct.rejected, updateProduct.rejected), (state) => {
                state.submitting = false
            })
    },
})

export const { clearAdminProductError } = adminProductSlice.actions
export default adminProductSlice.reducer
