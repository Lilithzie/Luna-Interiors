import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'
import { updateProfile } from './userSlice'

export const register = apiThunk('auth/register', async (userData) => {
    const { data } = await axios.post(`${API}/register`, userData)
    return data.user
})

export const login = apiThunk('auth/login', async ({ email, password }) => {
    const { data } = await axios.post(`${API}/login`, { email, password })
    return data.user
})

export const loginWithGoogle = apiThunk('auth/loginWithGoogle', async (idToken) => {
    const { data } = await axios.post(`${API}/auth/google`, { idToken })
    return data.user
})

export const loadUser = apiThunk('auth/loadUser', async () => {
    const { data } = await axios.get(`${API}/me`)
    return data.user
})

export const logout = apiThunk('auth/logout', async () => {
    await axios.get(`${API}/logout`)
})

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, isAuthenticated: false, loading: false, error: null },
    reducers: {
        clearAuthError: (state) => { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadUser.rejected, (state) => {     // no session yet: normal, nothing to report
                state.loading = false
                state.isAuthenticated = false
                state.user = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false
                state.isAuthenticated = false
                state.user = null
            })
            .addCase(logout.rejected, (state, action) => { state.error = action.payload })
            .addCase(updateProfile.fulfilled, (state, action) => { state.user = action.payload })
            .addMatcher(isAnyOf(register.pending, login.pending, loginWithGoogle.pending, loadUser.pending), (state) => {
                state.loading = true
                state.isAuthenticated = false
            })
            .addMatcher(isAnyOf(register.fulfilled, login.fulfilled, loginWithGoogle.fulfilled, loadUser.fulfilled), (state, action) => {
                state.loading = false
                state.isAuthenticated = true
                state.user = action.payload
            })
            .addMatcher(isAnyOf(register.rejected, login.rejected, loginWithGoogle.rejected), (state, action) => {
                state.loading = false
                state.isAuthenticated = false
                state.user = null
                state.error = action.payload
            })
    },
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer
