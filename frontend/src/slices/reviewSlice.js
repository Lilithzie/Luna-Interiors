import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

// MP3 - reviews & ratings
export const getReviewEligibility = apiThunk('reviews/eligibility', async (productId) => {
    const { data } = await axios.get(`${API}/review/eligibility`, { params: { productId } })
    return { canReview: data.canReview, myReview: data.review }
})

export const saveReview = apiThunk('reviews/save', async ({ rating, comment, productId }) => {
    const { data } = await axios.put(`${API}/review`, { rating, comment, productId })
    return { updated: data.updated, masked: data.masked }
})

export const getAllReviews = apiThunk('reviews/list', async () => {
    const { data } = await axios.get(`${API}/admin/reviews`)
    return data.reviews
})

export const deleteReview = apiThunk('reviews/delete', async ({ productId, id }) => {
    await axios.delete(`${API}/reviews`, { params: { productId, id } })
    return id
})

const reviewSlice = createSlice({
    name: 'reviews',
    initialState: { canReview: false, myReview: null, saving: false, reviews: [], loading: true, error: null },
    reducers: {
        resetReviewEligibility: (state) => {
            state.canReview = false
            state.myReview = null
        },
        clearReviewError: (state) => { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getReviewEligibility.fulfilled, (state, action) => {
                state.canReview = action.payload.canReview
                state.myReview = action.payload.myReview
            })
            .addCase(getReviewEligibility.rejected, (state) => {
                state.canReview = false
                state.myReview = null
            })
            .addCase(saveReview.pending, (state) => { state.saving = true })
            .addCase(saveReview.fulfilled, (state) => { state.saving = false })
            .addCase(saveReview.rejected, (state) => { state.saving = false })
            .addCase(getAllReviews.pending, (state) => { state.loading = true })
            .addCase(getAllReviews.fulfilled, (state, action) => {
                state.loading = false
                state.reviews = action.payload
            })
            .addCase(getAllReviews.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.reviews = state.reviews.filter(review => review._id !== action.payload)
            })
    },
})

export const { resetReviewEligibility, clearReviewError } = reviewSlice.actions
export default reviewSlice.reducer
