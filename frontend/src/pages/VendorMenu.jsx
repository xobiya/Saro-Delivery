import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaClock, FaMapMarkerAlt, FaShoppingCart, FaFilter, FaPlus } from 'react-icons/fa';
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
            <div className="flex justify-center items-center min-h-screen bg-gray-50 pt-20">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin shadow-lg"></div>
            </div>
        );
    }

    if (!vendor) return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 pt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Vendor not found</h2>
            <button onClick={() => navigate('/vendors')} className="text-orange-500 font-semibold hover:underline">Go back to vendors</button>
        </div>
    );

    const bannerUrl = resolveVendorBannerUrl(vendor, vendorFallbackImage);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Header */}
            <div className="relative h-[400px] overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-1000" 
                    style={{ backgroundImage: `url("${bannerUrl}")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-black/40 flex flex-col justify-end">
                    <div className="container mx-auto px-4 max-w-6xl pb-10">
                        {/* Top Actions */}
                        <div className="absolute top-24 left-4 right-4 container mx-auto max-w-6xl flex justify-between items-center z-10">
                            <button 
                                onClick={() => navigate('/vendors')} 
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2.5 rounded-full border border-white/30 transition-all font-medium text-sm shadow-lg"
                            >
                                <FaArrowLeft /> Back
                            </button>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="relative flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-orange-500/50 transition-all font-medium"
                            >
                                <FaShoppingCart />
                                <span className="hidden sm:inline">View Cart</span>
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-white text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Vendor Info */}
                        <div className="animate-fade-in-up">
                            <div className="flex flex-wrap items-end justify-between gap-6">
                                <div className="text-white">
                                    <div className="flex items-center gap-4 mb-3">
                                        <h1 className="text-4xl md:text-5xl font-extrabold font-display drop-shadow-lg">{vendor.businessName}</h1>
                                        {vendor.isOpen ? (
                                            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">OPEN NOW</span>
                                        ) : (
                                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">CLOSED</span>
                                        )}
                                    </div>
                                    <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-2xl drop-shadow-md">
                                        {vendor.description || 'Experience the best flavors prepared with love and fresh ingredients.'}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                                            <FaClock className="text-orange-400 text-lg" />
                                            <span>25-35 min delivery</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                                            <FaMapMarkerAlt className="text-red-400 text-lg" />
                                            <span>Arba Minch</span>
                                        </div>
                                        {vendor.rating && (
                                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                                                <FaStar className="text-yellow-400 text-lg" />
                                                <span>{vendor.rating} Rating</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {vendor.logoUrl && (
                                    <img src={vendor.logoUrl} alt="logo" className="hidden md:block w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-2xl bg-white" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="container mx-auto px-4 max-w-6xl mt-8">
                
                {/* Category Filter */}
                {categories.length > 1 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10 sticky top-[80px] z-40 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-4">
                            <FaFilter className="text-orange-500 text-lg" />
                            <h3 className="text-xl font-bold text-gray-900">Menu Categories</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                                        selectedCategory === cat 
                                            ? 'bg-gray-900 text-white shadow-md' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                                >
                                    {cat === 'all' ? '🍽️ All Items' : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product, index) => (
                        <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col animate-fade-in-up group" style={{ animationDelay: `${index * 0.05}s` }}>
                            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FaUtensils className="text-4xl opacity-20" />
                                    </div>
                                )}
                                {product.category && (
                                    <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                        {product.category}
                                    </span>
                                )}
                                <div className="absolute top-4 right-4 bg-white text-gray-900 font-extrabold px-3 py-1.5 rounded-full shadow-lg text-sm">
                                    {product.price} ETB
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="font-bold text-xl text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px] flex-grow">
                                    {product.description || 'Delicious freshly prepared item.'}
                                </p>
                                
                                <button
                                    onClick={() => addToCart(product, vendor._id)}
                                    className="w-full bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-200 hover:border-orange-500 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 group-hover:shadow-md"
                                    disabled={!vendor.isOpen}
                                >
                                    <FaPlus className={!vendor.isOpen ? 'opacity-50' : ''} /> 
                                    {vendor.isOpen ? 'Add to Order' : 'Currently Closed'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 mt-8">
                        <FaFilter className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No items found</h3>
                        <p className="text-gray-500">We couldn't find any items in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorMenu;
