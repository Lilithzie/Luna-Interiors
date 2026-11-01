import { Link } from 'react-router-dom'
import Logo from './Logo'

// Dark band at the top of the login / register forms: the logo text needs a dark background
const AuthBrand = () => (
    <div className="auth-brand">
        <Link to="/"><Logo /></Link>
    </div>
)

export default AuthBrand
