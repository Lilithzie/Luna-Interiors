import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter, useGridApiRef, gridFilteredSortedRowIdsSelector } from '@mui/x-data-grid'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { peso, firstImage } from '../Utils/helpers'
import { useInfiniteRows, LoadMoreSentinel } from '../Utils/InfiniteScroll'
import { getAdminProducts, deleteProduct, bulkDeleteProducts, clearAdminProductError } from '../../slices/adminProductSlice'

const Toolbar = () => (
    <GridToolbarContainer sx={{ p: 1 }}>
        <GridToolbarQuickFilter debounceMs={200} placeholder="Search products…" />
    </GridToolbarContainer>
)

const ProductsList = () => {
    const dispatch = useDispatch()
    const { products, loading, error } = useSelector(state => state.adminProducts)
    const [selection, setSelection] = useState({ type: 'include', ids: new Set() })
    const apiRef = useGridApiRef()

    useEffect(() => { dispatch(getAdminProducts()) }, [dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearAdminProductError())
        }
    }, [dispatch, error])

    // normalise MUI select-all
    const onSelectionChange = (model) => {
        if (model.type === 'include') return setSelection(model)
        const visible = gridFilteredSortedRowIdsSelector(apiRef)
        setSelection({ type: 'include', ids: new Set(visible.filter(id => !model.ids.has(id))) })
    }
    const selectedCount = selection.ids.size

    const confirmDelete = async (title, text) => {
        const r = await Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonColor: '#8B5A2B', confirmButtonText: 'Yes, delete' })
        return r.isConfirmed
    }

    const deleteOne = async (id, name) => {
        if (!(await confirmDelete('Delete this product?', name))) return
        try {
            await dispatch(deleteProduct(id)).unwrap()
            toast.success('Product deleted', { position: 'bottom-right' })
            setSelection({ type: 'include', ids: new Set() })
        } catch (message) { toast.error(message || 'Delete failed', { position: 'bottom-right' }) }
    }

    // MP1 - bulk delete
    const deleteSelected = async () => {
        const ids = [...selection.ids].map(String)
        if (!ids.length) return
        if (!(await confirmDelete(`Delete ${ids.length} product${ids.length > 1 ? 's' : ''}?`, 'This cannot be undone.'))) return
        try {
            const data = await dispatch(bulkDeleteProducts(ids)).unwrap()
            toast.success(`${data.deletedCount} product${data.deletedCount > 1 ? 's' : ''} deleted`, { position: 'bottom-right' })
            setSelection({ type: 'include', ids: new Set() })
        } catch (message) { toast.error(message || 'Bulk delete failed', { position: 'bottom-right' }) }
    }

    const columns = useMemo(() => [
        {
            field: 'photo', headerName: 'Photo', width: 80, sortable: false, filterable: false,
            renderCell: (p) => <img className="grid-thumb" src={firstImage(p.row)} alt="" />
        },
        { field: 'name', headerName: 'Name', flex: 1.4, minWidth: 180 },
        { field: 'category', headerName: 'Category', flex: 1, minWidth: 120 },
        { field: 'price', headerName: 'Price', width: 110, type: 'number', valueFormatter: (v) => peso(v) },
        { field: 'stock', headerName: 'Stock', width: 90, type: 'number' },
        { field: 'ratings', headerName: 'Rating', width: 90, type: 'number', valueFormatter: (v) => Number(v || 0).toFixed(1) },
        { field: 'numOfReviews', headerName: 'Reviews', width: 90, type: 'number' },
        {
            field: 'actions', headerName: 'Actions', width: 150, sortable: false, filterable: false,
            renderCell: (p) => (
                <>
                    <Link to={`/admin/product/${p.row.id}`} className="btn btn-primary py-1 px-2" aria-label="Edit"><i className="fa fa-pencil"></i></Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" aria-label="Delete" onClick={() => deleteOne(p.row.id, p.row.name)}><i className="fa fa-trash"></i></button>
                </>
            )
        },
    ], [])   // eslint-disable-line react-hooks/exhaustive-deps

    const allRows = products.map(p => ({ ...p, id: p._id }))
    // Quiz 3: infinite scroll
    const inf = useInfiniteRows(allRows, 10)

    return (
        <>
            <MetaData title="All Products" />
            <div className="row">
                <div className="col-12 col-md-2"><Sidebar /></div>
                <div className="col-12 col-md-10">
                    <div className="d-flex justify-content-between align-items-center flex-wrap my-4">
                        <h1 className="admin-page-title mb-0">Products</h1>
                        <div>
                            <button id="bulk_delete" className="btn btn-danger mr-2" disabled={selectedCount === 0} onClick={deleteSelected}>
                                <i className="fa fa-trash"></i> Delete selected ({selectedCount})
                            </button>
                            <Link to="/admin/product" className="btn btn-luna"><i className="fa fa-plus"></i> New Product</Link>
                        </div>
                    </div>
                    {loading ? <Loader /> : (
                        <div style={{ width: '100%', background: '#fff', borderRadius: 12 }}>
                            <DataGrid
                                apiRef={apiRef}
                                {...inf.gridProps}
                                columns={columns}
                                checkboxSelection
                                disableRowSelectionOnClick
                                rowSelectionModel={selection}
                                onRowSelectionModelChange={onSelectionChange}
                                slots={{ toolbar: Toolbar }}
                                showToolbar
                                rowHeight={58}
                            />
                            <LoadMoreSentinel hasMore={inf.hasMore} onLoadMore={inf.loadMore} shown={inf.shown} total={inf.total} label="products" />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ProductsList
