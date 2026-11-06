import { useState, useEffect, useRef, useCallback } from 'react'

// Infinite scroll helpers (Quiz 3)

export const LoadMoreSentinel = ({ hasMore, loading = false, onLoadMore, shown, total, label = 'items' }) => {
    const ref = useRef(null)
    const loadRef = useRef(onLoadMore)
    useEffect(() => { loadRef.current = onLoadMore })

    useEffect(() => {
        const el = ref.current
        if (!el || !hasMore || loading) return undefined
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) loadRef.current()
        }, { rootMargin: '500px' })
        observer.observe(el)
        return () => observer.disconnect()
    }, [hasMore, loading, shown])

    if (!total) return null
    return (
        <div ref={ref} className="infinite-sentinel text-center text-muted py-3" aria-live="polite">
            {loading
                ? 'Loading more…'
                : hasMore
                    ? `Showing ${shown} of ${total} ${label}`
                    : `Showing all ${total} ${label}. You've reached the end.`}
        </div>
    )
}

export const useInfiniteRows = (rows, step = 10) => {
    const [count, setCount] = useState(step)
    const [filterModel, setFilterModel] = useState({ items: [], quickFilterValues: [] })
    const [sortModel, setSortModel] = useState([])

    const narrowing =
        (filterModel.items || []).length > 0 ||
        (filterModel.quickFilterValues || []).some(v => String(v).trim() !== '') ||
        sortModel.length > 0

    const total = rows.length

    const tooBig = total > 100
    const showAll = narrowing || tooBig
    const visibleRows = showAll ? rows : rows.slice(0, count)
    const hasMore = !showAll && count < total
    const loadMore = useCallback(() => setCount(c => c + step), [step])

    return {
        visibleRows,
        total,
        hasMore,
        loadMore,
        shown: visibleRows.length,
        gridProps: {
            rows: visibleRows,
            filterModel,
            onFilterModelChange: setFilterModel,
            sortModel,
            onSortModelChange: setSortModel,
            hideFooterPagination: !tooBig,
            pageSizeOptions: [100],
            initialState: { pagination: { paginationModel: { pageSize: 100 } } },
            autoHeight: true,
        },
    }
}
