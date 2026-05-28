import { Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { useLocale } from '../context/LocaleContext.jsx';
import { FaBell, FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import saroLogo from '../Assets/sarodelivery-removebg-preview.png';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const { locale, setLanguage, t } = useLocale();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const cartCount = Array.isArray(cartItems)
        ? cartItems.reduce((acc, item) => acc + (item?.qty || 0), 0)
        : 0;

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-gray-900 text-white ${scrolled ? 'shadow-lg py-3' : 'py-5'} navbar`}>
            <div className="container navbar-container">
                {/* Logo */}
                <Link to="/" className="nav-logo flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    <img src={saroLogo} alt="Saro Delivery" className="h-10 sm:h-12 w-auto object-contain" />
                </Link>

                {/* Desktop Navigation */}
                <div className="nav-links hide-mobile">
                    <Link to="/" className={`nav-link text-gray-100 hover:text-white ${isActive('/') ? 'active' : ''}`}>{t('nav.home')}</Link>
                    <Link to="/vendors" className={`nav-link text-gray-100 hover:text-white ${isActive('/vendors') ? 'active' : ''}`}>{t('nav.vendors')}</Link>
                    <Link to="/about" className={`nav-link text-gray-100 hover:text-white ${isActive('/about') ? 'active' : ''}`}>{t('nav.about')}</Link>
                    <Link to="/contact" className={`nav-link text-gray-100 hover:text-white ${isActive('/contact') ? 'active' : ''}`}>{t('nav.contact')}</Link>
                    {user && user.role === 'admin' && (
                        <Link to="/admin/dashboard" className={`nav-link font-bold text-orange-400 hover:text-orange-300 ${isActive('/admin/dashboard') ? 'active' : ''}`}>Admin</Link>
                    )}
                </div>

                {/* Actions */}
                <div className="nav-actions">
                    <div className="language-toggle hide-mobile">
                        <button 
                             className={`btn-ghost ${locale === 'en' ? 'active' : ''}`} 
                            onClick={() => setLanguage('en')}
                            style={{ color: '#fff', opacity: locale === 'en' ? 1 : 0.6 }}
                        >EN</button>
                        <button 
                            className={`btn-ghost ${locale === 'am' ? 'active' : ''}`} 
                            onClick={() => setLanguage('am')}
                            style={{ color: '#fff', opacity: locale === 'am' ? 1 : 0.6 }}
                        >አማ</button>
                    </div>

                    <div className="notification-bell text-white">
                        <FaBell />
                        <span className="notification-badge">2</span>
                    </div>

                    <Link to="/checkout" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '50px' }}>
                        <FaShoppingCart />
                        {cartCount > 0 && <span style={{ marginLeft: '4px' }}>{cartCount}</span>}
                    </Link>

                    {user ? (
                        <div className="hide-mobile flex items-center gap-4">
                            <Link to="/profile" className="flex items-center gap-2" style={{ color: '#fff', textDecoration: 'none' }}>
                                <FaUser />
                                <span style={{ fontSize: '0.9rem' }}>{user.name ? user.name.split(' ')[0] : 'User'}</span>
                            </Link>
                            <button onClick={handleLogout} className="btn-ghost" style={{ color: '#fff' }}>
                                <FaSignOutAlt />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-outline hide-mobile hover:bg-white hover:text-gray-900 transition-colors" style={{ borderColor: '#fff', color: '#fff' }}>
                            {t('nav.login')}
                        </Link>
                    )}

                    {/* Mobile Toggle */}
                    <button className="hide-desktop btn-ghost" onClick={() => setMobileMenuOpen(true)} style={{ color: '#fff', fontSize: '1.5rem' }}>
                        <FaBars />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-menu-drawer" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center">
                            <img src={saroLogo} alt="Saro Delivery" className="h-8 w-auto object-contain" />
                        </div>
                        <button className="btn-ghost" onClick={() => setMobileMenuOpen(false)}><FaTimes style={{ fontSize: '1.5rem' }} /></button>
                    </div>
                    <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>{t('nav.home')}</Link>
                    <Link to="/vendors" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>{t('nav.vendors')}</Link>
                    <Link to="/about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>{t('nav.about')}</Link>
                    <Link to="/contact" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>{t('nav.contact')}</Link>
                    {user && user.role === 'admin' && (
                        <Link to="/admin/dashboard" className="mobile-nav-link font-bold text-orange-500" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                    )}
                    
                    <div className="mt-auto pt-10">
                        {user ? (
                            <div className="flex flex-col gap-4">
                                <Link to="/profile" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>
                                    <FaUser style={{ marginRight: '8px' }} /> {user.name || 'User'}
                                </Link>
                                <button onClick={handleLogout} className="btn btn-primary">Logout</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link to="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                                <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
