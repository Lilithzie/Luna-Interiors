import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

// Only ids are saved (store.js keeps them in localStorage, like the cart); the wishlist page
// loads live product data, so prices and stock are never stale.
const savedIds = () => {
    const value = localStorage.getItem('wishlist')
    return value ? JSON.parse(value) : []
}

export const getWishlistProducts = apiThunk('wishlist/load', async (ids) => {
    const results = await Promise.allSettled(ids.map(id => axios.get(`${API}/product/${id}`)))
    return results.filter(result => result.status === 'fulfilled').map(result => result.value.data.product)
})

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: { ids: savedIds(), products: [], loading: false, error: null },
    reducers: {
        toggleWishlist: (state, action) => {
            const id = action.payload
            if (state.ids.includes(id)) {
                state.ids = state.ids.filter(saved => saved !== id)
                state.products = state.products.filter(product => product._id !== id)
            } else {
                state.ids.push(id)
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getWishlistProducts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getWishlistProducts.fulfilled, (state, action) => {
                state.loading = false
                state.products = action.payload
            })
            .addCase(getWishlistProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { toggleWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
