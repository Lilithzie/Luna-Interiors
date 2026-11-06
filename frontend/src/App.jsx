import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer, } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { loadUser } from './slices/authSlice';

import { Header } from './Components/Layout/Header'
import Footer from './Components/Layout/Footer'

import './App.css'
import './theme.css'
import Home from './Components/Home'
import ProductDetails from './Components/Product/ProductDetails';
import Wishlist from './Components/Product/Wishlist';
import Login from './Components/User/Login';
import Register from './Components/User/Register';
import ForgotPassword from './Components/User/ForgotPassword';
import NewPassword from './Components/User/NewPassword';
import Profile from './Components/User/Profile';
import UpdateProfile from './Components/User/UpdateProfile';
import UpdatePassword from './Components/User/UpdatePassword';
import Cart from './Components/Cart/Cart';
import Shipping from './Components/Cart/Shipping';
import ConfirmOrder from './Components/Cart/ConfirmOrder';
import Payment from './Components/Cart/Payment';
import OrderSuccess from './Components/Cart/OrderSuccess';
import ListOrders from './Components/Order/ListOrders';
import OrderDetails from './Components/Order/OrderDetails';

import Dashboard from './Components/Admin/Dashboard';
import ProductsList from './Components/Admin/ProductsList';
import NewProduct from './Components/Admin/NewProduct';
import UpdateProduct from './Components/Admin/UpdateProduct';
import OrdersList from './Components/Admin/OrdersList';
import ProcessOrder from './Components/Admin/ProcessOrder';
import UsersList from './Components/Admin/UsersList';
import UpdateUser from './Components/Admin/UpdateUser';
import ProtectedRoute from './Components/Route/ProtectedRoute';
import ProductReviews from './Components/Admin/ProductReviews';
function App() {
  const dispatch = useDispatch()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // restore session from cookie
    dispatch(loadUser()).finally(() => setReady(true))
  }, [dispatch])

  if (!ready) return <div className="loader"> </div>

  return (
    <div className="site-shell">
      <Router>
        <AppRoutes />
      </Router>
      <ToastContainer />
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()
  const backgroundLocation = location.state?.backgroundLocation

  return (
    <>
        <div className="site-main">
        <Header />
        <main className="route-content"><Routes location={backgroundLocation || location}>
          <Route path="/" element={<Home />} exact="true" />
          <Route path="/product/:id" element={<ProductDetails />} exact="true" />

          <Route path="/search/:keyword" element={<Home />} exact="true" />
          <Route path="/wishlist" element={<><Home /><Wishlist /></>} />
          <Route path="/login" element={<><Home /><Login /></>} exact="true" />
          <Route path="/register" element={<><Home /><Register /></>} />
          <Route path="/password/forgot" element={<ForgotPassword />} exact="true" />
          <Route path="/password/reset/:token" element={<NewPassword />} exact="true" />
          <Route path="/me" element={<ProtectedRoute><><Home /><Profile /></></ProtectedRoute>} exact="true" />
          <Route path="/me/update" element={<ProtectedRoute><><Home /><UpdateProfile /></></ProtectedRoute>} exact="true"
          />
          <Route path="/password/update" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />

          <Route path="/cart" element={<ProtectedRoute customerOnly={true}><Cart /></ProtectedRoute>} />
          <Route path="/shipping" element={<ProtectedRoute customerOnly={true}><Shipping /></ProtectedRoute>} />
          <Route path="/confirm" element={<ProtectedRoute customerOnly={true}><ConfirmOrder /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute customerOnly={true}><Payment /></ProtectedRoute>} />

          <Route path="/success" element={<ProtectedRoute customerOnly={true}><OrderSuccess /></ProtectedRoute>} />
          <Route path="/orders/me" element={<ProtectedRoute customerOnly={true}><ListOrders /></ProtectedRoute>} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

          <Route path="/admin/product" element={<ProtectedRoute isAdmin={true}><NewProduct /></ProtectedRoute>} />
          <Route
            path="/admin/product/:id"
            element={<ProtectedRoute isAdmin={true}><UpdateProduct /></ProtectedRoute>} />
          <Route
            path="/admin/order/:id"
            element={<ProtectedRoute isAdmin={true}><ProcessOrder /></ProtectedRoute>} />
          <Route path="/admin/user/:id" element={<ProtectedRoute isAdmin={true}><UpdateUser /></ProtectedRoute>} />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute isAdmin={true}>
                <ProductsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute isAdmin={true}>
                <UsersList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute isAdmin={true}>
                <OrdersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute isAdmin={true} >
                <ProductReviews />
              </ProtectedRoute>} />

        </Routes>
        {backgroundLocation && (
          <Routes location={location}>
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} exact="true" />
            <Route path="/register" element={<Register />} />
            <Route path="/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} exact="true" />
            <Route path="/me/update" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute customerOnly={true}><Cart /></ProtectedRoute>} />
          </Routes>
        )}
        </main>
        </div>
        <Footer />
    </>
  )
}

export default App
