import axios from 'axios';
import {
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    CLEAR_ERRORS
} from '../constants/productConstants';

// MP2 - filters: { keyword, page, price:[min,max], category, ratings, reviews, sort }
export const getProducts = ({ page = 1, keyword = '', price, category = '', ratings = 0, reviews = 0, sort = 'newest' } = {}) => async (dispatch) => {
    try {
        dispatch({ type: ALL_PRODUCTS_REQUEST })

        const params = new URLSearchParams();
        params.set('page', page);
        if (keyword) params.set('keyword', keyword);
        if (price) {
            params.set('price[gte]', price[0]);
            params.set('price[lte]', price[1]);
        }
        if (category) params.set('category', category);
        if (ratings) params.set('ratings[gte]', ratings);
        if (reviews) params.set('numOfReviews[gte]', reviews);
        if (sort) params.set('sort', sort);

        const { data } = await axios.get(`${import.meta.env.VITE_API}/products?${params.toString()}`)
        dispatch({ type: ALL_PRODUCTS_SUCCESS, payload: data })

    } catch (error) {
        dispatch({
            type: ALL_PRODUCTS_FAIL,
            payload: error.response?.data?.message || error.message
        })
    }
}

export const getProductDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: PRODUCT_DETAILS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
        dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data.product })
    } catch (error) {
        dispatch({
            type: PRODUCT_DETAILS_FAIL,
            payload: error.response?.data?.message || error.message
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({ type: CLEAR_ERRORS })
}
