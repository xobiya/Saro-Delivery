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
    FaArrowRight,
    FaApple,
    FaGooglePlay,
    FaSearch,
    FaBiking
} from 'react-icons/fa';

import heroImage from '../Assets/vertical-shot-delicious-ethiopian-food-with-fresh-vegetables-wooden-table.jpg';
import vendorFallbackImage from '../Assets/meat-vegetable-ethiopian-salads.jpg';
import { resolveVendorBannerUrl } from '../utils/vendorImages';

import demoImage1 from '../Assets/top-view-indian-food-assortment.jpg';
import demoImage2 from '../Assets/fried-chicken-with-grilled-potatoes-eggplants-tomatoes-peppers.jpg';
import demoImage3 from '../Assets/meat-vegetable-ethiopian-salads.jpg';

const Home = () => {
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

    const restaurants = vendors.filter(v => v.categories.some(c =>
        c.toLowerCase().includes('restaurant') ||
        c.toLowerCase().includes('food') ||
        c.toLowerCase().includes('cafe')
    ));
    const hotels = vendors.filter(v => v.categories.some(c => c.toLowerCase().includes('hotel')));

    const featuredRestaurants = restaurants.length > 0 ? restaurants.slice(0, 3) : vendors.slice(0, 3);
    const featuredHotels = hotels.length > 0 ? hotels.slice(0, 3) : vendors.slice(4, 7);

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
            {/* Premium Hero Section */}
            <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-gray-900 to-black text-white py-20 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="animate-fade-in-up text-center lg:text-left">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight font-display tracking-tight text-white">
                                Taste the Best of <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 drop-shadow-sm">Arba Minch</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 text-white">
                                Discover amazing restaurants and hotels with fast delivery right to your doorstep.
                                Fresh food, quick service, and unforgettable flavors.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-10">
                                <Link to="/vendors" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-orange-500/50 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1 animate-pulse-glow">
                                    Order Now <FaArrowRight className="ml-2" />
                                </Link>
                                <a href="#how-it-works" className="bg-transparent border-2 border-white/30 hover:border-white hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1">
                                    How It Works
                                </a>
                            </div>
                        </div>
                        <div className="relative flex justify-center items-center animate-fade-in stagger-2 mt-10 lg:mt-0">
                            {/* Inclined Image with 3D effect */}
                            <div className="relative z-10 transform -rotate-6 hover:-rotate-3 transition-transform duration-500 perspective-1000">
                                <img
                                    src={heroImage}
                                    alt="Ethiopian food"
                                    className="w-full max-w-[450px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10"
                                />
                            </div>
                            
                            {/* Floating Elements */}
                            <div className="absolute top-[5%] -right-[2%] lg:-right-[5%] bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-3 animate-float">
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                                <span className="font-medium text-sm">30 min delivery</span>
                            </div>
                            <div className="absolute bottom-[10%] -left-[2%] lg:-left-[5%] bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-3 animate-float" style={{ animationDelay: '1.5s' }}>
                                <FaStar className="text-yellow-400 text-xl drop-shadow-md" />
                                <span className="font-medium text-sm">4.9 Rated Service</span>
                            </div>
                            
                            {/* Decorative Background Blob */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px] -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900">How It Works</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">Simple steps to get your favorite meal delivered</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up">
                            <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-2xl mb-6 shadow-inner"><FaSearch /></div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Find Food</h3>
                            <p className="text-gray-500">Browse from our list of top-rated restaurants and hotels in Arba Minch.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-2xl mb-6 shadow-inner"><FaUtensils /></div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Order</h3>
                            <p className="text-gray-500">Choose your favorite dishes and pay securely via Chapa or Cash on Delivery.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-2xl mb-6 shadow-inner"><FaBiking /></div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Enjoy</h3>
                            <p className="text-gray-500">Sit back and relax. Our delivery partner will be at your door in no time.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Restaurants */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 font-display text-gray-900">Popular Restaurants</h2>
                            <p className="text-gray-500">Handpicked dining spots just for you</p>
                        </div>
                        <Link to="/vendors?type=restaurant" className="hidden sm:flex items-center text-orange-500 font-medium hover:text-orange-600 transition-colors">
                            View All <FaArrowRight className="ml-2" />
                        </Link>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8">
                        {featuredRestaurants.map((vendor, index) => (
                            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden animate-fade-in-up w-full sm:w-[350px] flex-shrink-0" style={{ animationDelay: `${index * 0.1}s` }} key={vendor._id}>
                                <Link to={`/menu/${vendor._id}`} className="block h-full flex flex-col group">
                                    <div className="relative h-56 w-full overflow-hidden">
                                        <img
                                            src={resolveVendorBannerUrl(vendor, vendorFallbackImage)}
                                            alt={vendor.businessName}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute top-4 left-4">
                                            <span className={`${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>
                                                {vendor.isOpen ? 'OPEN' : 'CLOSED'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-xl text-gray-900 leading-tight">{vendor.businessName}</h3>
                                            <div className="flex items-center bg-orange-50 px-2 py-1 rounded-md ml-3 flex-shrink-0">
                                                <FaStar className="text-yellow-400 text-sm mr-1" />
                                                <span className="font-bold text-sm text-gray-800">{vendor.rating || '4.5'}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-5 line-clamp-1">{vendor.categories.join(' • ')}</p>
                                        
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

            {/* App Download CTA */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
                        
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        
                        <div className="relative z-10 text-white max-w-xl text-center md:text-left mb-10 md:mb-0 animate-fade-in-up">
                            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight font-display">Food delivery <br /> in your pocket</h2>
                            <p className="text-lg opacity-90 mb-10">
                                Download the Saro Delivery app for a faster, more convenient experience. 
                                Get exclusive deals, track your orders in real-time, and more!
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <a href="#" className="flex items-center bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-xl transition-colors shadow-lg">
                                    <FaApple className="text-3xl mr-3" />
                                    <div className="text-left">
                                        <div className="text-[0.65rem] opacity-80 uppercase font-semibold">Download on the</div>
                                        <div className="text-sm font-bold">App Store</div>
                                    </div>
                                </a>
                                <a href="#" className="flex items-center bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-xl transition-colors shadow-lg">
                                    <FaGooglePlay className="text-2xl mr-3" />
                                    <div className="text-left">
                                        <div className="text-[0.65rem] opacity-80 uppercase font-semibold">GET IT ON</div>
                                        <div className="text-sm font-bold">Google Play</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div className="relative z-10 hidden lg:block animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <img 
                                src="https://img.freepik.com/free-psd/smartphone-mockup_1310-812.jpg?w=1380&t=st=1708892415~exp=1708893015~hmac=6f8e7d2b2d6a5d4a9d8e7c6b5a4d3c2b1a0f9e8d7c6b5a4d3c2b1a0f9e8d7c6b" 
                                alt="App interface" 
                                className="w-[300px] rounded-[40px] transform -rotate-12 shadow-[0_30px_60px_rgba(0,0,0,0.4)] border-8 border-gray-900"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;