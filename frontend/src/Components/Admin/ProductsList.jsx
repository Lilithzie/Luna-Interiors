import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter, useGridApiRef, gridFilteredSortedRowIdsSelector } from '@mui/x-data-grid'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { peso, firstImage } from '../Utils/helpers'

const API = import.meta.env.VITE_API

const Toolbar = () => (
    <GridToolbarContainer sx={{ p: 1 }}>
        <GridToolbarQuickFilter debounceMs={200} placeholder="Search products…" />
    </GridToolbarContainer>
)

const ProductsList = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selection, setSelection] = useState({ type: 'include', ids: new Set() })
    const apiRef = useGridApiRef()

    const load = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/admin/products`, { withCredentials: true })
            setProducts(data.products)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not load products', { position: 'bottom-right' })
        }
        setLoading(false)
    }, [])
    useEffect(() => { load() }, [load])

    // MUI v9 can report "select all" as {type:'exclude'} - normalise to a plain id list
    const selectedIds = () => {
        if (selection.type === 'include') return [...selection.ids].map(String)
        const visible = apiRef.current ? gridFilteredSortedRowIdsSelector(apiRef) : products.map(p => p._id)
        return visible.filter(id => !selection.ids.has(id)).map(String)
    }
    const selectedCount = selection.type === 'include'
        ? selection.ids.size
        : Math.max(products.length - selection.ids.size, 0)

    const confirmDelete = async (title, text) => {
        const r = await Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonColor: '#8B5A2B', confirmButtonText: 'Yes, delete' })
        return r.isConfirmed
    }

    const deleteOne = async (id, name) => {
        if (!(await confirmDelete('Delete this product?', name))) return
        try {
            await axios.delete(`${API}/admin/product/${id}`, { withCredentials: true })
            toast.success('Product deleted', { position: 'bottom-right' })
            setSelection({ type: 'include', ids: new Set() })
            load()
        } catch (e) { toast.error(e.response?.data?.message || 'Delete failed', { position: 'bottom-right' }) }
    }

    // MP1 - bulk delete with checkboxes
    const deleteSelected = async () => {
        const ids = selectedIds()
        if (!ids.length) return
        if (!(await confirmDelete(`Delete ${ids.length} product${ids.length > 1 ? 's' : ''}?`, 'This cannot be undone.'))) return
        try {
            const { data } = await axios.delete(`${API}/admin/products`, { data: { ids }, withCredentials: true })
            toast.success(`${data.deletedCount} product${data.deletedCount > 1 ? 's' : ''} deleted`, { position: 'bottom-right' })
            setSelection({ type: 'include', ids: new Set() })
            load()
        } catch (e) { toast.error(e.response?.data?.message || 'Bulk delete failed', { position: 'bottom-right' }) }
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

    const rows = products.map(p => ({ ...p, id: p._id }))

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
                                rows={rows}
                                columns={columns}
                                checkboxSelection
                                disableRowSelectionOnClick
                                rowSelectionModel={selection}
                                onRowSelectionModelChange={setSelection}
                                pageSizeOptions={[5, 10, 25]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                slots={{ toolbar: Toolbar }}
                                showToolbar
                                rowHeight={58}
                                autoHeight
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ProductsList
