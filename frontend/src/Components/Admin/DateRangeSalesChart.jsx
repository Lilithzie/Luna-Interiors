import { useEffect, useMemo, useState } from 'react'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import axios from 'axios'
import { getToken } from '../Utils/helpers'

const formatDate = (date) => date.toISOString().slice(0, 10)
const initialEnd = new Date()
const initialStart = new Date(initialEnd)
initialStart.setDate(initialStart.getDate() - 30)

export default function DateRangeSalesChart() {
    const [range, setRange] = useState({ startDate: formatDate(initialStart), endDate: formatDate(initialEnd) })
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            setError('')
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-chart`, {
                    params: range,
                    headers: { Authorization: `Bearer ${getToken()}` },
                    withCredentials: true,
                })
                if (!cancelled) setSales(data.sales)
            } catch (requestError) {
                if (!cancelled) setError(requestError.response?.data?.message || 'Could not load sales data')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [range])

    const total = useMemo(() => sales.reduce((sum, day) => sum + day.total, 0), [sales])

    return (
        <section className="card shadow-sm border-0 my-4 p-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                <div>
                    <h2 className="h4 mb-1">Sales performance</h2>
                    <p className="text-muted mb-0">Order sales within the selected date range</p>
                </div>
                <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                    <label className="small text-muted" htmlFor="sales_start">From</label>
                    <input id="sales_start" type="date" className="form-control form-control-sm" value={range.startDate} onChange={event => setRange(current => ({ ...current, startDate: event.target.value }))} />
                    <label className="small text-muted" htmlFor="sales_end">To</label>
                    <input id="sales_end" type="date" className="form-control form-control-sm" value={range.endDate} onChange={event => setRange(current => ({ ...current, endDate: event.target.value }))} />
                </div>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {!error && <>
                <div className="d-flex justify-content-between align-items-center mb-2"><span className="text-muted small">Total sales</span><strong>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></div>
                <div style={{ width: '100%', height: 320 }}>
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
