import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export const errMsg = (message = '') => toast.error(message, {
    position: 'bottom-center'
});
export const successMsg = (message = '') => toast.success(message, {
    position: 'bottom-center'
});

export const CATEGORIES = [
    'Living Room',
    'Bedroom',
    'Dining Room',
    'Outdoor',
    'Storage',
    'Kitchen',
    'Entryway',
    'Kids & Nursery',
];

export const NO_IMAGE = '/images/no-image.svg';

export const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const firstImage = (product) =>
    product && product.images && product.images.length ? product.images[0].url : NO_IMAGE;

export const API = import.meta.env.VITE_API;

// the message to show the user for a failed API call
export const errorMessage = (error) => error.response?.data?.message || error.response?.data?.error || error.message;
