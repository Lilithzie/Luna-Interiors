import { useEffect } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { useDispatch, useSelector } from 'react-redux'
import { getCustomerSales } from '../../slices/salesSlice'

const UserSalesChart = () => {
    const dispatch = useDispatch()
    const { byCustomer: sales } = useSelector(state => state.sales)
    const barColors = ["#8B5A2B", "#C49A6C", "#6B4423"]
    useEffect(() => {
        dispatch(getCustomerSales())
    }, [dispatch])

    return (
        <div className="card dashboard-chart-card shadow-sm border-0 p-3">
            <h2 className="h5">Sales by customer</h2>
            <div className="dashboard-chart-visual">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sales} margin={{ top: 8, right: 12, left: 30, bottom: 18 }}>
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="userDetails.name" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="total">
                    {
                        sales.map((item, index) => (
                            <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                        ))
                    }
                </Bar>
            </BarChart>
            </ResponsiveContainer>
            </div>
        </div>


    );
}
export default UserSalesChart