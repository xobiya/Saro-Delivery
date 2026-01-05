import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CartContext from '../context/CartContext';

const VendorMenu = () => {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [vendor, setVendor] = useState(null);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const vendorRes = await api.get(`/vendors/${id}`);
            setVendor(vendorRes.data);
            const productsRes = await api.get(`/products/vendor/${id}`);
            setProducts(productsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (!vendor) return <p>Loading...</p>;

    return (
        <div>
            <div style={{ ...styles.header, backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${vendor.bannerUrl})` }}>
                <div className="container">
                    <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>&larr; Back to Restaurants</button>
                    <h1 style={{ color: '#fff', margin: '0.5rem 0' }}>{vendor.businessName}</h1>
                    <p style={{ color: '#eee' }}>{vendor.description}</p>
                </div>
            </div>

            <div className="container" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Menu</h3>
                <div style={styles.grid}>
                    {products.map((product) => (
                        <div key={product._id} style={styles.card}>
                            <div style={styles.prodInfo}>
                                <h4 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h4>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{product.description}</p>
                                <p style={{ fontWeight: 'bold', color: '#e67e22' }}>{product.price} ETB</p>
                            </div>
                            {product.imageUrl && <div style={{ ...styles.prodImg, backgroundImage: `url(${product.imageUrl})` }}></div>}
                            <button onClick={() => addToCart(product, vendor._id)} style={styles.addBtn}>+</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    header: {
        padding: '3rem 1rem',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        marginBottom: '0',
        textAlign: 'center',
    },
    backBtn: {
        background: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.5)',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '0.9rem',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        marginBottom: '1rem',
    },
    grid: {
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    },
    card: {
        border: '1px solid #eee',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        position: 'relative',
        gap: '1rem',
    },
    prodInfo: {
        flex: 1,
    },
    prodImg: {
        width: '80px',
        height: '80px',
        borderRadius: '8px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    addBtn: {
        backgroundColor: '#e67e22',
        color: '#fff',
        border: 'none',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
    }
};

export default VendorMenu;
