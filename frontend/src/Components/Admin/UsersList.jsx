import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

import 'react-toastify/dist/ReactToastify.css';

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { errMsg, successMsg } from '../Utils/helpers';
import { allUsers, deleteUser, clearAdminUserError } from '../../slices/adminUserSlice'
import { DataGrid, } from '@mui/x-data-grid'
import { useInfiniteRows, LoadMoreSentinel } from '../Utils/InfiniteScroll'

const UsersList = () => {
    const dispatch = useDispatch()
    const { users, loading, error } = useSelector(state => state.adminUsers)
    const { user: currentUser } = useSelector(state => state.auth)

    useEffect(() => {
        dispatch(allUsers());
    }, [dispatch])

    useEffect(() => {
        if (error) {
            errMsg(error);
            dispatch(clearAdminUserError())
        }
    }, [dispatch, error])

    const deleteUserHandler = async (id, name) => {
        const r = await Swal.fire({ title: 'Delete this user?', text: `${name} will lose access to this account. This cannot be undone.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#8B5A2B', confirmButtonText: 'Yes, delete' })
        if (!r.isConfirmed) return
        const result = await dispatch(deleteUser(id))
        if (deleteUser.fulfilled.match(result)) successMsg('User deleted successfully')
    }

    const columns = [
        {
            field: 'id',
            headerName: 'User ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'name',
            headerName: 'Name',

            width: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const isCurrentUser = currentUser?._id === params.id

                return (

                    <>
                        <Link to={`/admin/user/${params.id}`} className="btn btn-primary py-1 px-2">
                            <i className="fa fa-pencil"></i>
                        </Link>
                        <button
                            className="btn btn-danger py-1 px-2 ml-2"
                            onClick={() => deleteUserHandler(params.id, params.row.name)}
                            disabled={isCurrentUser}
                            title={isCurrentUser ? "You can't delete your own account." : 'Delete user'}
                        >
                            <i className="fa fa-trash"></i>
                        </button>
                    </>
                )
            }
        }
    ];
    const allRows = users.map(user => ({
        id: user._id,
        name: user.name,

        email: user.email,
        role: user.role,
    }));
    // Quiz 3: infinite scroll
    const inf = useInfiniteRows(allRows, 10)

    return (
        <>
            <MetaData title={'All Users'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <>
                        <h1 className="my-5">All Users</h1>
                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    {...inf.gridProps}
                                    columns={columns}
                                    disableRowSelectionOnClick
                                    getRowId={(row) => row.id}
                                    showToolbar
                                />
                                <LoadMoreSentinel hasMore={inf.hasMore} onLoadMore={inf.loadMore} shown={inf.shown} total={inf.total} label="users" />
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    )
}

export default UsersList
