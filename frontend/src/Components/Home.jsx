import { useState, useEffect, useCallback } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
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
    // category lives in the URL
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || '';
    const location = useLocation();
    const dispatch = useDispatch();
    const { loading, products, error, filteredProductsCount, resPerPage } = useSelector(state => state.products);
    const total = filteredProductsCount || 0;

    // Quiz 3: infinite scroll
    // page resets when search/filters change
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

    // new search: scroll to top
    // /#catalog: scroll to products
    useEffect(() => {
        if (location.hash === '#catalog') document.getElementById('catalog')?.scrollIntoView()
        else window.scrollTo(0, 0)
    }, [keyword, category, location.hash, location.key]);

    const filtersActive = !!category || JSON.stringify(filters) !== JSON.stringify(defaultFilters);
    // stop if the catalog shrinks
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
                    {/* MP2 filters */}
                    <div className="col-12 col-md-4 col-lg-3">
                        <div className={`filter-panel ${filtersOpen ? 'open' : ''}`} id="filters">
                        <div className="filter-panel-header">
                            <h5 className="mb-0">Refine your search</h5>
                                {filtersActive && <button className="btn btn-link btn-sm p-0" id="clear_filters" onClick={clearFilters}>Clear all</button>}
                            </div>

                        <div className="filter-section">
                            <h6>Price range</h6>
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
                            <div className="price-inputs">
                                <label className="price-input">
                                    <span aria-hidden="true">₱</span>
                                    <input type="number" className="form-control form-control-sm" id="price_min" placeholder="Min" min="0"
                                        value={priceDraft[0]} onChange={e => setPriceInput(0, e.target.value)} onBlur={applyPriceInputs}
                                        onKeyDown={e => e.key === 'Enter' && applyPriceInputs()} />
                                </label>
                                <span>to</span>
                                <label className="price-input">
                                    <span aria-hidden="true">₱</span>
                                    <input type="number" className="form-control form-control-sm" id="price_max" placeholder="Max" min="0"
                                        value={priceDraft[1]} onChange={e => setPriceInput(1, e.target.value)} onBlur={applyPriceInputs}
                                        onKeyDown={e => e.key === 'Enter' && applyPriceInputs()} />
                                </label>
                            </div>
                        </div>

                        <div className="filter-section">
                        <h6>Category</h6>
                        <div className="filter-options">
                        <label className="filter-option" htmlFor="cat_all">
                            <input className="form-check-input" type="radio" name="category" id="cat_all" checked={category === ''} onChange={() => setCategory('')} />
                            <span>All categories</span>
                        </label>
                        {CATEGORIES.map((c, i) => (
                            <label className="filter-option" key={c} htmlFor={`cat_${i}`}>
                                <input className="form-check-input" type="radio" name="category" id={`cat_${i}`} checked={category === c} onChange={() => setCategory(c)} />
                                <span>{c}</span>
                            </label>
                        ))}
                        </div>
                            </div>

                        <div className="filter-section">
                        <h6>Rating</h6>
                        <div className="filter-options">
                        <label className="filter-option" htmlFor="rate_0">
                            <input className="form-check-input" type="radio" name="ratings" id="rate_0" checked={filters.ratings === 0} onChange={() => setFilter({ ratings: 0 })} />
                            <span>Any rating</span>
                        </label>
                        {[4, 3, 2, 1].map(r => (
                            <label className="filter-option" key={r} htmlFor={`rate_${r}`}>
                                <input className="form-check-input" type="radio" name="ratings" id={`rate_${r}`} checked={filters.ratings === r} onChange={() => setFilter({ ratings: r })} />
                                <span><Stars value={r} /> &amp; up</span>
                            </label>
                            ))}
                        </div>
                        </div>

                        <div className="filter-section">
                        <h6>Reviews</h6>
                        <div className="filter-options">
                        {[[0, 'Any'], [1, 'With reviews'], [5, '5+ reviews'], [10, '10+ reviews']].map(([n, label]) => (
                            <label className="filter-option" key={n} htmlFor={`rev_${n}`}>
                                <input className="form-check-input" type="radio" name="reviews" id={`rev_${n}`} checked={filters.reviews === n} onChange={() => setFilter({ reviews: n })} />
                                <span>{label}</span>
                            </label>
                        ))}
                        </div>
                        </div>
                        </div>
                    </div>

                    {/* Product grid */}
                    <div className="col-12 col-md-8 col-lg-9">
                        {/* full loader on first load only */}
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
