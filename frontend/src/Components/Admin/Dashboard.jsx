import { useEffect } from 'react'
import { Link } from 'react-router-dom';

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { peso } from '../Utils/helpers';
import { useDispatch, useSelector } from 'react-redux'
import { getAdminProducts } from '../../slices/adminProductSlice'
import { allOrders } from '../../slices/orderSlice'
import { allUsers } from '../../slices/adminUserSlice'
import ProductSalesChart from './ProductSalesChart';
import UserSalesChart from './UserSalesChart';
import MonthlySalesChart from './MonthlySalesChart';
import YearlySalesChart from './YearlySalesChart';
import DateRangeSalesChart from './DateRangeSalesChart';

const Dashboard = () => {

    const dispatch = useDispatch()
    const { products, loading, error } = useSelector(state => state.adminProducts)
    const { orders, totalAmount } = useSelector(state => state.adminOrders)
    const { users } = useSelector(state => state.adminUsers)
    let outOfStock = 0;
    (products || []).forEach(product => {
        if (product.stock === 0) {
            outOfStock += 1;
        }
    })
    useEffect(() => {
        dispatch(getAdminProducts())
        dispatch(allOrders())
        dispatch(allUsers())
    }, [dispatch])

    return (
        <>
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <h1 className="my-4">Dashboard</h1>

                    {loading ? <Loader /> : (
                        <>
                            <MetaData title={'Admin Dashboard'} />

                            <div className="row pr-4">
                                <div className="col-xl-12 col-sm-12 mb-3">
                                    <div className="card text-white luna-stat-total o-hidden h-100">
                                        <div className="card-body">
                                            <div className="text-center card-font-size">Total Amount<br /> <b>{peso(totalAmount)}</b>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row pr-4">
                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white luna-stat-products o-hidden h-100">
                                        <div className="card-body">
                                            <div className="text-center card-font-size">Products<br /> <b>{products && products.length}</b></div>
                                        </div>

                                        <Link className="card-footer text-white clearfix small z-1" to="/admin/products">
                                            <span className="float-left">View Details</span>
                                            <span className="float-right">
                                                <i className="fa fa-angle-right"></i>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white luna-stat-orders o-hidden h-100">

                                        <div className="card-body">
                                            <div className="text-center card-font-size">Orders<br /> <b>{orders && orders.length}</b></div>
                                        </div>

                                        <Link className="card-footer text-white clearfix small z-1" to="/admin/orders">
                                            <span className="float-left">View Details</span>
                                            <span className="float-right">
                                                <i className="fa fa-angle-right"></i>
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white luna-stat-users o-hidden h-100">

                                        <div className="card-body">
                                            <div className="text-center card-font-size">Users<br /> <b>{users && users.length}</b></div>
                                        </div>

                                        <Link className="card-footer text-white clearfix small z-1" to="/admin/users">
                                            <span className="float-left">View Details</span>
                                            <span className="float-right">
                                                <i className="fa fa-angle-right"></i>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-sm-6 mb-3">
                                    <div className="card text-white luna-stat-stock o-hidden h-100">

                                        <div className="card-body">
                                            <div className="text-center card-font-size">Out of Stock<br /> <b>{outOfStock}</b></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="dashboard-charts">
                        <DateRangeSalesChart />
                        <MonthlySalesChart />
                        <YearlySalesChart />
                        <ProductSalesChart />
                        <UserSalesChart />
                    </div>

                </div>
            </div >
        </ >
    )
}

export default Dashboard