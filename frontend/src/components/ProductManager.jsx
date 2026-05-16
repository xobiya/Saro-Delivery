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
        <div className="flex flex-col gap-8 animate-fade-in-up">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>
                {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 text-sm font-medium">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <input
                            type="text"
                            name="name"
                            placeholder="Product Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                        />
                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                        />
                    </div>
                    
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors h-24 resize-none"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">ETB</span>
                            <input
                                type="number"
                                name="price"
                                placeholder="Price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                            />
                        </div>
                        <input
                            type="text"
                            name="image"
                            placeholder="Image URL"
                            value={formData.image}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="flex items-center cursor-pointer relative">
                            <input
                                type="checkbox"
                                name="available"
                                checked={formData.available}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${formData.available ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.available ? 'transform translate-x-4' : ''}`}></div>
                        </label>
                        <span className="text-sm font-bold text-gray-700">Currently Available for Order</span>
                    </div>
                    
                    <div className="flex gap-4 pt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                        </button>
                        {editingId && (
                            <button 
                                type="button" 
                                onClick={cancelEdit}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="mt-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 font-display">Your Products</h3>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">{products.length} Items</span>
                </div>
                
                {products.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-500 font-medium">You haven't added any products yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${product.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {product.available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-3">
                                        <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-bold uppercase">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-5 flex-1 flex flex-col">
                                    <h4 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{product.name}</h4>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                                    
                                    <div className="mt-auto flex justify-between items-center mb-4">
                                        <span className="font-extrabold text-xl text-orange-500">{product.price} <span className="text-sm">ETB</span></span>
                                    </div>
                                    
                                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                                        <button 
                                            onClick={() => handleEdit(product)} 
                                            className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-2 px-4 rounded-xl transition-colors text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product._id)} 
                                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl transition-colors text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductManager;
