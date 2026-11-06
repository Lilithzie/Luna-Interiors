import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { myOrders, clearMyOrdersError } from '../../slices/orderSlice'

import {

    Button
} from '@mui/material'

import { DataGrid, } from '@mui/x-data-grid'
import { useInfiniteRows, LoadMoreSentinel } from '../Utils/InfiniteScroll'

const ListOrders = () => {
    const dispatch = useDispatch();
    const { loading, error, orders } = useSelector(state => state.myOrders);

    const columns = [
        {
            field: 'id',
            headerName: 'Order ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'numOfItems',
            headerName: 'Num of Items',
            type: 'number',
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
            width: 160,
            renderCell: (params) =>
                (params.value && String(params.value).includes('Delivered'))
                    ? <span style={{ color: 'green' }}>{params.value}</span>
                    : <span style={{ color: 'red' }}>{params.value}</span>
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    component={Link}
                    to={`/order/${params.id}`}
                    variant="contained"
                    size="small"
                >
                    <i className="fa fa-eye" />
                </Button>
            )
        }
    ];

    const allRows = (orders || []).map(order => ({
        id: order._id,
        numOfItems: order.orderItems.length,
        amount: `₱${order.totalPrice}`,
        payment: order.paymentMethod || 'Card',
        status: order.orderStatus || ''
    }));
    // Quiz 3: infinite scroll
    const inf = useInfiniteRows(allRows, 10)
    useEffect(() => {
        dispatch(myOrders());
    }, [dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            dispatch(clearMyOrdersError())
        }
    }, [error, dispatch])

    return (
        <>
            <MetaData title={'My Orders'} />
            <h1 className="my-5">My Orders</h1>

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
    )
}

export default ListOrders