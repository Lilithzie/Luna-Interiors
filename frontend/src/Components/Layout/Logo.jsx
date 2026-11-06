import logoWithText from '../../assets/Luna Interiors Logo with Text.png'
import logoSymbol from '../../assets/Luna Interiors Logo.png'

// logos need a dark background
// size by height only
const Logo = ({ symbol = false, className = '' }) => (
    <img
        className={`luna-logo ${className}`}
        src={symbol ? logoSymbol : logoWithText}
        alt="Luna Interiors"
    />
)

export default Logo
