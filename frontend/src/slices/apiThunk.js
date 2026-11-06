import { createAsyncThunk } from '@reduxjs/toolkit'
import { errorMessage } from '../Components/Utils/helpers'

// createAsyncThunk with message errors
export const apiThunk = (type, request) => createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
        return await request(arg)
    } catch (error) {
        return rejectWithValue(errorMessage(error))
    }
})
