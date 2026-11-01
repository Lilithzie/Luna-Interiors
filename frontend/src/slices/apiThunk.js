import { createAsyncThunk } from '@reduxjs/toolkit'
import { errorMessage } from '../Components/Utils/helpers'

// createAsyncThunk + one error format: a rejected action's payload is always the message to show the user.
export const apiThunk = (type, request) => createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
        return await request(arg)
    } catch (error) {
        return rejectWithValue(errorMessage(error))
    }
})
