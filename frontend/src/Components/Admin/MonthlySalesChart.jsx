import React, { useEffect } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDispatch, useSelector } from 'react-redux'
import { getMonthlySales } from '../../slices/salesSlice'

export default function MonthlySalesChart() {
    const dispatch = useDispatch()
    const { monthly: sales } = useSelector(state => state.sales)

    useEffect(() => {
        dispatch(getMonthlySales())
    }, [dispatch])

    return (
        <div className="card dashboard-chart-card shadow-sm border-0 p-3">
            <h2 className="h5">Monthly sales</h2>
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="total" stroke="#8B5A2B" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
            </LineChart>
            </ResponsiveContainer>
        </div>
    );
}