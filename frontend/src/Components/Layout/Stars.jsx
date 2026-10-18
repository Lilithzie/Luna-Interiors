import React from 'react'

// read-only star bar (uses the .rating-outer/.rating-inner css from the reference system)
export const Stars = ({ value = 0 }) => (
    <div className="rating-outer d-inline-block" title={`${Number(value).toFixed(1)} / 5`}>
        <div className="rating-inner" style={{ width: `${(Number(value) / 5) * 100}%` }}></div>
    </div>
)

// clickable star input for writing a review
export const StarInput = ({ value, onChange }) => {
    const [hover, setHover] = React.useState(0)
    return (
        <div className="star-input" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map(n => (
                <span
                    key={n}
                    role="radio"
                    aria-checked={value === n}
                    className={(hover || value) >= n ? 'on' : ''}
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                >★</span>
            ))}
        </div>
    )
}
