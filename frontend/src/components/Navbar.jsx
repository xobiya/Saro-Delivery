import { Link, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const getDashboardPath = () => {
        if (!user) return '/login';
        if (user.role === 'driver') return '/driver/dashboard';
        if (user.role === 'vendor' || user.role === 'restaurant') return '/vendor-dashboard';
        return '/dashboard';
    };

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav style={styles.nav}>
            <div className="container" style={styles.container}>
                {/* Logo */}
                <Link to="/" style={styles.logo} onClick={closeMobileMenu}>
                    Saro Delivery
                </Link>

                {/* Desktop Navigation */}
                <div style={styles.centerLinks} className="hide-mobile">
                    <Link
                        to="/"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/') ? styles.activeLink : {})
                        }}
                    >
                        Home
                    </Link>
                    <Link
                        to="/about"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/about') ? styles.activeLink : {})
                        }}
                    >
                        About
                    </Link>
                    <Link
                        to="/contact"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/contact') ? styles.activeLink : {})
                        }}
                    >
                        Contact
                    </Link>
                </div>

                {/* Desktop Auth Links */}
                <div style={styles.authLinks} className="hide-mobile">
                    {user ? (
                        <>
                            <Link to={getDashboardPath()} style={styles.navLink}>
                                Dashboard
                            </Link>
                            <span style={styles.welcome}>Hi, {user.name}</span>
                            <button onClick={handleLogout} className="btn" style={styles.logoutBtn}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.navLink}>Login</Link>
                            <Link to="/register" className="btn" style={styles.registerBtn}>
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={styles.hamburger}
                    className="hide-desktop"
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div style={styles.mobileMenu} className="hide-desktop slide-up">
                    <Link to="/" style={styles.mobileLink} onClick={closeMobileMenu}>
                        Home
                    </Link>
                    <Link to="/about" style={styles.mobileLink} onClick={closeMobileMenu}>
                        About
                    </Link>
                    <Link to="/contact" style={styles.mobileLink} onClick={closeMobileMenu}>
                        Contact
                    </Link>

                    <div style={styles.mobileDivider}></div>

                    {user ? (
                        <>
                            <Link to={getDashboardPath()} style={styles.mobileLink} onClick={closeMobileMenu}>
                                Dashboard
                            </Link>
                            <span style={styles.mobileWelcome}>Signed in as {user.name}</span>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.mobileLink} onClick={closeMobileMenu}>
                                Login
                            </Link>
                            <Link to="/register" onClick={closeMobileMenu}>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    Register
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

const styles = {
    nav: {
        backgroundColor: 'var(--color-primary-500)',
        padding: 'var(--space-4) 0',
        marginBottom: 'var(--space-8)',
        boxShadow: 'var(--shadow-md)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    logo: {
        color: 'var(--color-neutral-0)',
        fontSize: 'var(--font-size-2xl)',
        fontWeight: 'var(--font-weight-bold)',
        textDecoration: 'none',
        transition: 'opacity var(--transition-fast)',
    },
    centerLinks: {
        display: 'flex',
        gap: 'var(--space-6)',
        alignItems: 'center',
    },
    authLinks: {
        display: 'flex',
        gap: 'var(--space-4)',
        alignItems: 'center',
    },
    navLink: {
        color: 'rgba(255, 255, 255, 0.9)',
        textDecoration: 'none',
        fontWeight: 'var(--font-weight-medium)',
        fontSize: 'var(--font-size-base)',
        transition: 'color var(--transition-fast)',
        position: 'relative',
        padding: 'var(--space-2) var(--space-1)',
    },
    activeLink: {
        color: 'var(--color-neutral-0)',
        borderBottom: '2px solid var(--color-neutral-0)',
    },
    welcome: {
        color: 'var(--color-neutral-0)',
        fontSize: 'var(--font-size-sm)',
    },
    logoutBtn: {
        backgroundColor: 'var(--color-neutral-0)',
        color: 'var(--color-primary-600)',
        borderRadius: 'var(--radius-full)',
        fontWeight: 'var(--font-weight-semibold)',
        fontSize: 'var(--font-size-sm)',
        padding: 'var(--space-2) var(--space-5)',
    },
    registerBtn: {
        backgroundColor: 'transparent',
        color: 'var(--color-neutral-0)',
        border: '2px solid var(--color-neutral-0)',
        borderRadius: 'var(--radius-full)',
        fontWeight: 'var(--font-weight-semibold)',
        fontSize: 'var(--font-size-sm)',
        padding: 'var(--space-2) var(--space-5)',
    },
    hamburger: {
        background: 'none',
        border: 'none',
        color: 'var(--color-neutral-0)',
        fontSize: 'var(--font-size-3xl)',
        cursor: 'pointer',
        padding: 'var(--space-2)',
        minWidth: '44px',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mobileMenu: {
        backgroundColor: 'var(--color-primary-600)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    mobileLink: {
        color: 'var(--color-neutral-0)',
        textDecoration: 'none',
        padding: 'var(--space-3)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-medium)',
        transition: 'background-color var(--transition-fast)',
        display: 'block',
    },
    mobileDivider: {
        height: '1px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        margin: 'var(--space-2) 0',
    },
    mobileWelcome: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 'var(--font-size-sm)',
        padding: 'var(--space-2)',
        textAlign: 'center',
    },
};

export default Navbar;
