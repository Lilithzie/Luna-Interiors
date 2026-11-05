import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

// Quiz 1 - admin dashboard charts
export const getSalesChart = apiThunk('sales/range', async ({ startDate, endDate }) => {
    const { data } = await axios.get(`${API}/admin/sales-chart`, { params: { startDate, endDate } })
    return data.sales
})

export const getMonthlySales = apiThunk('sales/monthly', async () => {
    const { data } = await axios.get(`${API}/admin/sales-per-month`)
    return data.salesPerMonth
})

export const getYearlySales = apiThunk('sales/yearly', async () => {
    const { data } = await axios.get(`${API}/admin/sales-per-year`)
    return data.salesPerYear
})

export const getProductSales = apiThunk('sales/byProduct', async () => {
    const { data } = await axios.get(`${API}/admin/product-sales`)
    return data.totalPercentage
})

export const getCustomerSales = apiThunk('sales/byCustomer', async () => {
    const { data } = await axios.get(`${API}/admin/customer-sales`)
    return data.customerSales
})

const salesSlice = createSlice({
    name: 'sales',
    initialState: { range: [], rangeLoading: false, rangeError: '', latestRangeRequest: null, monthly: [], yearly: [], byProduct: [], byCustomer: [] },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getSalesChart.pending, (state, action) => {
                state.rangeLoading = true
                state.rangeError = ''
                state.latestRangeRequest = action.meta.requestId
            })
            .addCase(getSalesChart.fulfilled, (state, action) => {
                if (action.meta.requestId !== state.latestRangeRequest) return    // a newer date range replaced this one
                state.rangeLoading = false
                state.range = action.payload
            })
            .addCase(getSalesChart.rejected, (state, action) => {
                if (action.meta.requestId !== state.latestRangeRequest) return
                state.rangeLoading = false
                state.rangeError = action.payload
            })
            .addCase(getMonthlySales.fulfilled, (state, action) => { state.monthly = action.payload })
            .addCase(getYearlySales.fulfilled, (state, action) => { state.yearly = action.payload })
            .addCase(getProductSales.fulfilled, (state, action) => { state.byProduct = action.payload })
            .addCase(getCustomerSales.fulfilled, (state, action) => { state.byCustomer = action.payload })
    },
})

export default salesSlice.reducer
