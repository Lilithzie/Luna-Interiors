import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

export const createOrder = apiThunk('newOrder/create', async (order) => {
    const { data } = await axios.post(`${API}/order/new`, order)
    return data
})

export const myOrders = apiThunk('myOrders/list', async () => {
    const { data } = await axios.get(`${API}/orders/me`)
    return data.orders
})

export const getOrderDetails = apiThunk('orderDetails/load', async (id) => {
    const { data } = await axios.get(`${API}/order/${id}`)
    return data.order
})

export const allOrders = apiThunk('adminOrders/list', async () => {
    const { data } = await axios.get(`${API}/admin/orders`)
    return data
})

// email sent status
export const updateOrder = apiThunk('orderDetails/update', async ({ id, status }) => {
    const { data } = await axios.put(`${API}/admin/order/${id}`, { status })
    return data
})

export const deleteOrder = apiThunk('adminOrders/delete', async (id) => {
    await axios.delete(`${API}/admin/order/${id}`)
    return id
})

const newOrderSlice = createSlice({
    name: 'newOrder',
    initialState: { loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false
                state.order = action.payload
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

const myOrdersSlice = createSlice({
    name: 'myOrders',
    initialState: { orders: [], loading: true, error: null },
    reducers: {
        clearMyOrdersError: (state) => { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addCase(myOrders.pending, (state) => { state.loading = true })
            .addCase(myOrders.fulfilled, (state, action) => {
                state.loading = false
                state.orders = action.payload
            })
            .addCase(myOrders.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

const orderDetailsSlice = createSlice({
    name: 'orderDetails',
    initialState: { order: {}, loading: true, updating: false, error: null },
    reducers: {
        clearOrderDetailsError: (state) => { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getOrderDetails.pending, (state) => {
                state.loading = true
                state.order = {}
            })
            .addCase(getOrderDetails.fulfilled, (state, action) => {
                state.loading = false
                state.order = action.payload
            })
            .addCase(getOrderDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(updateOrder.pending, (state) => { state.updating = true })
            .addCase(updateOrder.fulfilled, (state, action) => {
                state.updating = false
                state.order = action.payload.order          // show the new status + timeline right away
            })
            .addCase(updateOrder.rejected, (state, action) => {
                state.updating = false
                state.error = action.payload
            })
    },
})

const adminOrdersSlice = createSlice({
    name: 'adminOrders',
    initialState: { orders: [], totalAmount: 0, loading: true, error: null },
    reducers: {
        clearAdminOrdersError: (state) => { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addCase(allOrders.pending, (state) => { state.loading = true })
            .addCase(allOrders.fulfilled, (state, action) => {
                state.loading = false
                state.orders = action.payload.orders
                state.totalAmount = action.payload.totalAmount
            })
            .addCase(allOrders.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                const removed = state.orders.find(order => order._id === action.payload)
                state.orders = state.orders.filter(order => order._id !== action.payload)
                if (removed) state.totalAmount -= removed.totalPrice
            })
            .addCase(deleteOrder.rejected, (state, action) => { state.error = action.payload })
    },
})

export const { clearMyOrdersError } = myOrdersSlice.actions
export const { clearOrderDetailsError } = orderDetailsSlice.actions
export const { clearAdminOrdersError } = adminOrdersSlice.actions

export const newOrderReducer = newOrderSlice.reducer
export const myOrdersReducer = myOrdersSlice.reducer
export const orderDetailsReducer = orderDetailsSlice.reducer
export const adminOrdersReducer = adminOrdersSlice.reducer
