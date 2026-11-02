import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProductSales } from '../../slices/salesSlice'

import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProductSalesChart() {
    const dispatch = useDispatch()
    const { byProduct: sales } = useSelector(state => state.sales)
    const barColors = [
        "#8B5A2B",
        "#C49A6C",
        "#6B4423",
        "#A67C52",
        "#D9B48F",
        "#2E1F14",
        "#7A8450",
        "#B5651D",
        "#9C7A5B",
    ]
    // console.log(data)

    useEffect(() => {
        dispatch(getProductSales())
    }, [dispatch])


    return (
        <div className="card dashboard-chart-card shadow-sm border-0 p-3">
            <h2 className="h5">Sales by product</h2>
            <div className="dashboard-chart-visual">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sales} layout="vertical" margin={{ top: 8, right: 20, left: 12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis type="number" domain={[0, 'auto']} tickFormatter={value => `${value}%`} />
                <YAxis type="category" dataKey="name" width={125} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="percent" name="Share of sales" fill="#8B5A2B">
                    {sales.map((item, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
            </div>
        </div>


    );
}