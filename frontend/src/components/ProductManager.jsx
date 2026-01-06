import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const ProductManager = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        available: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user]);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get(`/products/vendor/${user._id}`);
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
                image: '',
                available: true,
            });
            setEditingId(null);
            fetchProducts();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image: product.image || '',
            available: product.available,
        });
        setEditingId(product._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (err) {
                console.error(err);
                alert('Failed to delete');
            }
        }
    };

    const cancelEdit = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            image: '',
            available: true,
        });
        setEditingId(null);
    };

    return (
        <div style={styles.container}>
            <div style={styles.formSection}>
                <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Product Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        style={{ ...styles.input, height: '80px' }}
                    />
                    <div style={styles.row}>
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    <input
                        type="text"
                        name="image"
                        placeholder="Image URL"
                        value={formData.image}
                        onChange={handleChange}
                        style={styles.input}
                    />
                    <label style={styles.checkbox}>
                        <input
                            type="checkbox"
                            name="available"
                            checked={formData.available}
                            onChange={handleChange}
                        />
                        Available
                    </label>
                    <div style={styles.buttonGroup}>
                        <button type="submit" style={styles.submitBtn} disabled={loading}>
                            {loading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                        </button>
                        {editingId && (
                            <button type="button" onClick={cancelEdit} style={styles.cancelBtn}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div style={styles.listSection}>
                <h3>Your Products</h3>
                <div style={styles.grid}>
                    {products.map((product) => (
                        <div key={product._id} style={styles.card}>
                            {product.image && (
                                <img src={product.image} alt={product.name} style={styles.cardImage} />
                            )}
                            <div style={styles.cardContent}>
                                <h4>{product.name}</h4>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>{product.description}</p>
                                <p style={{ fontWeight: 'bold' }}>{product.price} ETB</p>
                                <span style={{
                                    ...styles.badge,
                                    backgroundColor: product.available ? '#2ecc71' : '#e74c3c'
                                }}>
                                    {product.available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                            <div style={styles.cardActions}>
                                <button onClick={() => handleEdit(product)} style={styles.editBtn}>Edit</button>
                                <button onClick={() => handleDelete(product._id)} style={styles.deleteBtn}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    formSection: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #eee',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '600px',
    },
    row: {
        display: 'flex',
        gap: '1rem',
    },
    input: {
        padding: '0.8rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        flex: 1,
    },
    checkbox: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
    },
    submitBtn: {
        padding: '0.8rem 1.5rem',
        backgroundColor: '#3498db',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    cancelBtn: {
        padding: '0.8rem 1.5rem',
        backgroundColor: '#95a5a6',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    listSection: {
        marginTop: '1rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginTop: '1rem',
    },
    card: {
        border: '1px solid #eee',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
    },
    cardImage: {
        width: '100%',
        height: '150px',
        objectFit: 'cover',
    },
    cardContent: {
        padding: '1rem',
        flex: 1,
    },
    badge: {
        fontSize: '0.8rem',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        color: '#fff',
        marginTop: '0.5rem',
        display: 'inline-block',
    },
    cardActions: {
        padding: '1rem',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '0.5rem',
    },
    editBtn: {
        flex: 1,
        padding: '0.5rem',
        backgroundColor: '#f1c40f',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    deleteBtn: {
        flex: 1,
        padding: '0.5rem',
        backgroundColor: '#e74c3c',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default ProductManager;
