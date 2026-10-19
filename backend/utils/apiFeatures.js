class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
        this.conditions = {};
    }

    // ?keyword=sofa
    search() {
        if (this.queryStr.keyword) {
            const escaped = String(this.queryStr.keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            this.conditions.name = { $regex: escaped, $options: 'i' };
        }
        return this;
    }

    // MP2 filters:
    //   price[gte] / price[lte]          -> price filter
    //   category                         -> category filter (comma separated allowed)
    //   ratings[gte]                     -> minimum average rating
    //   numOfReviews[gte]                -> minimum number of reviews (review filter)
    filter() {
        const q = this.queryStr;
        const num = (v) => (v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v));

        const priceGte = num(q['price[gte]']);
        const priceLte = num(q['price[lte]']);
        if (priceGte !== null || priceLte !== null) {
            this.conditions.price = {};
            if (priceGte !== null) this.conditions.price.$gte = priceGte;
            if (priceLte !== null) this.conditions.price.$lte = priceLte;
        }

        if (q.category) {
            const cats = String(q.category).split(',').map(c => c.trim()).filter(Boolean);
            if (cats.length) this.conditions.category = { $in: cats };
        }

        const ratingsGte = num(q['ratings[gte]']);
        if (ratingsGte !== null && ratingsGte > 0) {
            this.conditions.ratings = { $gte: ratingsGte };
        }

        const reviewsGte = num(q['numOfReviews[gte]']);
        if (reviewsGte !== null && reviewsGte > 0) {
            this.conditions.numOfReviews = { $gte: reviewsGte };
        }

        this.query = this.query.find(this.conditions);
        return this;
    }

    sort() {
        const sorts = {
            newest: { createdAt: -1 },
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            rating: { ratings: -1, numOfReviews: -1 },
        };
        this.query = this.query.sort(sorts[this.queryStr.sort] || sorts.newest);
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);
        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}
module.exports = APIFeatures
