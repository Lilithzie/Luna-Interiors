import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API, NO_IMAGE } from '../Components/Utils/helpers'
import { apiThunk } from './apiThunk'

// store.js writes these two keys back to localStorage whenever the cart changes
const saved = (key, fallback) => {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
}

export const addItemToCart = apiThunk('cart/addItem', async ({ id, quantity }) => {
    const { data } = await axios.get(`${API}/product/${id}`)
    return {
        product: data.product._id,
        name: data.product.name,
        price: data.product.price,
        image: data.product.images && data.product.images.length ? data.product.images[0].url : NO_IMAGE,
        stock: data.product.stock,
        quantity,
    }
})

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        cartItems: saved('cartItems', []),
        shippingInfo: saved('shippingInfo', {}),
        selectedCartItems: saved('selectedCartItems', null),
    },
    reducers: {
        removeItemFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item.product !== action.payload)
            if (Array.isArray(state.selectedCartItems)) {
                state.selectedCartItems = state.selectedCartItems.filter(id => id !== action.payload)
            }
        },
        saveShippingInfo: (state, action) => { state.shippingInfo = action.payload },
        setSelectedCartItems: (state, action) => { state.selectedCartItems = action.payload },
        clearCart: (state) => {
            state.cartItems = []
            state.shippingInfo = {}
            state.selectedCartItems = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addItemToCart.fulfilled, (state, action) => {
            const item = action.payload
            const index = state.cartItems.findIndex(i => i.product === item.product)
            if (index >= 0) state.cartItems[index] = item
            else state.cartItems.push(item)
        })
    },
})

export const { removeItemFromCart, saveShippingInfo, setSelectedCartItems, clearCart } = cartSlice.actions
export default cartSlice.reducer
