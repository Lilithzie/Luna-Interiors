import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Product from './Product/Product'
import Slider from '@mui/material/Slider';
import MetaData from './Layout/MetaData'
import Loader from './Layout/Loader';
import { Stars } from './Layout/Stars'
import { CATEGORIES, peso } from './Utils/helpers'
import { LoadMoreSentinel } from './Utils/InfiniteScroll'
import { Hero, CategoryGrid, PromoBanners, Inspiration, BrandStory } from './Storefront/HomeSections'

import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '../slices/productSlice'

const MAX_PRICE = 100000;
const defaultFilters = { price: [0, MAX_PRICE], ratings: 0, reviews: 0, sort: 'newest' };

const Home = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [priceDraft, setPriceDraft] = useState(defaultFilters.price);   // slider value while dragging
    const [filtersOpen, setFiltersOpen] = useState(false);                // phones: panel is collapsed
    const { keyword } = useParams();
    // the category lives in the URL so the header links, category tiles and filter panel stay in step
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || '';
    const dispatch = useDispatch();
    const { loading, products, error, filteredProductsCount, resPerPage } = useSelector(state => state.products);
    const total = filteredProductsCount || 0;

    // ---- Quiz 3: infinite scroll ----
    // The page number belongs to ONE search/filter combination (queryKey). When the keyword or any
    // filter changes the key changes, so we are automatically back on page 1 - no stale page 2/3 request
    // can ever be appended to a different result set.
    const queryKey = JSON.stringify([keyword || '', category, filters]);
    const [pageState, setPageState] = useState({ key: queryKey, page: 1 });
    const currentPage = pageState.key === queryKey ? pageState.page : 1;
    const loadMore = useCallback(() => setPageState({ key: queryKey, page: currentPage + 1 }), [queryKey, currentPage]);

    const setFilter = (patch) => {
        setFilters(f => ({ ...f, ...patch }));
    }
    const setCategory = (value) => setSearchParams(value ? { category: value } : {});
    const clearFilters = () => { setFilters(defaultFilters); setPriceDraft(defaultFilters.price); setCategory(''); }

    const setPriceInput = (idx, raw) => {
        const v = raw === '' ? '' : Math.max(0, Math.min(MAX_PRICE, Number(raw)));
        const next = [...priceDraft]; next[idx] = v; setPriceDraft(next);
    }
    const applyPriceInputs = () => {
        let [lo, hi] = priceDraft.map(v => (v === '' ? null : Number(v)));
        if (lo === null) lo = 0;
        if (hi === null) hi = MAX_PRICE;
        if (lo > hi) [lo, hi] = [hi, lo];
        setPriceDraft([lo, hi]);
        setFilter({ price: [lo, hi] });
    }

    const load = useCallback(() => {
        dispatch(getProducts({ page: currentPage, keyword, category, ...filters, append: currentPage > 1 }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, currentPage, queryKey]);

    useEffect(() => { load() }, [load]);

    // a search or category replaces the promotions, so start at the top of the results
    useEffect(() => { window.scrollTo(0, 0) }, [keyword, category]);

    const filtersActive = !!category || JSON.stringify(filters) !== JSON.stringify(defaultFilters);
    // the second check stops the requests if the catalog shrinks while scrolling: pages run out before `total`
    const hasMore = !error && products.length < total && (currentPage - 1) * (resPerPage || 1) < total;
    const showPromotions = !keyword && !category;

    return (
        <div className="storefront">
            <MetaData title={category || 'Shop Furniture'} />

            {showPromotions && (
                <>
                    <Hero />
                    <CategoryGrid />
                    <PromoBanners />
                </>
            )}

            <section className="store-section store-container" id="catalog">
                <h2 id="products_heading">{keyword ? `Results for “${keyword}”` : category || 'All Furniture'}</h2>

                <div className="catalog-toolbar">
                    <span id="result_count" className="text-muted">{loading && currentPage === 1 ? 'Loading…' : `${total} ${total === 1 ? 'product' : 'products'} found`}</span>
                    <div className="catalog-toolbar-actions">
                        <button type="button" className="btn btn-outline-luna btn-sm d-md-none" id="filters_toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(open => !open)}>
                            <i className="fa fa-sliders" aria-hidden="true"></i> Filters
                        </button>
                        <label className="sr-only" htmlFor="sort">Sort products</label>
                        <select className="form-control form-control-sm" id="sort" value={filters.sort} onChange={e => setFilter({ sort: e.target.value })}>
                            <option value="newest">Newest</option>
                            <option value="price-asc">Price: low to high</option>
                            <option value="price-desc">Price: high to low</option>
                            <option value="rating">Top rated</option>
                        </select>
                    </div>
                </div>

                <div className="row">
                    {/* ---------------- MP2 FILTERS ---------------- */}
                    <div className="col-12 col-md-4 col-lg-3">
                        <div className={`filter-panel ${filtersOpen ? 'open' : ''}`} id="filters">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Filters</h5>
                                {filtersActive && <button className="btn btn-link btn-sm p-0" id="clear_filters" onClick={clearFilters}>Clear all</button>}
                            </div>

                            <h6>Price</h6>
                            <Slider
                                value={priceDraft.map(Number)}
                                min={0}
                                max={MAX_PRICE}
                                step={500}
                                onChange={(e, v) => setPriceDraft(v)}
                                onChangeCommitted={(e, v) => setFilter({ price: v })}
                                valueLabelDisplay="auto"
                                valueLabelFormat={peso}
                                sx={{ color: '#8B5A2B' }}
                            />
                            <div className="d-flex align-items-center">
                                <input type="number" className="form-control form-control-sm" id="price_min" placeholder="Min" min="0"
                                    value={priceDraft[0]} onChange={e => setPriceInput(0, e.target.value)} onBlur={applyPriceInputs}
                                    onKeyDown={e => e.key === 'Enter' && applyPriceInputs()} />
                                <span className="mx-2">–</span>
                                <input type="number" className="form-control form-control-sm" id="price_max" placeholder="Max" min="0"
                                    value={priceDraft[1]} onChange={e => setPriceInput(1, e.target.value)} onBlur={applyPriceInputs}
                                    onKeyDown={e => e.key === 'Enter' && applyPriceInputs()} />
                            </div>

                            <h6>Category</h6>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="category" id="cat_all" checked={category === ''} onChange={() => setCategory('')} />
                                <label className="form-check-label" htmlFor="cat_all">All categories</label>
                            </div>
                            {CATEGORIES.map((c, i) => (
                                <div className="form-check" key={c}>
                                    <input className="form-check-input" type="radio" name="category" id={`cat_${i}`} checked={category === c} onChange={() => setCategory(c)} />
                                    <label className="form-check-label" htmlFor={`cat_${i}`}>{c}</label>
                                </div>
                            ))}

                            <h6>Rating</h6>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="ratings" id="rate_0" checked={filters.ratings === 0} onChange={() => setFilter({ ratings: 0 })} />
                                <label className="form-check-label" htmlFor="rate_0">Any rating</label>
                            </div>
                            {[4, 3, 2, 1].map(r => (
                                <div className="form-check" key={r}>
                                    <input className="form-check-input" type="radio" name="ratings" id={`rate_${r}`} checked={filters.ratings === r} onChange={() => setFilter({ ratings: r })} />
                                    <label className="form-check-label" htmlFor={`rate_${r}`}><Stars value={r} /> &amp; up</label>
                                </div>
                            ))}

                            <h6>Reviews</h6>
                            {[[0, 'Any'], [1, 'With reviews'], [5, '5+ reviews'], [10, '10+ reviews']].map(([n, label]) => (
                                <div className="form-check" key={n}>
                                    <input className="form-check-input" type="radio" name="reviews" id={`rev_${n}`} checked={filters.reviews === n} onChange={() => setFilter({ reviews: n })} />
                                    <label className="form-check-label" htmlFor={`rev_${n}`}>{label}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ---------------- PRODUCT GRID ---------------- */}
                    <div className="col-12 col-md-8 col-lg-9">
                        {/* full-page loader only for the first load / a new search; while loading MORE the list stays put */}
                        {loading && products.length === 0 ? <Loader /> : (
                            <section id="products">
                                <div className="row">
                                    {products && products.map(product => <Product key={product._id} product={product} />)}
                                    {!error && products && products.length === 0 && (
                                        <div className="col-12 text-center text-muted py-5" id="no_results">
                                            No products match your filters.
                                            {filtersActive && <div><button className="btn btn-outline-luna btn-sm mt-3" onClick={clearFilters}>Clear filters</button></div>}
                                        </div>
                                    )}
                                </div>
                                {error && (
                                    <div className="alert alert-danger catalog-error" id="catalog_error">
                                        {error}
                                        <button type="button" className="btn btn-sm btn-outline-luna ml-3" onClick={load}>Try again</button>
                                    </div>
                                )}
                                {products.length > 0 && !error && (
                                    <LoadMoreSentinel
                                        hasMore={hasMore}
                                        loading={loading}
                                        onLoadMore={loadMore}
                                        shown={products.length}
                                        total={total}
                                        label="products"
                                    />
                                )}
                            </section>
                        )}
                    </div>
                </div>
            </section>

            {showPromotions && (
                <>
                    <Inspiration />
                    <BrandStory />
                </>
            )}
        </div>
    )
}

export default Home
