import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Home = () => {
    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const { data } = await api.get('/vendors');
                setVendors(data);
            } catch (error) {
                console.error('Error fetching vendors:', error);
            }
        };
        fetchVendors();
    }, []);

    const restaurants = vendors.filter(v => v.categories.some(c => c.toLowerCase().includes('restaurant') || c.toLowerCase().includes('food') || !c.toLowerCase().includes('hotel')));
    const hotels = vendors.filter(v => v.categories.some(c => c.toLowerCase().includes('hotel')));

    // If no distinct data, just split mostly for demo visual
    const featuredRestaurants = restaurants.length > 0 ? restaurants : vendors.slice(0, 3);
    const featuredHotels = hotels.length > 0 ? hotels : vendors.slice(3, 6);

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroOverlay}>
                    <h1 style={styles.heroTitle}>Delicious Food, Delivered to You</h1>
                    <p style={styles.heroSubtitle}>Order from the best restaurants and hotels in Arba Minch.</p>
                    <Link to="/login" style={styles.ctaButton}>Order Now</Link>
                </div>
            </section>

            {/* Featured Restaurants */}
            <section style={styles.section}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>Featured Restaurants</h2>
                    <div style={styles.grid}>
                        {featuredRestaurants.map(vendor => (
                            <Link to={`/menu/${vendor._id}`} key={vendor._id} style={styles.cardLink}>
                                <div style={styles.card}>
                                    <img src={vendor.bannerUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'} alt={vendor.businessName} style={styles.cardImage} />
                                    <div style={styles.cardContent}>
                                        <h3 style={styles.cardTitle}>{vendor.businessName}</h3>
                                        <p style={styles.cardDesc}>{vendor.categories.join(', ')}</p>
                                        <span style={styles.badge}>{vendor.isOpen ? 'Open' : 'Closed'}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Hotels (Visual Separation) */}
            <section style={{ ...styles.section, backgroundColor: '#f9f9f9' }}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>Partner Hotels</h2>
                    <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Order directly to your room or home.</p>
                    <div style={styles.grid}>
                        {featuredHotels.length > 0 ? featuredHotels.map(vendor => (
                            <Link to={`/menu/${vendor._id}`} key={vendor._id} style={styles.cardLink}>
                                <div style={styles.card}>
                                    <img src={vendor.bannerUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'} alt={vendor.businessName} style={styles.cardImage} />
                                    <div style={styles.cardContent}>
                                        <h3 style={styles.cardTitle}>{vendor.businessName}</h3>
                                        <p style={styles.cardDesc}>Hotel Service & Dining</p>
                                        <span style={styles.badge}>Available</span>
                                    </div>
                                </div>
                            </Link>
                        )) : <p style={{ textAlign: 'center', width: '100%' }}>More hotels coming soon!</p>}
                    </div>
                </div>
            </section>

            {/* Features / About Teaser */}
            <section style={styles.featuresSection}>
                <div className="container" style={styles.featuresContent}>
                    <div style={styles.featureItem}>
                        <h3 style={styles.featureTitle}>Fast Delivery</h3>
                        <p>Real-time tracking from the kitchen to your door.</p>
                    </div>
                    <div style={styles.featureItem}>
                        <h3 style={styles.featureTitle}>Secure Payment</h3>
                        <p>Pay easily via Chapa or Cash on Delivery.</p>
                    </div>
                    <div style={styles.featureItem}>
                        <h3 style={styles.featureTitle}>Best Quality</h3>
                        <p>Curated list of top-rated local vendors.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
    },
    hero: {
        height: '600px',
        backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: '3rem',
    },
    heroOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textAlign: 'center',
        padding: '1rem',
    },
    heroTitle: {
        fontSize: '3.5rem',
        fontWeight: '800',
        marginBottom: '1rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        marginBottom: '2rem',
        maxWidth: '600px',
    },
    ctaButton: {
        padding: '1rem 3rem',
        backgroundColor: '#e67e22',
        color: '#fff',
        textDecoration: 'none',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        borderRadius: '50px',
        transition: 'transform 0.2s',
        boxShadow: '0 4px 15px rgba(230, 126, 34, 0.4)',
    },
    section: {
        padding: '4rem 0',
    },
    sectionTitle: {
        textAlign: 'center',
        fontSize: '2.5rem',
        color: '#333',
        marginBottom: '3rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
        padding: '0 1rem',
    },
    cardLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardImage: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
    },
    cardContent: {
        padding: '1.5rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    cardTitle: {
        fontSize: '1.2rem',
        marginBottom: '0.5rem',
        color: '#2c3e50',
    },
    cardDesc: {
        color: '#7f8c8d',
        marginBottom: '1rem',
        fontSize: '0.9rem',
        flex: 1,
    },
    badge: {
        alignSelf: 'flex-start',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#e6f7ea',
        color: '#27ae60',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    featuresSection: {
        backgroundColor: '#2c3e50',
        color: '#fff',
        padding: '4rem 0',
        marginTop: '2rem',
    },
    featuresContent: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        textAlign: 'center',
    },
    featureItem: {
        padding: '1rem',
    },
    featureTitle: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#e67e22',
    }
};

export default Home;
