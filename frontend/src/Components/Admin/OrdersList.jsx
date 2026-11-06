import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'
import { DataGrid, } from '@mui/x-data-grid'
import { useInfiniteRows, LoadMoreSentinel } from '../Utils/InfiniteScroll'
import { useDispatch, useSelector } from 'react-redux'
import { allOrders, deleteOrder, clearAdminOrdersError } from '../../slices/orderSlice'

const OrdersList = () => {
    const dispatch = useDispatch()
    const { orders, loading, error } = useSelector(state => state.adminOrders)
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });

    useEffect(() => {
        dispatch(allOrders())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearAdminOrdersError())
        }
    }, [dispatch, error])

    const deleteOrderHandler = async (id, status) => {
        const text = status === 'Delivered'
            ? 'This order was delivered, so its items will not return to stock. This cannot be undone.'
            : 'Its items will go back into stock. This cannot be undone.'
        const r = await Swal.fire({ title: 'Delete this order?', text, icon: 'warning', showCancelButton: true, confirmButtonColor: '#8B5A2B', confirmButtonText: 'Yes, delete' })
        if (!r.isConfirmed) return
        const result = await dispatch(deleteOrder(id))
        if (deleteOrder.fulfilled.match(result)) successMsg('Order deleted successfully')
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Order ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'numofItems',
            headerName: 'Number of Items',

            width: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'payment',
            headerName: 'Payment',
            width: 160
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            align: 'right',
            headerAlign: 'right'
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (

                <>
                    <Link to={`/admin/order/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-eye"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteOrderHandler(params.id, params.row.status)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];
    const allRows = orders.map(order => ({
        id: order._id,
        numofItems: order.orderItems.length,
        amount: `₱${order.totalPrice}`,
        payment: order.paymentMethod || 'Card',
        status: order.orderStatus,
    }));
    // Quiz 3: infinite scroll
    const inf = useInfiniteRows(allRows, 10)

    return (
        <>
            <MetaData title={'All Orders'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <>
                        <h1 className="my-5">All Orders</h1>
                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    {...inf.gridProps}
                                    columns={columns}
                                    disableRowSelectionOnClick
                                    getRowId={(row) => row.id}
                                    showToolbar
                                />
                                <LoadMoreSentinel hasMore={inf.hasMore} onLoadMore={inf.loadMore} shown={inf.shown} total={inf.total} label="orders" />
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    )
}

export default OrdersList