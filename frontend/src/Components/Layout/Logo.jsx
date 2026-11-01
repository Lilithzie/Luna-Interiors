import logoWithText from '../../assets/Luna Interiors Logo with Text.png'
import logoSymbol from '../../assets/Luna Interiors Logo.png'

// The logos are cream and gold on transparent, so they must sit on a dark background.
// Size them by height only (see .luna-logo) so the aspect ratio is never changed.
const Logo = ({ symbol = false, className = '' }) => (
    <img
        className={`luna-logo ${className}`}
        src={symbol ? logoSymbol : logoWithText}
        alt="Luna Interiors"
    />
)

export default Logo
