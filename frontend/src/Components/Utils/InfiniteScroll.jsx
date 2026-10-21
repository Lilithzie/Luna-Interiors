import { useState, useEffect, useRef, useCallback } from 'react'

/* ------------------------------------------------------------------ */
/* Infinite scroll helpers (Quiz 3)                                    */
/*  - <LoadMoreSentinel/>  : invisible marker at the bottom of a list;  */
/*                           when it scrolls into view -> load more     */
/*  - useInfiniteRows()    : reveals a DataGrid's rows 10 at a time     */
/* ------------------------------------------------------------------ */

// Put this right after a list. It calls onLoadMore() each time it comes into view.
export const LoadMoreSentinel = ({ hasMore, loading = false, onLoadMore, shown, total, label = 'items' }) => {
    const ref = useRef(null)
    const loadRef = useRef(onLoadMore)
    useEffect(() => { loadRef.current = onLoadMore })

    useEffect(() => {
        const el = ref.current
        if (!el || !hasMore || loading) return undefined
        // A new observer is created every time more rows arrive, so if the marker is
        // still on screen (tall monitor / few rows) it immediately asks for the next batch.
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) loadRef.current()
        }, { rootMargin: '200px' })
        observer.observe(el)
        return () => observer.disconnect()
    }, [hasMore, loading, shown])

    if (!total) return null
    return (
        <div ref={ref} className="infinite-sentinel text-center text-muted py-3" aria-live="polite">
            {loading
                ? 'Loading more…'
                : hasMore
                    ? <>Showing {shown} of {total} {label} · <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => loadRef.current()}>Load more</button></>
                    : `Showing all ${total} ${label}`}
        </div>
    )
}

// For MUI DataGrids that already hold every row in memory: show `step` rows, then reveal
// more as the user scrolls. While the user is searching / filtering / sorting, ALL rows are
// used so the result covers the whole table, not just the part that was scrolled into view.
export const useInfiniteRows = (rows, step = 10) => {
    const [count, setCount] = useState(step)
    const [filterModel, setFilterModel] = useState({ items: [], quickFilterValues: [] })
    const [sortModel, setSortModel] = useState([])

    const narrowing =
        (filterModel.items || []).length > 0 ||
        (filterModel.quickFilterValues || []).some(v => String(v).trim() !== '') ||
        sortModel.length > 0

    const total = rows.length
    // The free DataGrid can only show 100 rows per page, so a table bigger than that falls back
    // to the normal footer pagination instead of infinite scroll.
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
        // spread these onto <DataGrid {...gridProps} />
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
