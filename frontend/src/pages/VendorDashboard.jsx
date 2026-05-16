import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import { HiOutlineUserCircle, HiOutlineArrowPath } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

// Vendor Components
import VendorSidebar from '../components/vendor/VendorSidebar';
import KitchenPipeline from '../components/vendor/KitchenPipeline';
import ProductManager from '../components/ProductManager';
import VendorSettings from '../components/VendorSettings';

const VendorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [vendorProfile, setVendorProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, ordersRes] = await Promise.all([
                api.get('/profile/vendor').catch(() => ({ data: null })),
                api.get('/deliveries')
            ]);
            
            setVendorProfile(profileRes.data);
            setOrders(ordersRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

            if (activeTab === 'reviews' && profileRes.data) {
                const { data: revs } = await api.get(`/reviews/vendor/${profileRes.data._id}`);
                setReviews(revs);
            }
        } catch (error) {
            console.error('Error fetching vendor data:', error);
            addToast('Failed to sync merchant data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/deliveries/${id}`, { status });
            addToast(`Order status updated to ${status}`, 'success');
            fetchData();
        } catch (error) {
            addToast('Failed to update order status', 'error');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || user.role !== 'vendor') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 text-center">
                <HiOutlineUserCircle className="text-9xl text-orange-500 mb-6 animate-pulse" />
                <h2 className="text-4xl font-black tracking-tighter uppercase">Merchant Access Required</h2>
                <button onClick={() => navigate('/')} className="mt-8 px-10 py-4 bg-orange-500 rounded-full font-black hover:bg-orange-600 transition-all shadow-xl">Return to Portal</button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <VendorSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isSidebarOpen={isSidebarOpen} 
                logout={handleLogout}
                vendorName={vendorProfile?.businessName}
            />

            <main className={`${isSidebarOpen ? 'ml-72' : 'ml-20'} flex-1 transition-all duration-500 min-h-screen flex flex-col`}>
                {/* Header */}
                <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all"
                        >
                            <HiOutlineArrowPath size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">{activeTab.replace('-', ' ')}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Saro Merchant Protocol</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-black text-slate-900">{user.name}</span>
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Active Shift</span>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl border-4 border-white shadow-lg overflow-hidden">
                            <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=f97316&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto w-full flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-60">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-slate-900 rounded-lg animate-pulse"></div>
                                </div>
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mt-8">Synchronizing Kitchen Core</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {activeTab === 'orders' && <KitchenPipeline orders={orders} updateStatus={updateStatus} />}
                            {activeTab === 'menu' && (
                                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10">
                                    <ProductManager />
                                </div>
                            )}
                            {activeTab === 'settings' && (
                                <div className="max-w-4xl">
                                    <VendorSettings />
                                </div>
                            )}
                            {activeTab === 'reviews' && (
                                <div className="space-y-8">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Customer Voice</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {reviews.map((review, i) => (
                                            <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center font-black">
                                                        {review.rating}.0
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900">{review.user?.name || 'Anonymous'}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 font-medium italic leading-relaxed">"{review.comment}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default VendorDashboard;
