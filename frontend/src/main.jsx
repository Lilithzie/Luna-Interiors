import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store'
import axios from 'axios'
axios.defaults.withCredentials = true   // send the login cookie on every API call

createRoot(document.getElementById('root')).render(

  <Provider store={store} >
    <App />
  </Provider>




)
