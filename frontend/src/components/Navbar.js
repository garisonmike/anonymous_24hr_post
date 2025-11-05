/**
 * Navigation bar component
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">
                    Anonymous Platform
                </Link>
                <ul className="navbar-links">
                    <li>
                        <Link to="/">Feed</Link>
                    </li>
                    {isAuthenticated ? (
                        <>
                            <li>
                                <Link to="/my-posts">My Posts</Link>
                            </li>
                            {user?.is_staff && (
                                <li>
                                    <Link to="/admin-dashboard">Admin</Link>
                                </li>
                            )}
                            <li>
                                <button onClick={handleLogout}>Logout</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                            <li>
                                <Link to="/register">Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
