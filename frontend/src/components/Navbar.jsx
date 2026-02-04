import { Link, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { useLocale } from '../context/LocaleContext.jsx';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const { locale, setLanguage, t } = useLocale();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const cartCount = Array.isArray(cartItems)
        ? cartItems.reduce((acc, item) => acc + (item?.qty || 0), 0)
        : 0;

    const isActive = (path) => location.pathname === path;

    const getWorkPath = () => {
        if (!user) return '/login';
        if (user.role === 'driver') return '/driver/dashboard';
        if (user.role === 'vendor' || user.role === 'restaurant') return '/vendor-dashboard';
        return '/profile';
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
                    {t('brand')}
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
                        {t('nav.home')}
                    </Link>
                    <Link
                        to="/vendors"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/vendors') ? styles.activeLink : {})
                        }}
                    >
                        {t('nav.vendors')}
                    </Link>
                    <Link
                        to="/about"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/about') ? styles.activeLink : {})
                        }}
                    >
                        {t('nav.about')}
                    </Link>
                    <Link
                        to="/contact"
                        style={{
                            ...styles.navLink,
                            ...(isActive('/contact') ? styles.activeLink : {})
                        }}
                    >
                        {t('nav.contact')}
                    </Link>
                </div>

                {/* Desktop Auth Links */}
                <div style={styles.authLinks} className="hide-mobile">
                    <Link to="/checkout" className="btn btn-outline" style={styles.checkoutBtn}>
                        {t('nav.checkout')}
                        {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
                    </Link>
                    <div style={styles.languageToggle} aria-label="Language">
                        <button
                            type="button"
                            onClick={() => setLanguage('en')}
                            style={{
                                ...styles.langBtn,
                                ...(locale === 'en' ? styles.langBtnActive : {})
                            }}
                            aria-pressed={locale === 'en'}
                        >
                            EN
                        </button>
                        <button
                            type="button"
                            onClick={() => setLanguage('am')}
                            style={{
                                ...styles.langBtn,
                                ...(locale === 'am' ? styles.langBtnActive : {})
                            }}
                            aria-pressed={locale === 'am'}
                        >
                            አማ
                        </button>
                    </div>
                    {user ? (
                        <>
                            <Link to="/profile" style={styles.navLink}>
                                {t('nav.profile', 'Profile')}
                            </Link>
                            {(user.role === 'driver' || user.role === 'vendor' || user.role === 'restaurant' || user.role === 'admin') ? (
                                <Link to={getWorkPath()} style={styles.navLink}>
                                    {t('nav.work', 'Work')}
                                </Link>
                            ) : null}
                            <span style={styles.welcome}>Hi, {user.name}</span>
                            <button onClick={handleLogout} className="btn" style={styles.logoutBtn}>
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.navLink}>{t('nav.login')}</Link>
                            <Link to="/register" className="btn" style={styles.registerBtn}>
                                {t('nav.register')}
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
                    <Link to="/checkout" style={styles.mobileLink} onClick={closeMobileMenu}>
                        {t('nav.checkout')}{cartCount > 0 ? ` (${cartCount})` : ''}
                    </Link>
                    <Link to="/" style={styles.mobileLink} onClick={closeMobileMenu}>
                        {t('nav.home')}
                    </Link>
                    <Link to="/vendors" style={styles.mobileLink} onClick={closeMobileMenu}>
                        {t('nav.vendors')}
                    </Link>
                    <Link to="/about" style={styles.mobileLink} onClick={closeMobileMenu}>
                        {t('nav.about')}
                    </Link>
                    <Link to="/contact" style={styles.mobileLink} onClick={closeMobileMenu}>
                        {t('nav.contact')}
                    </Link>

                    <div style={styles.mobileDivider}></div>

                    <div style={styles.mobileLanguage}>
                        <button
                            type="button"
                            onClick={() => {
                                setLanguage('en');
                                closeMobileMenu();
                            }}
                            className="btn btn-outline"
                            style={{ width: '100%' }}
                        >
                            EN
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLanguage('am');
                                closeMobileMenu();
                            }}
                            className="btn btn-outline"
                            style={{ width: '100%' }}
                        >
                            አማ
                        </button>
                    </div>

                    {user ? (
                        <>
                            <Link to="/profile" style={styles.mobileLink} onClick={closeMobileMenu}>
                                {t('nav.profile', 'Profile')}
                            </Link>
                            {(user.role === 'driver' || user.role === 'vendor' || user.role === 'restaurant' || user.role === 'admin') ? (
                                <Link to={getWorkPath()} style={styles.mobileLink} onClick={closeMobileMenu}>
                                    {t('nav.work', 'Work')}
                                </Link>
                            ) : null}
                            <span style={styles.mobileWelcome}>Signed in as {user.name}</span>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%' }}>
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.mobileLink} onClick={closeMobileMenu}>
                                {t('nav.login')}
                            </Link>
                            <Link to="/register" onClick={closeMobileMenu}>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    {t('nav.register')}
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
    checkoutBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        borderColor: 'rgba(255, 255, 255, 0.35)',
        color: 'rgba(255, 255, 255, 0.95)',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    cartBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '22px',
        height: '22px',
        padding: '0 6px',
        borderRadius: '999px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        color: 'var(--color-primary-600)',
        fontSize: '12px',
        fontWeight: '800',
        lineHeight: 1,
    },
    languageToggle: {
        display: 'flex',
        gap: 'var(--space-2)',
        alignItems: 'center',
        padding: '2px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    langBtn: {
        minWidth: '44px',
        minHeight: '36px',
        padding: '0 var(--space-3)',
        borderRadius: 'var(--radius-full)',
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 'var(--font-weight-semibold)',
        fontSize: 'var(--font-size-sm)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        backgroundColor: 'transparent',
    },
    langBtnActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: 'var(--color-primary-700)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
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
    mobileLanguage: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-3)',
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
