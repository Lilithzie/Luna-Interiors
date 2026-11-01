import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProductSales } from '../../slices/salesSlice'

import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProductSalesChart() {
    const dispatch = useDispatch()
    const { byProduct: sales } = useSelector(state => state.sales)
    const pieColors = [
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

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${percent}%`}
            </text>
        );
    };
    useEffect(() => {
        dispatch(getProductSales())
    }, [dispatch])


    return (
        <div className="card dashboard-chart-card shadow-sm border-0 p-3">
            <h2 className="h5">Sales by product</h2>
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                {/* <Pie data={data} dataKey="percent" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" /> */}
                <Pie
                    dataKey="percent"
                    nameKey="name"
                    isAnimationActive={true}
                    data={sales}
                    cx="50%"
                    cy="50%"
                    outerRadius="65%"
                    fill="#8B5A2B"
                    label={renderCustomizedLabel}
                    labelLine={false}
                // label
                >  {
                        sales.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)
                    }
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="top" align="right" />
            </PieChart>
            </ResponsiveContainer>
        </div>


    );
}