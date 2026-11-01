import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

export const allUsers = apiThunk('adminUsers/list', async () => {
    const { data } = await axios.get(`${API}/admin/users`)
    return data.users
})

export const getUserDetails = apiThunk('adminUsers/details', async (id) => {
    const { data } = await axios.get(`${API}/admin/user/${id}`)
    return data.user
})

export const updateUser = apiThunk('adminUsers/update', async ({ id, userData }) => {
    const { data } = await axios.put(`${API}/admin/user/${id}`, userData)
    return data.success
})

export const deleteUser = apiThunk('adminUsers/delete', async (id) => {
    await axios.delete(`${API}/admin/user/${id}`)
    return id
})

const adminUserSlice = createSlice({
    name: 'adminUsers',
    initialState: { users: [], user: {}, loading: true, error: null },
    reducers: {
        clearAdminUserError: (state) => { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addCase(allUsers.pending, (state) => { state.loading = true })
            .addCase(allUsers.fulfilled, (state, action) => {
                state.loading = false
                state.users = action.payload
            })
            .addCase(allUsers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(getUserDetails.pending, (state) => { state.user = {} })
            .addCase(getUserDetails.fulfilled, (state, action) => { state.user = action.payload })
            .addCase(getUserDetails.rejected, (state, action) => { state.error = action.payload })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user._id !== action.payload)
            })
            .addCase(deleteUser.rejected, (state, action) => { state.error = action.payload })
    },
})

export const { clearAdminUserError } = adminUserSlice.actions
export default adminUserSlice.reducer
