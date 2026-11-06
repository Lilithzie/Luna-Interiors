import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { categoryLink, NO_IMAGE } from '../Utils/helpers'

const LIFESTYLE = '/images/lifestyle'

export const Hero = () => (
    <section className="store-hero" id="hero">
        <img src={`${LIFESTYLE}/hero-garden.webp`} alt="Wooden outdoor seating set in a leafy garden" />
        <div className="store-hero-copy">
            <p className="eyebrow">Luna Interiors</p>
            <h1>Style that fits your life. Made for how you live.</h1>
            <a href="#catalog" className="btn btn-luna-light" id="shop_now">Shop Now</a>
        </div>
    </section>
)

// categories with products
export const CategoryGrid = () => {
    const { categories } = useSelector(state => state.catalog)
    if (!categories.length) return null

    return (
        <section className="store-section store-container" id="shop_by_category">
            <h2>Shop by Category</h2>
            <div className="category-grid">
                {categories.map(({ category, count, image }) => (
                    <Link key={category} to={categoryLink(category)} className="category-tile">
                        <img src={image || NO_IMAGE} alt="" loading="lazy" />
                        <span className="category-name">{category}</span>
                        <span className="category-count">{count} {count === 1 ? 'piece' : 'pieces'}</span>
                    </Link>
                ))}
            </div>
        </section>
    )
}

const PROMOS = [
    { category: 'Outdoor', title: 'The Outdoor Edit', text: 'Pieces made for slow mornings outside.', image: 'poolside' },
    { category: 'Storage', title: 'A Place for Everything', text: 'Storage that keeps a room calm.', image: 'shelves' },
]

// promo only if its category has products
export const PromoBanners = () => {
    const { categories } = useSelector(state => state.catalog)
    const promos = PROMOS.filter(promo => categories.some(c => c.category === promo.category))
    if (!promos.length) return null

    return (
        <section className="store-container promo-grid" id="promo_banners">
            {promos.map(({ category, title, text, image }) => (
                <Link key={category} to={categoryLink(category)} className="promo-tile">
                    <img src={`${LIFESTYLE}/${image}.webp`} alt="" loading="lazy" />
                    <span className="promo-copy">
                        <strong>{title}</strong>
                        <span>{text}</span>
                    </span>
                </Link>
            ))}
        </section>
    )
}

const INSPIRATION = [
    { image: 'terrace', caption: 'Gather outside' },
    { image: 'entry-bench', caption: 'A softer entryway' },
    { image: 'dining', caption: 'Room at the table' },
    { image: 'patio', caption: 'Slow afternoons outside' },
]

export const Inspiration = () => (
    <section className="store-section store-container" id="inspiration">
        <h2>Inspiration for Every Room</h2>
        <div className="inspiration-grid">
            {INSPIRATION.map(({ image, caption }) => (
                <figure key={image}>
                    <img src={`${LIFESTYLE}/${image}.webp`} alt={caption} loading="lazy" />
                    <figcaption>{caption}</figcaption>
                </figure>
            ))}
        </div>
    </section>
)

export const BrandStory = () => (
    <section className="brand-story" id="brand_story">
        <div className="store-container">
            <h2>Furnitures that feels like home</h2>
            <p>
                Luna Interiors brings warm materials and simple shapes into every room, from the
                dining table to the patio. Order online, pay by card or cash on delivery, and follow
                every step of your order with an emailed receipt.
            </p>
        </div>
    </section>
)
