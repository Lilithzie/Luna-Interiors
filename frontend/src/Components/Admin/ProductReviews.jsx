import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid'
import { useInfiniteRows, LoadMoreSentinel } from '../Utils/InfiniteScroll'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { Stars } from '../Layout/Stars'

const API = import.meta.env.VITE_API
const Toolbar = () => (
    <GridToolbarContainer sx={{ p: 1 }}>
        <GridToolbarQuickFilter debounceMs={200} placeholder="Search reviews…" />
    </GridToolbarContainer>
)

// MP3 - admin can delete any review
const ProductReviews = () => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/admin/reviews`, { withCredentials: true })
            setReviews(data.reviews)
        } catch (e) {
            toast.error(e.response?.data?.message || 'Could not load reviews', { position: 'bottom-right' })
        }
        setLoading(false)
    }, [])
    useEffect(() => { load() }, [load])

    const remove = async (row) => {
        const r = await Swal.fire({
            title: 'Delete this review?', text: `"${row.comment}" — ${row.name}`, icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#8B5A2B', confirmButtonText: 'Yes, delete'
        })
        if (!r.isConfirmed) return
        try {
            await axios.delete(`${API}/reviews`, { params: { productId: row.productId, id: row.id }, withCredentials: true })
            toast.success('Review deleted', { position: 'bottom-right' })
            load()
        } catch (e) { toast.error(e.response?.data?.message || 'Delete failed', { position: 'bottom-right' }) }
    }

    const columns = useMemo(() => [
        {
            field: 'productName', headerName: 'Product', flex: 1, minWidth: 160,
            renderCell: (p) => <Link to={`/product/${p.row.productId}`}>{p.value}</Link>
        },
        { field: 'name', headerName: 'Customer', width: 150 },
        { field: 'rating', headerName: 'Rating', width: 140, type: 'number', renderCell: (p) => <Stars value={p.value} /> },
        { field: 'comment', headerName: 'Comment', flex: 2, minWidth: 220 },
        { field: 'createdAt', headerName: 'Date', width: 120, valueFormatter: (v) => (v ? new Date(v).toLocaleDateString() : '') },
        {
            field: 'actions', headerName: 'Actions', width: 100, sortable: false, filterable: false,
            renderCell: (p) => <button className="btn btn-danger py-1 px-2" aria-label="Delete review" onClick={() => remove(p.row)}><i className="fa fa-trash"></i></button>
        },
    ], [])   // eslint-disable-line react-hooks/exhaustive-deps

    // Quiz 3: infinite scroll - rows are revealed 10 at a time as you scroll down
    const inf = useInfiniteRows(reviews.map(r => ({ ...r, id: r._id })), 10)

    return (
        <>
            <MetaData title="Product Reviews" />
            <div className="row">
                <div className="col-12 col-md-2"><Sidebar /></div>
                <div className="col-12 col-md-10">
                    <h1 className="my-4 admin-page-title">Reviews</h1>
                    {loading ? <Loader /> : (
                        <div style={{ background: '#fff', borderRadius: 12 }}>
                            <DataGrid
                                {...inf.gridProps}
                                columns={columns}
                                disableRowSelectionOnClick
                                slots={{ toolbar: Toolbar }}
                                showToolbar
                            />
                            <LoadMoreSentinel hasMore={inf.hasMore} onLoadMore={inf.loadMore} shown={inf.shown} total={inf.total} label="reviews" />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ProductReviews
