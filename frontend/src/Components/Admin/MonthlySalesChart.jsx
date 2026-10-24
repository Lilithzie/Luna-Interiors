import React, { useState, useEffect } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getToken } from "../Utils/helpers";
import axios from "axios";

export default function MonthlySalesChart() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const monthlySales = async () => {
        try {
            const config = {
                headers: {

                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-per-month`, config)
            setSales(data.salesPerMonth)
            // console.log(data.salesPerMonth)
            setLoading(false)

        } catch (error) {
            setError(error.response.data.message)
        }
    }
    useEffect(() => {
        monthlySales()

    }, [])

    return (
        <div className="card dashboard-chart-card shadow-sm border-0 p-3">
            <h2 className="h5">Monthly sales</h2>
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
            </LineChart>
            </ResponsiveContainer>
        </div>
    );
}