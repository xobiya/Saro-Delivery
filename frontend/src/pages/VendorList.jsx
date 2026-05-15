import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaUtensils, FaHotel, FaStar, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../utils/api';
import { useLocale } from '../context/LocaleContext.jsx';
import vendorFallbackImage from '../Assets/meat-vegetable-ethiopian-salads.jpg';
import { resolveVendorBannerUrl } from '../utils/vendorImages';

const VendorList = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();
    const { t } = useLocale();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchVendors();
        // Set initial category from URL params
        const type = searchParams.get('type');
        if (type) setSelectedCategory(type);
    }, [searchParams]);

    const fetchVendors = async () => {
        try {
            const { data } = await api.getCached('/vendors', { ttlMs: 5 * 60 * 1000 });
            setVendors(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => {
        const allCats = vendors.flatMap(v => v.categories);
        return [...new Set(allCats)].sort();
    }, [vendors]);

    const filteredVendors = useMemo(() => {
        return vendors.filter(vendor => {
            const matchesSearch = vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 vendor.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' ||
                                   vendor.categories.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase()));
            return matchesSearch && matchesCategory;
        });
    }, [vendors, searchTerm, selectedCategory]);

    const restaurants = filteredVendors.filter(v => v.categories.some(c =>
        c.toLowerCase().includes('restaurant') ||
        c.toLowerCase().includes('food') ||
        c.toLowerCase().includes('cafe')
    ));
    const hotels = filteredVendors.filter(v => v.categories.some(c => c.toLowerCase().includes('hotel')));

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Discover Amazing Places</h1>
                    <p style={styles.heroSubtitle}>Find the best restaurants and hotels in Arba Minch</p>

                    {/* Search Bar */}
                    <div style={styles.searchContainer}>
                        <div style={styles.searchBar}>
                            <FaSearch style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search restaurants, hotels..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                style={styles.filterButton}
                                className={showFilters ? 'btn-primary' : 'btn-outline'}
                            >
                                <FaFilter />
                            </button>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div style={styles.filters}>
                                <div style={styles.filterGroup}>
                                    <label style={styles.filterLabel}>Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        style={styles.filterSelect}
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="restaurant">Restaurants</option>
                                        <option value="hotel">Hotels</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content */}
            <div style={styles.container}>
                {/* Quick Stats */}
                <div style={styles.stats}>
                    <div style={styles.stat}>
                        <FaUtensils style={styles.statIcon} />
                        <div>
                            <h3>{restaurants.length}</h3>
                            <p>Restaurants</p>
                        </div>
                    </div>
                    <div style={styles.stat}>
                        <FaHotel style={styles.statIcon} />
                        <div>
                            <h3>{hotels.length}</h3>
                            <p>Hotels</p>
                        </div>
                    </div>
                    <div style={styles.stat}>
                        <FaStar style={styles.statIcon} />
                        <div>
                            <h3>4.5+</h3>
                            <p>Avg Rating</p>
                        </div>
                    </div>
                </div>

                {/* Vendor Grid */}
                <div style={styles.grid}>
                    {filteredVendors.map((vendor) => (
                        <div key={vendor._id} style={styles.card} className="vendor-card" onClick={() => navigate(`/menu/${vendor._id}`)}>
                            <div style={styles.cardImageContainer}>
                                <img
                                    src={resolveVendorBannerUrl(vendor, vendorFallbackImage)}
                                    alt={vendor.businessName}
                                    style={styles.cardImage}
                                    className="card-image"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div style={styles.cardOverlay}>
                                    <span style={vendor.isOpen ? styles.openBadge : styles.closedBadge}>
                                        {vendor.isOpen ? 'OPEN NOW' : 'CLOSED'}
                                    </span>
                                    {vendor.rating && (
                                        <span style={styles.ratingBadge}>
                                            <FaStar style={{ fontSize: '12px', marginRight: '4px' }} />
                                            {vendor.rating}
                                        </span>
                                    )}
                                </div>
                                {vendor.logoUrl && (
                                    <img src={vendor.logoUrl} alt="logo" style={styles.logo} />
                                )}
                            </div>
                            <div style={styles.cardContent}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.cardTitle}>{vendor.businessName}</h3>
                                    <div style={styles.deliveryInfo}>
                                        <FaClock style={{ marginRight: '4px', color: '#666' }} />
                                        <span>25-35 min</span>
                                    </div>
                                </div>
                                <p style={styles.cardDescription}>
                                    {vendor.description || 'Delicious food and great service'}
                                </p>
                                <div style={styles.cardCategories}>
                                    {vendor.categories.slice(0, 2).map(cat => (
                                        <span key={cat} style={styles.categoryTag}>{cat}</span>
                                    ))}
                                </div>
                                <div style={styles.cardFooter}>
                                    <div style={styles.location}>
                                        <FaMapMarkerAlt style={{ marginRight: '6px', color: '#e74c3c' }} />
                                        <span>Arba Minch</span>
                                    </div>
                                    <span style={styles.viewMenu}>View Menu →</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredVendors.length === 0 && (
                    <div style={styles.emptyState}>
                        <FaUtensils style={{ fontSize: '64px', color: '#ccc', marginBottom: '1rem' }} />
                        <h3>No places found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    hero: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: 'var(--space-16) 0 var(--space-12) 0',
        textAlign: 'center',
    },
    heroContent: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 var(--space-4)',
    },
    heroTitle: {
        fontSize: 'var(--font-size-4xl)',
        fontWeight: 'var(--font-weight-bold)',
        marginBottom: 'var(--space-4)',
        background: 'linear-gradient(135deg, #ffffff, #f5f5f5)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    heroSubtitle: {
        fontSize: 'var(--font-size-lg)',
        opacity: 0.9,
        marginBottom: 'var(--space-8)',
    },
    searchContainer: {
        maxWidth: '600px',
        margin: '0 auto',
    },
    searchBar: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-2)',
        boxShadow: 'var(--shadow-lg)',
        marginBottom: 'var(--space-4)',
    },
    searchIcon: {
        color: '#666',
        margin: '0 var(--space-3)',
        fontSize: 'var(--font-size-lg)',
    },
    searchInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: 'var(--font-size-base)',
        padding: 'var(--space-2)',
    },
    filterButton: {
        border: 'none',
        background: 'none',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        fontSize: 'var(--font-size-base)',
        marginLeft: 'var(--space-2)',
    },
    filters: {
        backgroundColor: '#fff',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: 'var(--space-4)',
    },
    filterGroup: {
        marginBottom: 'var(--space-3)',
    },
    filterLabel: {
        display: 'block',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-2)',
    },
    filterSelect: {
        width: '100%',
        padding: 'var(--space-3)',
        border: '1px solid var(--color-neutral-300)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-base)',
        backgroundColor: 'var(--bg-primary)',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)',
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-12)',
    },
    stat: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
    },
    statIcon: {
        fontSize: 'var(--font-size-2xl)',
        color: 'var(--color-primary-500)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--space-6)',
    },
    card: {
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
        border: '1px solid var(--color-neutral-200)',
    },
    cardImageContainer: {
        position: 'relative',
        height: '200px',
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform var(--transition-fast)',
    },
    cardOverlay: {
        position: 'absolute',
        top: 'var(--space-3)',
        left: 'var(--space-3)',
        right: 'var(--space-3)',
        display: 'flex',
        justifyContent: 'space-between',
    },
    openBadge: {
        backgroundColor: 'var(--color-secondary-500)',
        color: 'var(--text-inverse)',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-bold)',
    },
    closedBadge: {
        backgroundColor: 'var(--color-error)',
        color: 'var(--text-inverse)',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-bold)',
    },
    ratingBadge: {
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--color-warning)',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-bold)',
        display: 'flex',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
    },
    logo: {
        position: 'absolute',
        bottom: 'var(--space-3)',
        right: 'var(--space-3)',
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-full)',
        objectFit: 'cover',
        border: '3px solid var(--bg-primary)',
        boxShadow: 'var(--shadow-md)',
    },
    cardContent: {
        padding: 'var(--space-5)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--space-3)',
    },
    cardTitle: {
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)',
        margin: 0,
        flex: 1,
    },
    deliveryInfo: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--text-secondary)',
    },
    cardDescription: {
        color: 'var(--text-secondary)',
        fontSize: 'var(--font-size-sm)',
        lineHeight: 'var(--line-height-relaxed)',
        margin: 'var(--space-2) 0',
    },
    cardCategories: {
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
        flexWrap: 'wrap',
    },
    categoryTag: {
        backgroundColor: 'var(--color-primary-50)',
        color: 'var(--color-primary-700)',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'var(--space-3)',
        borderTop: '1px solid var(--color-neutral-200)',
    },
    location: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--text-secondary)',
    },
    viewMenu: {
        color: 'var(--color-primary-600)',
        fontWeight: 'var(--font-weight-medium)',
        fontSize: 'var(--font-size-sm)',
        transition: 'color var(--transition-fast)',
    },
    emptyState: {
        textAlign: 'center',
        padding: 'var(--space-16)',
        color: 'var(--text-secondary)',
    },
};

export default VendorList;
