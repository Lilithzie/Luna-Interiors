import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

// MP2 - filters: { keyword, page, price:[min,max], category, ratings, reviews, sort, append }
export const getProducts = apiThunk('products/list', async ({ page = 1, keyword = '', price, category = '', ratings = 0, reviews = 0, sort = 'newest' } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    if (keyword) params.set('keyword', keyword)
    if (price) {
        params.set('price[gte]', price[0])
        params.set('price[lte]', price[1])
    }
    if (category) params.set('category', category)
    if (ratings) params.set('ratings[gte]', ratings)
    if (reviews) params.set('numOfReviews[gte]', reviews)
    if (sort) params.set('sort', sort)

    const { data } = await axios.get(`${API}/products?${params.toString()}`)
    return data
})

export const getProductDetails = apiThunk('productDetails/load', async (id) => {
    const { data } = await axios.get(`${API}/product/${id}`)
    return data.product
})

const productsSlice = createSlice({
    name: 'products',
    initialState: { products: [], loading: true, error: null, latestRequest: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getProducts.pending, (state, action) => {
                state.loading = true
                state.error = null
                state.latestRequest = action.meta.requestId
                if (!action.meta.arg?.append) state.products = []
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                // infinite scroll: only the newest request may update the list. If the shopper changes a
                // filter / search while an older page is still loading, that older response is ignored.
                if (action.meta.requestId !== state.latestRequest) return
                const { products, productsCount, resPerPage, filteredProductsCount, categories } = action.payload
                state.loading = false
                // add the next page, skipping anything already shown (the list can shift while scrolling)
                state.products = action.meta.arg?.append
                    ? [...state.products, ...products.filter(p => !state.products.some(old => old._id === p._id))]
                    : products
                Object.assign(state, { productsCount, resPerPage, filteredProductsCount, categories })
            })
            .addCase(getProducts.rejected, (state, action) => {
                if (action.meta.requestId !== state.latestRequest) return
                state.loading = false
                state.error = action.payload
            })
    },
})

const productDetailsSlice = createSlice({
    name: 'productDetails',
    initialState: { product: {}, loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getProductDetails.pending, (state, action) => {
                state.loading = true
                state.error = null
                if (state.product._id !== action.meta.arg) state.product = {}    // never show the previous product
            })
            .addCase(getProductDetails.fulfilled, (state, action) => {
                state.loading = false
                state.product = action.payload
            })
            .addCase(getProductDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const productsReducer = productsSlice.reducer
export const productDetailsReducer = productDetailsSlice.reducer
