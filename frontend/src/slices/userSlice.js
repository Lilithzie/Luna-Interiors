import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

// own account
export const updateProfile = apiThunk('user/updateProfile', async (userData) => {
    const { data } = await axios.put(`${API}/me/update`, userData)
    return data.user
})

export const updatePassword = apiThunk('user/updatePassword', async (passwords) => {
    const { data } = await axios.put(`${API}/password/update`, passwords)
    return data.success
})

const userSlice = createSlice({
    name: 'user',
    initialState: { loading: false, isUpdated: false, error: null },
    reducers: {
        resetUserUpdate: (state) => { state.isUpdated = false },
        clearUserError: (state) => { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(isAnyOf(updateProfile.pending, updatePassword.pending), (state) => {
                state.loading = true
                state.isUpdated = false
            })
            .addMatcher(isAnyOf(updateProfile.fulfilled, updatePassword.fulfilled), (state) => {
                state.loading = false
                state.isUpdated = true
            })
            .addMatcher(isAnyOf(updateProfile.rejected, updatePassword.rejected), (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { resetUserUpdate, clearUserError } = userSlice.actions
export default userSlice.reducer
