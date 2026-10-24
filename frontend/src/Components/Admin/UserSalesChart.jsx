import React, { useState, useEffect } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { getToken } from "../Utils/helpers";
import axios from "axios";

const UserSalesChart = () => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const userSales = async () => {

        try {
            const config = {
                headers: {

                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/customer-sales`, config)
            setSales(data.customerSales)
            setLoading(false)
        } catch (error) {
            setError(error.response.data.message)
        }
    }
    const barColors = ["#1f77b4", "#ff7f0e", "#2ca02c"]
    useEffect(() => {
        userSales()
        // allUsers()
    }, [])

    return (
        <div className="card dashboard-chart-card shadow-sm border-0 p-3">
            <h2 className="h5">Sales by customer</h2>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sales}>
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="userDetails.name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="total" stroke="#000000"
                    strokeWidth={5} >
                    {
                        sales.map((item, index) => (
                            <Cell key={`cell-${index}`} fill={barColors[index % 20]} />
                        ))
                    }
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>


    );
}
export default UserSalesChart