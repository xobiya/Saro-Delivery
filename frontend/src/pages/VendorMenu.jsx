import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaClock, FaMapMarkerAlt, FaShoppingCart, FaFilter } from 'react-icons/fa';
import api from '../utils/api';
import CartContext from '../context/CartContext';
import { useLocale } from '../context/LocaleContext.jsx';
import vendorFallbackImage from '../Assets/meat-vegetable-ethiopian-salads.jpg';
import { resolveVendorBannerUrl } from '../utils/vendorImages';

const VendorMenu = () => {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { addToCart, cartItems } = useContext(CartContext);
    const navigate = useNavigate();
    const { t } = useLocale();

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [vendorRes, productsRes] = await Promise.all([
                api.getCached(`/vendors/${id}`, { ttlMs: 10 * 60 * 1000 }),
                api.getCached(`/products/vendor/${id}`, { ttlMs: 2 * 60 * 1000 })
            ]);
            setVendor(vendorRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
        return cats.length > 0 ? ['all', ...cats] : ['all'];
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return products;
        return products.filter(p => p.category === selectedCategory);
    }, [products, selectedCategory]);

    const cartItemCount = useMemo(() => {
        return cartItems.filter(item => item.vendorId === id).reduce((acc, item) => acc + item.qty, 0);
    }, [cartItems, id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    if (!vendor) return <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>Vendor not found</div>;

    const bannerUrl = resolveVendorBannerUrl(vendor, vendorFallbackImage);

    return (
        <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            {/* Hero Header */}
            <div style={styles.header}>
                <div style={styles.headerOverlay}>
                    <div style={styles.headerContent}>
                        <button onClick={() => navigate('/vendors')} style={styles.backBtn} className="back-btn">
                            <FaArrowLeft /> Back to Vendors
                        </button>
                        <div style={styles.vendorInfo}>
                            <h1 style={styles.vendorTitle}>{vendor.businessName}</h1>
                            <p style={styles.vendorDescription}>{vendor.description}</p>
                            <div style={styles.vendorMeta}>
                                <div style={styles.metaItem}>
                                    <FaClock style={styles.metaIcon} />
                                    <span>25-35 min</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <FaMapMarkerAlt style={styles.metaIcon} />
                                    <span>Arba Minch</span>
                                </div>
                                {vendor.rating && (
                                    <div style={styles.metaItem}>
                                        <FaStar style={styles.metaIcon} />
                                        <span>{vendor.rating}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={styles.headerActions}>
                            <button
                                onClick={() => navigate('/checkout')}
                                style={styles.cartBtn}
                                className="btn btn-outline"
                            >
                                <FaShoppingCart />
                                {cartItemCount > 0 && <span style={styles.cartBadge}>{cartItemCount}</span>}
                            </button>
                        </div>
                    </div>
                </div>
                <div style={{ ...styles.headerImage, backgroundImage: `url("${bannerUrl}")` }}></div>
            </div>

            {/* Content */}
            <div style={styles.container}>
                {/* Category Filter */}
                {categories.length > 1 && (
                    <div style={styles.filterSection}>
                        <div style={styles.filterHeader}>
                            <FaFilter style={styles.filterIcon} />
                            <h3 style={styles.filterTitle}>Categories</h3>
                        </div>
                        <div style={styles.filterButtons}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        ...styles.filterBtn,
                                        ...(selectedCategory === cat ? styles.filterBtnActive : {})
                                    }}
                                >
                                    {cat === 'all' ? 'All Items' : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div style={styles.grid}>
                    {filteredProducts.map((product) => (
                        <div key={product._id} style={styles.productCard} className="product-card">
                            <div style={styles.productImageContainer}>
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        style={styles.productImage}
                                        className="product-image"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div style={styles.productPlaceholder}>
                                        <span>No Image</span>
                                    </div>
                                )}
                            </div>
                            <div style={styles.productContent}>
                                <div style={styles.productHeader}>
                                    <h3 style={styles.productName}>{product.name}</h3>
                                    <span style={styles.productPrice}>{product.price} ETB</span>
                                </div>
                                <p style={styles.productDescription}>{product.description}</p>
                                {product.category && (
                                    <span style={styles.productCategory}>{product.category}</span>
                                )}
                                <button
                                    onClick={() => addToCart(product, vendor._id)}
                                    style={styles.addToCartBtn}
                                    className="btn btn-primary"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div style={styles.emptyState}>
                        <FaFilter style={{ fontSize: '64px', color: '#ccc', marginBottom: '1rem' }} />
                        <h3>No items found</h3>
                        <p>Try selecting a different category</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    header: {
        position: 'relative',
        height: '300px',
        overflow: 'hidden',
    },
    headerImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))',
        display: 'flex',
        alignItems: 'center',
    },
    headerContent: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 var(--space-4)',
        color: 'var(--text-inverse)',
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'var(--text-inverse)',
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        backdropFilter: 'blur(10px)',
        transition: 'all var(--transition-fast)',
        marginBottom: 'var(--space-6)',
    },
    vendorInfo: {
        marginBottom: 'var(--space-6)',
    },
    vendorTitle: {
        fontSize: 'var(--font-size-4xl)',
        fontWeight: 'var(--font-weight-bold)',
        marginBottom: 'var(--space-2)',
        background: 'linear-gradient(135deg, #ffffff, #f5f5f5)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    vendorDescription: {
        fontSize: 'var(--font-size-lg)',
        opacity: 0.9,
        marginBottom: 'var(--space-4)',
    },
    vendorMeta: {
        display: 'flex',
        gap: 'var(--space-6)',
        flexWrap: 'wrap',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontSize: 'var(--font-size-sm)',
        opacity: 0.9,
    },
    metaIcon: {
        fontSize: 'var(--font-size-base)',
        color: 'var(--color-primary-400)',
    },
    headerActions: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    cartBtn: {
        position: 'relative',
        padding: 'var(--space-3)',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'var(--text-inverse)',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
    },
    cartBadge: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        backgroundColor: 'var(--color-secondary-500)',
        color: 'var(--text-inverse)',
        borderRadius: 'var(--radius-full)',
        padding: '2px 6px',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-bold)',
        minWidth: '20px',
        textAlign: 'center',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)',
    },
    filterSection: {
        marginBottom: 'var(--space-8)',
        padding: 'var(--space-6)',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-neutral-200)',
    },
    filterHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
    },
    filterIcon: {
        color: 'var(--color-primary-500)',
        fontSize: 'var(--font-size-lg)',
    },
    filterTitle: {
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
    },
    filterButtons: {
        display: 'flex',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
    },
    filterBtn: {
        padding: 'var(--space-2) var(--space-4)',
        border: '1px solid var(--color-neutral-300)',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        transition: 'all var(--transition-fast)',
    },
    filterBtnActive: {
        backgroundColor: 'var(--color-primary-500)',
        color: 'var(--text-inverse)',
        borderColor: 'var(--color-primary-500)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--space-6)',
    },
    productCard: {
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-neutral-200)',
        transition: 'all var(--transition-fast)',
    },
    productImageContainer: {
        height: '200px',
        overflow: 'hidden',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform var(--transition-fast)',
    },
    productPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--color-neutral-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontSize: 'var(--font-size-sm)',
    },
    productContent: {
        padding: 'var(--space-5)',
    },
    productHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--space-3)',
    },
    productName: {
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
        flex: 1,
    },
    productPrice: {
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-primary-600)',
    },
    productDescription: {
        color: 'var(--text-secondary)',
        fontSize: 'var(--font-size-sm)',
        lineHeight: 'var(--line-height-relaxed)',
        marginBottom: 'var(--space-3)',
    },
    productCategory: {
        display: 'inline-block',
        backgroundColor: 'var(--color-secondary-100)',
        color: 'var(--color-secondary-700)',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
        marginBottom: 'var(--space-4)',
    },
    addToCartBtn: {
        width: '100%',
        padding: 'var(--space-3)',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-medium)',
    },
    emptyState: {
        textAlign: 'center',
        padding: 'var(--space-16)',
        color: 'var(--text-secondary)',
        gridColumn: '1 / -1',
    },
};

export default VendorMenu;
