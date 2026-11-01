import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

// Storefront navigation: categories that actually have products, with a real product photo
export const getCategorySummary = apiThunk('catalog/categories', async () => {
    const { data } = await axios.get(`${API}/products/categories`)
    return data.categories
})

const catalogSlice = createSlice({
    name: 'catalog',
    initialState: { categories: [] },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getCategorySummary.fulfilled, (state, action) => { state.categories = action.payload })
    },
})

export default catalogSlice.reducer
