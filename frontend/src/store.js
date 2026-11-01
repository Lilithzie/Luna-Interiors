import { configureStore } from '@reduxjs/toolkit'

import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import passwordReducer from './slices/passwordSlice'
import adminUsersReducer from './slices/adminUserSlice'
import { productsReducer, productDetailsReducer } from './slices/productSlice'
import adminProductsReducer from './slices/adminProductSlice'
import reviewsReducer from './slices/reviewSlice'
import cartReducer from './slices/cartSlice'
import { newOrderReducer, myOrdersReducer, orderDetailsReducer, adminOrdersReducer } from './slices/orderSlice'
import salesReducer from './slices/salesSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        forgotPassword: passwordReducer,
        adminUsers: adminUsersReducer,
        products: productsReducer,
        productDetails: productDetailsReducer,
        adminProducts: adminProductsReducer,
        reviews: reviewsReducer,
        cart: cartReducer,
        newOrder: newOrderReducer,
        myOrders: myOrdersReducer,
        orderDetails: orderDetailsReducer,
        adminOrders: adminOrdersReducer,
        sales: salesReducer,
    },
})

// keep the cart across page refreshes
let savedCart = store.getState().cart
store.subscribe(() => {
    const { cart } = store.getState()
    if (cart === savedCart) return
    savedCart = cart
    localStorage.setItem('cartItems', JSON.stringify(cart.cartItems))
    localStorage.setItem('shippingInfo', JSON.stringify(cart.shippingInfo))
})

export default store
