import { useEffect, useMemo, useState } from 'react'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useDispatch, useSelector } from 'react-redux'
import { getSalesChart } from '../../slices/salesSlice'

const formatDate = (date) => date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })   // YYYY-MM-DD
const initialEnd = new Date()
const initialStart = new Date(initialEnd)
initialStart.setDate(initialStart.getDate() - 30)

export default function DateRangeSalesChart() {
    const [range, setRange] = useState({ startDate: formatDate(initialStart), endDate: formatDate(initialEnd) })
    const dispatch = useDispatch()
    const { range: sales, rangeLoading: loading, rangeError: error } = useSelector(state => state.sales)

    useEffect(() => {
        dispatch(getSalesChart(range))
    }, [dispatch, range])

    const total = useMemo(() => sales.reduce((sum, day) => sum + day.total, 0), [sales])

    return (
        <section className="card dashboard-chart-card sales-range-chart shadow-sm border-0 p-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                <div>
                    <h2 className="h4 mb-1">Sales performance</h2>
                    <p className="text-muted mb-0">Order sales within the selected date range</p>
                </div>
                <div className="date-range-controls mt-2 mt-md-0">
                    <label className="date-range-field" htmlFor="sales_start">
                        <span>From</span>
                        <input id="sales_start" type="date" className="form-control form-control-sm" value={range.startDate} onChange={event => setRange(current => ({ ...current, startDate: event.target.value }))} />
                    </label>
                    <label className="date-range-field" htmlFor="sales_end">
                        <span>To</span>
                        <input id="sales_end" type="date" className="form-control form-control-sm" value={range.endDate} onChange={event => setRange(current => ({ ...current, endDate: event.target.value }))} />
                    </label>
                </div>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {!error && <>
                <div className="d-flex justify-content-between align-items-center mb-2"><span className="text-muted small">Total sales</span><strong>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></div>
                <div style={{ width: '100%', height: 245 }}>
                    <ResponsiveContainer>
                        <LineChart data={sales} margin={{ top: 10, right: 20, left: 5, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(value) => [`₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 'Sales']} />
                            <Line type="monotone" dataKey="total" stroke="#8B5A2B" strokeWidth={3} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                {loading && <p className="text-center text-muted mb-0">Updating chart…</p>}
                {!loading && sales.length === 0 && <p className="text-center text-muted mb-0">No sales found for this range.</p>}
            </>}
        </section>
    )
}
