import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
    FaUtensils,
    FaHotel,
    FaShippingFast,
    FaShieldAlt,
    FaStar,
    FaClock,
    FaMapMarkerAlt,
    FaArrowRight
} from 'react-icons/fa';

const Home = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const { data } = await api.get('/vendors');
                setVendors(data);
            } catch (error) {
                console.error('Error fetching vendors:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const restaurants = vendors.filter(v => v.categories.some(c =>
        c.toLowerCase().includes('restaurant') ||
        c.toLowerCase().includes('food') ||
        c.toLowerCase().includes('cafe')
    ));
    const hotels = vendors.filter(v => v.categories.some(c => c.toLowerCase().includes('hotel')));

    const featuredRestaurants = restaurants.length > 0 ? restaurants.slice(0, 4) : vendors.slice(0, 4);
    const featuredHotels = hotels.length > 0 ? hotels.slice(0, 4) : vendors.slice(4, 8);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading delicious options...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Enhanced Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <div style={styles.heroText}>
                        <h1 style={styles.heroTitle}>
                            Taste the Best of <span style={styles.highlight}>Arba Minch</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Discover amazing restaurants and hotels with fast delivery right to your doorstep.
                            Fresh food, quick service, and unforgettable flavors.
                        </p>
                        <div style={styles.heroButtons}>
                            <Link to="/vendors" style={styles.primaryButton}>
                                Order Now <FaArrowRight style={{ marginLeft: '8px' }} />
                            </Link>
                            <Link to="/about" style={styles.secondaryButton}>
                                How It Works
                            </Link>
                        </div>
                        <div style={styles.heroStats}>
                            <div style={styles.stat}>
                                <FaUtensils style={styles.statIcon} />
                                <div>
                                    <h3>{restaurants.length}+</h3>
                                    <p>Restaurants</p>
                                </div>
                            </div>
                            <div style={styles.stat}>
                                <FaHotel style={styles.statIcon} />
                                <div>
                                    <h3>{hotels.length}+</h3>
                                    <p>Hotels</p>
                                </div>
                            </div>
                            <div style={styles.stat}>
                                <FaShippingFast style={styles.statIcon} />
                                <div>
                                    <h3>30min</h3>
                                    <p>Avg. Delivery</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={styles.heroImage}>
                        <img
                            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop"
                            alt="Delicious Food"
                            style={styles.foodImage}
                        />
                    </div>
                </div>
            </section>

            {/* Featured Restaurants Section */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitleContainer}>
                        <FaUtensils style={styles.sectionIcon} />
                        <h2 style={styles.sectionTitle}>Popular Restaurants</h2>
                    </div>
                    <p style={styles.sectionSubtitle}>Curated selection of the best dining spots in town</p>
                </div>

                <div style={styles.grid}>
                    {featuredRestaurants.map(vendor => (
                        <div style={styles.card} key={vendor._id}>
                            <Link to={`/menu/${vendor._id}`} style={styles.cardLink}>
                                <div style={styles.cardImageContainer}>
                                    <img
                                        src={vendor.bannerUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'}
                                        alt={vendor.businessName}
                                        style={styles.cardImage}
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
                                </div>
                                <div style={styles.cardContent}>
                                    <div style={styles.cardHeader}>
                                        <h3 style={styles.cardTitle}>{vendor.businessName}</h3>
                                        <div style={styles.deliveryInfo}>
                                            <FaClock style={{ marginRight: '4px', color: '#666' }} />
                                            <span>25-35 min</span>
                                        </div>
                                    </div>
                                    <p style={styles.cardCategories}>
                                        {vendor.categories.slice(0, 2).join(' • ')}
                                    </p>
                                    <div style={styles.cardFooter}>
                                        <div style={styles.location}>
                                            <FaMapMarkerAlt style={{ marginRight: '6px', color: '#e74c3c' }} />
                                            <span>Arba Minch</span>
                                        </div>
                                        <span style={styles.viewMenu}>View Menu →</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
                <div style={styles.seeAllContainer}>
                    <Link to="/vendors?type=restaurant" style={styles.seeAllButton}>
                        View All Restaurants
                    </Link>
                </div>
            </section>

            {/* Partner Hotels Section */}
            <section style={{ ...styles.section, backgroundColor: '#f8f9fa' }}>
                <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitleContainer}>
                        <FaHotel style={styles.sectionIcon} />
                        <h2 style={styles.sectionTitle}>Partner Hotels</h2>
                    </div>
                    <p style={styles.sectionSubtitle}>Order directly to your room or enjoy in-house dining</p>
                </div>

                <div style={styles.grid}>
                    {featuredHotels.length > 0 ? featuredHotels.map(vendor => (
                        <div style={styles.card} key={vendor._id}>
                            <Link to={`/menu/${vendor._id}`} style={styles.cardLink}>
                                <div style={styles.cardImageContainer}>
                                    <img
                                        src={vendor.bannerUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w-800&auto=format&fit=crop'}
                                        alt={vendor.businessName}
                                        style={styles.cardImage}
                                    />
                                    <div style={styles.cardOverlay}>
                                        <span style={styles.hotelBadge}>HOTEL</span>
                                    </div>
                                </div>
                                <div style={styles.cardContent}>
                                    <div style={styles.cardHeader}>
                                        <h3 style={styles.cardTitle}>{vendor.businessName}</h3>
                                        <div style={styles.deliveryInfo}>
                                            <FaClock style={{ marginRight: '4px', color: '#666' }} />
                                            <span>Room Service</span>
                                        </div>
                                    </div>
                                    <p style={styles.cardCategories}>Luxury Dining • Room Service</p>
                                    <div style={styles.cardFooter}>
                                        <div style={styles.location}>
                                            <FaMapMarkerAlt style={{ marginRight: '6px', color: '#3498db' }} />
                                            <span>Central Location</span>
                                        </div>
                                        <span style={styles.viewMenu}>Explore →</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )) : (
                        <div style={styles.placeholderCard}>
                            <FaHotel style={{ fontSize: '48px', color: '#bdc3c7', marginBottom: '1rem' }} />
                            <h3>More Hotels Coming Soon!</h3>
                            <p>We're expanding our hotel partnerships</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section style={styles.featuresSection}>
                <div style={styles.featuresContainer}>
                    <div style={styles.feature}>
                        <div style={styles.featureIcon}>
                            <FaShippingFast />
                        </div>
                        <h3 style={styles.featureTitle}>Fast Delivery</h3>
                        <p style={styles.featureDesc}>Average delivery time of 30 minutes with real-time tracking</p>
                    </div>
                    <div style={styles.feature}>
                        <div style={styles.featureIcon}>
                            <FaShieldAlt />
                        </div>
                        <h3 style={styles.featureTitle}>Secure Payments</h3>
                        <p style={styles.featureDesc}>Chapa integration & cash on delivery for your convenience</p>
                    </div>
                    <div style={styles.feature}>
                        <div style={styles.featureIcon}>
                            <FaStar />
                        </div>
                        <h3 style={styles.featureTitle}>Quality Assured</h3>
                        <p style={styles.featureDesc}>Verified vendors and customer reviews for best experience</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={styles.ctaSection}>
                <div style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>Ready to order your favorite meal?</h2>
                    <p style={styles.ctaText}>Download our app for exclusive offers and faster ordering</p>
                    <div style={styles.ctaButtons}>
                        <Link to="/vendors" style={styles.ctaButtonPrimary}>
                            Start Ordering Now
                        </Link>
                        <Link to="/download" style={styles.ctaButtonSecondary}>
                            Download App
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #e67e22',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem',
    },
    hero: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '4rem 2rem',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
    },
    heroContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
    },
    heroText: {
        maxWidth: '600px',
    },
    heroTitle: {
        fontSize: '3.5rem',
        fontWeight: '800',
        marginBottom: '1.5rem',
        lineHeight: '1.2',
    },
    highlight: {
        color: '#ffd700',
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        marginBottom: '2rem',
        opacity: '0.9',
        lineHeight: '1.6',
    },
    heroButtons: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '3rem',
    },
    primaryButton: {
        padding: '1rem 2rem',
        backgroundColor: '#e67e22',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(230, 126, 34, 0.4)',
    },
    secondaryButton: {
        padding: '1rem 2rem',
        backgroundColor: 'transparent',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        border: '2px solid rgba(255,255,255,0.3)',
        transition: 'all 0.3s ease',
    },
    heroStats: {
        display: 'flex',
        gap: '3rem',
        marginTop: '2rem',
    },
    stat: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    statIcon: {
        fontSize: '2rem',
        color: '#ffd700',
    },
    heroImage: {
        position: 'relative',
    },
    foodImage: {
        width: '100%',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        transform: 'rotate(3deg)',
    },
    section: {
        padding: '5rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    sectionHeader: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    sectionTitleContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '1rem',
    },
    sectionIcon: {
        fontSize: '2rem',
        color: '#e67e22',
    },
    sectionTitle: {
        fontSize: '2.5rem',
        color: '#2c3e50',
        margin: '0',
    },
    sectionSubtitle: {
        fontSize: '1.1rem',
        color: '#7f8c8d',
        maxWidth: '600px',
        margin: '0 auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        height: '100%',
        border: '1px solid #eee',
    },
    cardLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        height: '100%',
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
        transition: 'transform 0.3s ease',
    },
    cardOverlay: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        right: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
    },
    openBadge: {
        backgroundColor: '#27ae60',
        color: '#fff',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
    },
    closedBadge: {
        backgroundColor: '#e74c3c',
        color: '#fff',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
    },
    ratingBadge: {
        backgroundColor: '#fff',
        color: '#f39c12',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
    },
    hotelBadge: {
        backgroundColor: '#3498db',
        color: '#fff',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
    },
    cardContent: {
        padding: '1.5rem',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.5rem',
    },
    cardTitle: {
        fontSize: '1.25rem',
        margin: '0',
        color: '#2c3e50',
        flex: '1',
    },
    deliveryInfo: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem',
        color: '#666',
    },
    cardCategories: {
        color: '#7f8c8d',
        fontSize: '0.9rem',
        marginBottom: '1rem',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid #eee',
    },
    location: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem',
        color: '#666',
    },
    viewMenu: {
        color: '#e67e22',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'color 0.3s ease',
    },
    seeAllContainer: {
        textAlign: 'center',
        marginTop: '2rem',
    },
    seeAllButton: {
        display: 'inline-block',
        padding: '0.75rem 2rem',
        backgroundColor: 'transparent',
        color: '#e67e22',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        border: '2px solid #e67e22',
        transition: 'all 0.3s ease',
    },
    placeholderCard: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '3rem 2rem',
        textAlign: 'center',
        gridColumn: '1 / -1',
        border: '2px dashed #bdc3c7',
    },
    featuresSection: {
        padding: '5rem 2rem',
        backgroundColor: '#2c3e50',
    },
    featuresContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '3rem',
        textAlign: 'center',
    },
    feature: {
        padding: '2rem',
        backgroundColor: '#34495e',
        borderRadius: '12px',
        transition: 'transform 0.3s ease',
    },
    featureIcon: {
        fontSize: '3rem',
        color: '#e67e22',
        marginBottom: '1.5rem',
    },
    featureTitle: {
        color: '#fff',
        fontSize: '1.5rem',
        marginBottom: '1rem',
    },
    featureDesc: {
        color: '#bdc3c7',
        lineHeight: '1.6',
    },
    ctaSection: {
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: '#fff',
        textAlign: 'center',
    },
    ctaContent: {
        maxWidth: '800px',
        margin: '0 auto',
    },
    ctaTitle: {
        fontSize: '2.5rem',
        marginBottom: '1rem',
        fontWeight: '800',
    },
    ctaText: {
        fontSize: '1.2rem',
        marginBottom: '2rem',
        opacity: '0.9',
    },
    ctaButtons: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    ctaButtonPrimary: {
        padding: '1rem 2rem',
        backgroundColor: '#fff',
        color: '#f5576c',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },
    ctaButtonSecondary: {
        padding: '1rem 2rem',
        backgroundColor: 'transparent',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        border: '2px solid rgba(255,255,255,0.3)',
        transition: 'all 0.3s ease',
    },
};

// Add CSS animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`, styleSheet.cssRules.length);

// Add hover effects
styleSheet.insertRule(`
    .card:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    .card:hover .cardImage {
        transform: scale(1.05);
    }
    .card:hover .viewMenu {
        color: #d35400;
    }
    .primaryButton:hover, .ctaButtonPrimary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(230, 126, 34, 0.6);
    }
    .secondaryButton:hover, .seeAllButton:hover, .ctaButtonSecondary:hover {
        background-color: rgba(255,255,255,0.1);
        transform: translateY(-2px);
    }
    .feature:hover {
        transform: translateY(-5px);
    }
`, styleSheet.cssRules.length);

export default Home;