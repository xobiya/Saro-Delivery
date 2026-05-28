import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    FaUtensils,
    FaHotel,
    FaShippingFast,
    FaShieldAlt,
    FaStar,
    FaClock,
    FaMapMarkerAlt,
    FaArrowRight,
    FaApple,
    FaGooglePlay,
    FaSearch,
    FaBiking,
    FaCheckCircle,
    FaMotorcycle
} from 'react-icons/fa';

import heroImage from '../Assets/vertical-shot-delicious-ethiopian-food-with-fresh-vegetables-wooden-table.jpg';
import vendorFallbackImage from '../Assets/meat-vegetable-ethiopian-salads.jpg';
import { resolveVendorBannerUrl } from '../utils/vendorImages';

import demoImage1 from '../Assets/top-view-indian-food-assortment.jpg';
import demoImage2 from '../Assets/fried-chicken-with-grilled-potatoes-eggplants-tomatoes-peppers.jpg';
import demoImage3 from '../Assets/meat-vegetable-ethiopian-salads.jpg';

const Home = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [vendors, setVendors] = useState([
        {
            _id: 'demo1',
            businessName: 'Lalibela Traditional Restaurant',
            categories: ['Restaurant', 'Ethiopian'],
            rating: 4.8,
            isOpen: true,
            bannerUrl: demoImage3
        },
        {
            _id: 'demo2',
            businessName: 'Arba Minch Fast Food',
            categories: ['Restaurant', 'Fast Food'],
            rating: 4.5,
            isOpen: true,
            bannerUrl: demoImage1
        },
        {
            _id: 'demo3',
            businessName: 'Omo Valley Cafe',
            categories: ['Cafe', 'Breakfast'],
            rating: 4.9,
            isOpen: false,
            bannerUrl: demoImage2
        }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const { data } = await api.getCached('/vendors', { ttlMs: 5 * 60 * 1000 });
                if (data && data.length > 0) {
                    setVendors(data);
                }
            } catch (error) {
                console.error('Error fetching vendors:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/vendors?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/vendors');
        }
    };

    const restaurants = vendors.filter(v => v.categories.some(c =>
        c.toLowerCase().includes('restaurant') ||
        c.toLowerCase().includes('food') ||
        c.toLowerCase().includes('cafe')
    ));
    const hotels = vendors.filter(v => v.categories.some(c => c.toLowerCase().includes('hotel')));

    const featuredRestaurants = restaurants.length > 0 ? restaurants.slice(0, 3) : vendors.slice(0, 3);

    if (loading && vendors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
                <p className="mt-4 text-secondary">Discovering delicious options...</p>
            </div>
        );
    }

    return (
        <div className="home-container bg-gray-50">

            {/* ═══════════════════════════════
                HERO SECTION
            ════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white pt-24 pb-16 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                        {/* Left: Text + Search */}
                        <div className="animate-fade-in-up text-center lg:text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                                Fast Delivery in Arba Minch
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 leading-[1.1] font-display tracking-tight text-white">
                                Taste the Best of{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                                    Arba Minch
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                                Discover amazing restaurants and hotels with fast delivery right to your doorstep.
                                Fresh food, quick service, and unforgettable flavors.
                            </p>

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="mb-8 max-w-lg mx-auto lg:mx-0">
                                <div className="flex items-center bg-white rounded-2xl p-2 shadow-2xl shadow-black/40 gap-2">
                                    <div className="flex items-center flex-1 px-3 gap-3">
                                        <FaSearch className="text-gray-400 text-lg flex-shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="Search restaurants, food..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="flex-1 border-none outline-none text-gray-800 text-base py-3 bg-transparent placeholder-gray-400 min-w-0"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 flex-shrink-0 shadow-lg shadow-orange-500/30"
                                    >
                                        <span className="hidden xs:inline">Search</span>
                                        <FaArrowRight className="text-sm" />
                                    </button>
                                </div>
                            </form>

                            {/* Quick Links */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                                <Link
                                    to="/vendors?type=restaurant"
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full transition-all duration-200"
                                >
                                    <FaUtensils className="text-orange-400" /> Restaurants
                                </Link>
                                <Link
                                    to="/vendors?type=hotel"
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full transition-all duration-200"
                                >
                                    <FaHotel className="text-blue-400" /> Hotels
                                </Link>
                                <Link
                                    to="/vendors"
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full transition-all duration-200"
                                >
                                    <FaShippingFast className="text-green-400" /> View All
                                </Link>
                            </div>

                            {/* Trust signals */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-5 text-sm text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <FaCheckCircle className="text-green-400" /> Free delivery on first order
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <FaShieldAlt className="text-blue-400" /> Secure payments
                                </span>
                            </div>
                        </div>

                        {/* Right: Hero Image */}
                        <div className="relative flex justify-center items-center animate-fade-in mt-8 lg:mt-0" style={{ animationDelay: '0.2s' }}>
                            <div className="relative z-10 transform -rotate-3 hover:-rotate-1 transition-transform duration-500 w-full max-w-[260px] sm:max-w-[340px] lg:max-w-[420px]">
                                <img
                                    src={heroImage}
                                    alt="Ethiopian food"
                                    className="w-full rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.6)] border-4 border-white/10"
                                />
                                {/* Floating delivery time card */}
                                <div className="absolute -bottom-4 -left-4 sm:-left-8 bg-white text-gray-900 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100 z-20 min-w-[160px]">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FaMotorcycle className="text-orange-500 text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Avg Delivery</p>
                                        <p className="text-base font-extrabold text-gray-900 leading-tight">30 Min</p>
                                    </div>
                                </div>
                                {/* Floating rating card */}
                                <div className="absolute -top-4 -right-4 sm:-right-8 bg-white text-gray-900 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100 z-20 min-w-[150px]">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FaStar className="text-yellow-500 text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Rated Service</p>
                                        <p className="text-base font-extrabold text-gray-900 leading-tight">4.9 / 5.0</p>
                                    </div>
                                </div>
                            </div>
                            {/* Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-orange-500/20 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
                STATS STRIP
            ════════════════════════════════ */}
            <section className="bg-white border-b border-gray-100 py-6 sm:py-8">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
                        {[
                            { icon: <FaUtensils className="text-orange-500 text-2xl" />, value: `${restaurants.length || '20'}+`, label: 'Restaurants' },
                            { icon: <FaMotorcycle className="text-orange-500 text-2xl" />, value: '30 Min', label: 'Avg Delivery' },
                            { icon: <FaStar className="text-yellow-500 text-2xl" />, value: '4.9★', label: 'Avg Rating' },
                            { icon: <FaShieldAlt className="text-blue-500 text-2xl" />, value: '100%', label: 'Secure Pay' },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 py-3">
                                {stat.icon}
                                <span className="text-xl sm:text-2xl font-extrabold text-gray-900">{stat.value}</span>
                                <span className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
                HOW IT WORKS
            ════════════════════════════════ */}
            <section id="how-it-works" className="py-16 sm:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 font-display text-gray-900">How It Works</h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">Simple steps to get your favorite meal delivered</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center max-w-4xl mx-auto">
                        {[
                            { icon: <FaSearch />, title: 'Find Food', desc: 'Browse from our list of top-rated restaurants and hotels in Arba Minch.', color: 'bg-orange-100 text-orange-500' },
                            { icon: <FaUtensils />, title: 'Place Order', desc: 'Choose your favorite dishes and pay securely via Chapa or Cash on Delivery.', color: 'bg-blue-100 text-blue-500' },
                            { icon: <FaBiking />, title: 'Enjoy', desc: 'Sit back and relax. Our delivery partner will be at your door in no time.', color: 'bg-green-100 text-green-500' },
                        ].map((step, i) => (
                            <div key={i} className="p-6 sm:p-8 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto ${step.color} rounded-full flex items-center justify-center text-xl sm:text-2xl mb-5 shadow-inner`}>
                                    {step.icon}
                                </div>
                                <div className="w-7 h-7 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{i + 1}</div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                                <p className="text-gray-500 text-sm sm:text-base">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
                FEATURED RESTAURANTS
            ════════════════════════════════ */}
            <section className="py-16 sm:py-20 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-end mb-8 sm:mb-10">
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 font-display text-gray-900">Popular Restaurants</h2>
                            <p className="text-gray-500 text-sm sm:text-base">Handpicked dining spots just for you</p>
                        </div>
                        <Link to="/vendors?type=restaurant" className="flex items-center text-orange-500 font-medium hover:text-orange-600 transition-colors text-sm sm:text-base whitespace-nowrap ml-4">
                            View All <FaArrowRight className="ml-1.5 text-xs" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                        {featuredRestaurants.map((vendor, index) => (
                            <div
                                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                key={vendor._id}
                            >
                                <Link to={`/menu/${vendor._id}`} className="block h-full flex flex-col group">
                                    <div className="relative h-48 sm:h-52 lg:h-56 w-full overflow-hidden">
                                        <img
                                            src={resolveVendorBannerUrl(vendor, vendorFallbackImage)}
                                            alt={vendor.businessName}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute top-4 left-4 flex items-center gap-2">
                                            <span className={`${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>
                                                {vendor.isOpen ? 'OPEN' : 'CLOSED'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg sm:text-xl text-gray-900 leading-tight">{vendor.businessName}</h3>
                                            <div className="flex items-center bg-orange-50 px-2 py-1 rounded-md ml-3 flex-shrink-0">
                                                <FaStar className="text-yellow-400 text-sm mr-1" />
                                                <span className="font-bold text-sm text-gray-800">{vendor.rating || '4.5'}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-1">{vendor.categories.join(' • ')}</p>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <div className="flex items-center text-gray-500 text-sm font-medium">
                                                <FaClock className="mr-2 text-gray-400" />
                                                <span>25-35 min</span>
                                            </div>
                                            <span className="text-orange-500 font-semibold text-sm group-hover:underline flex items-center">
                                                View Menu <FaArrowRight className="ml-1 text-xs" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
                APP DOWNLOAD CTA
            ════════════════════════════════ */}
            <section className="py-16 sm:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-10">

                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>

                        {/* Text */}
                        <div className="relative z-10 text-white max-w-xl text-center lg:text-left">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight font-display">
                                Food delivery<br />in your pocket
                            </h2>
                            <p className="text-base sm:text-lg opacity-90 mb-8 max-w-lg">
                                Download the Saro Delivery app for a faster, more convenient experience.
                                Get exclusive deals, track your orders in real-time, and more!
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <a href="#" className="flex items-center bg-black/90 hover:bg-black text-white px-5 sm:px-6 py-3 rounded-xl transition-colors shadow-lg">
                                    <FaApple className="text-2xl sm:text-3xl mr-3" />
                                    <div className="text-left">
                                        <div className="text-[0.6rem] opacity-80 uppercase font-semibold">Download on the</div>
                                        <div className="text-sm font-bold">App Store</div>
                                    </div>
                                </a>
                                <a href="#" className="flex items-center bg-black/90 hover:bg-black text-white px-5 sm:px-6 py-3 rounded-xl transition-colors shadow-lg">
                                    <FaGooglePlay className="text-xl sm:text-2xl mr-3" />
                                    <div className="text-left">
                                        <div className="text-[0.6rem] opacity-80 uppercase font-semibold">GET IT ON</div>
                                        <div className="text-sm font-bold">Google Play</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Phone Mockup (CSS-only, no broken image) */}
                        <div className="relative z-10 hidden sm:flex items-center justify-center">
                            <div className="relative transform -rotate-6 hover:-rotate-3 transition-transform duration-500">
                                {/* Phone frame */}
                                <div className="w-[180px] lg:w-[220px] bg-gray-950 rounded-[40px] border-4 border-gray-800 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
                                    {/* Status bar */}
                                    <div className="bg-gray-950 px-5 py-2 flex justify-between items-center">
                                        <span className="text-white text-[8px] font-semibold">9:41</span>
                                        <div className="flex gap-1">
                                            <div className="w-3 h-1.5 bg-white rounded-sm opacity-80"></div>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
                                        </div>
                                    </div>
                                    {/* Notch */}
                                    <div className="flex justify-center -mt-1 mb-1">
                                        <div className="w-16 h-4 bg-gray-950 rounded-b-xl"></div>
                                    </div>
                                    {/* Screen content */}
                                    <div className="bg-white mx-1 rounded-2xl overflow-hidden" style={{ minHeight: '260px' }}>
                                        {/* App header */}
                                        <div className="bg-orange-500 px-3 pt-3 pb-5">
                                            <p className="text-white text-[8px] font-bold opacity-80 mb-0.5">SARO DELIVERY</p>
                                            <p className="text-white text-[10px] font-extrabold">Good morning! 👋</p>
                                            <p className="text-orange-100 text-[7px] mt-0.5">What are you craving?</p>
                                            {/* Mini search bar */}
                                            <div className="bg-white rounded-lg mt-2 px-2 py-1.5 flex items-center gap-1">
                                                <FaSearch className="text-gray-400 text-[8px]" />
                                                <span className="text-gray-400 text-[7px]">Search food...</span>
                                            </div>
                                        </div>
                                        {/* Food items */}
                                        <div className="px-2 pt-2 pb-2 -mt-2">
                                            <p className="text-gray-800 text-[8px] font-bold mb-1.5">Popular Near You</p>
                                            {['Ethiopian Platter', 'Grilled Chicken', 'Tibs Special'].map((item, i) => (
                                                <div key={i} className="flex items-center gap-1.5 mb-1.5 bg-gray-50 rounded-lg p-1.5">
                                                    <div className={`w-6 h-6 rounded-md flex-shrink-0 ${i === 0 ? 'bg-orange-200' : i === 1 ? 'bg-yellow-200' : 'bg-red-200'}`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-gray-800 text-[7px] font-bold truncate">{item}</p>
                                                        <p className="text-orange-500 text-[6px] font-semibold">25 min • ★ 4.8</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Bottom nav */}
                                        <div className="border-t border-gray-100 px-3 py-2 flex justify-between">
                                            {[FaUtensils, FaSearch, FaShoppingCart => '🛒', FaUser => '👤'].map((Icon, i) => (
                                                <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center ${i === 0 ? 'bg-orange-500' : 'bg-gray-100'}`}>
                                                    <span className="text-[6px]">{i === 0 ? '🍽' : i === 1 ? '🔍' : i === 2 ? '🛒' : '👤'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Glow under phone */}
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/30 blur-xl rounded-full"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;