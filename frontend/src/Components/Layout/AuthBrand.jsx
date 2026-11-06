import { Link } from 'react-router-dom'
import Logo from './Logo'

// dark band for the logo
const AuthBrand = () => (
    <div className="auth-brand">
        <Link to="/"><Logo /></Link>
    </div>
)

export default AuthBrand
