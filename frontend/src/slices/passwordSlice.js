import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

export const forgotPassword = apiThunk('forgotPassword/send', async (email) => {
    const { data } = await axios.post(`${API}/password/forgot`, { email })
    return data.message
})

export const resetPassword = apiThunk('forgotPassword/reset', async ({ token, passwords }) => {
    const { data } = await axios.put(`${API}/password/reset/${token}`, passwords)
    return data.success
})

const initialState = { loading: false, message: null, success: false, error: null }

const passwordSlice = createSlice({
    name: 'forgotPassword',
    initialState,
    reducers: {
        clearPasswordState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false
                state.message = action.payload
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false
                state.success = action.payload
            })
            .addMatcher(isAnyOf(forgotPassword.pending, resetPassword.pending), (state) => {
                state.loading = true
                state.error = null
            })
            .addMatcher(isAnyOf(forgotPassword.rejected, resetPassword.rejected), (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearPasswordState } = passwordSlice.actions
export default passwordSlice.reducer
