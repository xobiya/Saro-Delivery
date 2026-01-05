import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const VendorList = () => {
    const [vendors, setVendors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const { data } = await api.get('/vendors');
            setVendors(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h3>Restaurants & Shops in Arba Minch</h3>
            <div style={styles.grid}>
                {vendors.map((vendor) => (
                    <div key={vendor._id} style={styles.card} onClick={() => navigate(`/menu/${vendor._id}`)}>
                        <div style={{ ...styles.banner, backgroundImage: `url(${vendor.bannerUrl || 'https://via.placeholder.com/300x150'})` }}></div>
                        <div style={styles.content}>
                            <div style={styles.headerRow}>
                                <h4 style={styles.title}>{vendor.businessName}</h4>
                                {vendor.logoUrl && <img src={vendor.logoUrl} alt="logo" style={styles.logo} />}
                            </div>
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>{vendor.description}</p>
                            <div style={styles.tags}>
                                {vendor.categories.map(cat => (
                                    <span key={cat} style={styles.tag}>{cat}</span>
                                ))}
                            </div>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: vendor.isOpen ? 'green' : 'red', fontWeight: 'bold' }}>
                                {vendor.isOpen ? 'Open Now' : 'Closed'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '1.5rem',
    },
    card: {
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    banner: {
        height: '150px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    content: {
        padding: '1.5rem',
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        margin: 0,
        fontSize: '1.25rem',
        color: '#333',
    },
    logo: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    tags: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '0.5rem',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#f8f9fa',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        color: '#666',
        border: '1px solid #eee',
    }
};

export default VendorList;
