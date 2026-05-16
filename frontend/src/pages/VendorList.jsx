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
            <div className="flex justify-center items-center min-h-[50vh] pt-32">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-900 to-black text-white pt-32 pb-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>
                <div className="container mx-auto px-4 max-w-4xl relative z-10 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 font-display">Discover Amazing Places</h1>
                    <p className="text-xl text-gray-300 mb-10">Find the best restaurants and hotels in Arba Minch</p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center bg-white rounded-2xl p-2 shadow-xl mb-4 transition-transform hover:scale-[1.02]">
                            <FaSearch className="text-gray-400 mx-4 text-xl" />
                            <input
                                type="text"
                                placeholder="Search restaurants, hotels..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 border-none outline-none text-gray-800 text-lg py-3 bg-transparent"
                            />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`ml-2 p-3 rounded-xl transition-colors ${showFilters ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                <FaFilter />
                            </button>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="bg-white rounded-2xl p-6 shadow-lg mb-4 text-left animate-fade-in-up origin-top">
                                <div className="mb-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-800"
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
            <div className="container mx-auto px-4 max-w-6xl -mt-10 relative z-20">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                    <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-2xl"><FaUtensils /></div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 leading-none">{restaurants.length}</h3>
                            <p className="text-gray-500 font-medium mt-1">Restaurants</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-transform" style={{ animationDelay: '0.1s' }}>
                        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-2xl"><FaHotel /></div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 leading-none">{hotels.length}</h3>
                            <p className="text-gray-500 font-medium mt-1">Hotels</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-transform" style={{ animationDelay: '0.2s' }}>
                        <div className="w-14 h-14 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center text-2xl"><FaStar /></div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 leading-none">4.5+</h3>
                            <p className="text-gray-500 font-medium mt-1">Avg Rating</p>
                        </div>
                    </div>
                </div>

                {/* Vendor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredVendors.map((vendor, index) => (
                        <div key={vendor._id} onClick={() => navigate(`/menu/${vendor._id}`)} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer group animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                            <div className="relative h-56 w-full overflow-hidden">
                                <img
                                    src={resolveVendorBannerUrl(vendor, vendorFallbackImage)}
                                    alt={vendor.businessName}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                    <span className={`${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>
                                        {vendor.isOpen ? 'OPEN NOW' : 'CLOSED'}
                                    </span>
                                    {vendor.rating > 0 && (
                                        <span className="bg-white text-yellow-500 px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-md border border-gray-100">
                                            <FaStar className="mr-1" /> {vendor.rating} <span className="text-gray-400 ml-1 font-medium">({vendor.numReviews || 0})</span>
                                        </span>
                                    )}
                                </div>
                                {vendor.logoUrl && (
                                    <img src={vendor.logoUrl} alt="logo" className="absolute bottom-4 right-4 w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg" />
                                )}
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-xl text-gray-900 leading-tight line-clamp-1">{vendor.businessName}</h3>
                                </div>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                                    {vendor.description || 'Delicious food and great service provided by this amazing vendor.'}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {vendor.categories.slice(0, 3).map(cat => (
                                        <span key={cat} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold">{cat}</span>
                                    ))}
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center text-gray-500 text-sm font-medium">
                                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                                        <span>Arba Minch</span>
                                    </div>
                                    <span className="text-orange-500 font-semibold text-sm group-hover:underline">View Menu &rarr;</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredVendors.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 mt-8">
                        <FaUtensils className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No places found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorList;
