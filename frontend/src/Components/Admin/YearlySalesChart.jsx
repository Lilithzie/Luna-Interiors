import { useEffect } from 'react'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDispatch, useSelector } from 'react-redux'
import { getYearlySales } from '../../slices/salesSlice'
import { peso } from '../Utils/helpers'

export default function YearlySalesChart() {
    const dispatch = useDispatch()
    const { yearly: sales } = useSelector(state => state.sales)

    useEffect(() => {
        dispatch(getYearlySales())
    }, [dispatch])

    return (
        <div className="card dashboard-chart-card yearly-sales-chart shadow-sm border-0 p-3">
            <h2 className="h5">Yearly sales</h2>
            <div className="dashboard-chart-visual">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sales} margin={{ top: 5, right: 20, bottom: 12, left: 42 }}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={value => `₱${Number(value).toLocaleString('en-PH')}`} />
                <Tooltip formatter={value => [peso(value), 'Sales']} cursor={{ fill: 'rgba(139, 90, 43, .08)' }} />
                <Bar dataKey="total" fill="#8B5A2B" maxBarSize={64} />
            </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
    );
}
