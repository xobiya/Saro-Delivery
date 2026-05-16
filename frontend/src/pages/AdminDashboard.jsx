import { useState, useEffect, useContext } from 'react';
import { HiOutlineArrowPath, HiOutlineUserCircle } from 'react-icons/hi2';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

// Admin Components
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';
import OverviewTab from '../components/admin/OverviewTab';
import UserHub from '../components/admin/UserHub';
import MerchantNetwork from '../components/admin/MerchantNetwork';
import OrderPipeline from '../components/admin/OrderPipeline';
import PromotionsHub from '../components/admin/PromotionsHub';
import LiveOps from '../components/admin/LiveOps';
import FleetHub from '../components/admin/FleetHub';
import Financials from '../components/admin/Financials';
import SystemSettings from '../components/admin/SystemSettings';
import MenuManagement from '../components/admin/MenuManagement';
import SupportCenter from '../components/admin/SupportCenter';
import ContentHub from '../components/admin/ContentHub';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Data states
    const [stats, setStats] = useState({ users: 0, vendors: 0, orders: 0, revenue: 0 });
    const [usersList, setUsersList] = useState([]);
    const [vendorsList, setVendorsList] = useState([]);
    const [ordersList, setOrdersList] = useState([]);
    const [couponsList, setCouponsList] = useState([]);
    const [chartData, setChartData] = useState([]);

    // Coupon form state
    const [newCoupon, setNewCoupon] = useState({
        code: '', discountType: 'percentage', discountValue: 0, minOrderAmount: 0, expiresAt: '', usageLimit: 0
    });
    const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, vendorsRes, ordersRes, couponsRes, adminStatsRes] = await Promise.all([
                api.get('/auth/users').catch(() => ({ data: [] })),
                api.get('/vendors'),
                api.get('/deliveries'),
                api.get('/coupons').catch(() => ({ data: [] })),
                api.get('/admin/stats').catch(() => ({ data: { stats: {}, chartData: [] } }))
            ]);
            
            setStats({
                users: adminStatsRes.data.stats.users || usersRes.data?.length || 0,
                vendors: adminStatsRes.data.stats.vendors || vendorsRes.data?.length || 0,
                orders: adminStatsRes.data.stats.orders || ordersRes.data?.length || 0,
                revenue: adminStatsRes.data.stats.revenue || 0
            });

            setUsersList(usersRes.data || []);
            setVendorsList(vendorsRes.data || []);
            setOrdersList(ordersRes.data || []);
            setCouponsList(couponsRes.data || []);
            setChartData(adminStatsRes.data.chartData || []);

        } catch (error) {
            addToast('Failed to synchronize platform data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId, updateData) => {
        try {
            await api.put(`/auth/users/${userId}`, updateData);
            addToast('Identity updated successfully', 'success');
            fetchData();
        } catch (error) {
            addToast('Failed to update identity', 'error');
        }
    };

    const handleCreateDriver = async (driverData) => {
        try {
            await api.post('/auth/register', driverData);
            addToast('Fleet operator registered', 'success');
            fetchData();
        } catch (error) {
            addToast('Failed to register operator', 'error');
        }
    };

    const handleUpdateOrder = async (orderId, status) => {
        try {
            await api.put(`/deliveries/${orderId}`, { status });
            addToast('Logistics status updated', 'success');
            fetchData();
        } catch (error) {
            addToast('Failed to sync logistics', 'error');
        }
    };

    const handleCreateVendor = async (vendorData) => {
        try {
            await api.post('/vendors', vendorData);
            addToast('Merchant onboarded successfully', 'success');
            fetchData();
        } catch (error) {
            addToast('Merchant onboarding failed', 'error');
        }
    };

    const handleUpdateVendor = async (vendorId, updateData) => {
        try {
            await api.put(`/vendors/${vendorId}`, updateData);
            addToast('Merchant profile updated', 'success');
            fetchData();
        } catch (error) {
            addToast('Failed to update merchant', 'error');
        }
    };

    const handleDeleteVendor = async (vendorId) => {
        if (window.confirm('Remove this merchant from the platform?')) {
            try {
                await api.delete(`/vendors/${vendorId}`);
                addToast('Merchant removed', 'success');
                fetchData();
            } catch (error) {
                addToast('Failed to remove merchant', 'error');
            }
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const headers = lines[0].split(',');
            const data = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, i) => {
                    obj[header.trim()] = values[i]?.trim();
                    return obj;
                }, {});
            }).filter(item => item.businessName || item.name); // basic validation

            try {
                const type = data[0].businessName ? 'vendors' : 'products';
                const res = await api.post('/admin/import', { type, data });
                addToast(res.data.message, 'success');
                fetchData();
            } catch (error) {
                addToast('Bulk import failed. Check CSV format.', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        setIsCreatingCoupon(true);
        try {
            await api.post('/coupons', newCoupon);
            addToast('Campaign initialized', 'success');
            setNewCoupon({ code: '', discountType: 'percentage', discountValue: 0, minOrderAmount: 0, expiresAt: '', usageLimit: 0 });
            fetchData();
        } catch (error) {
            addToast('Campaign failed to initialize', 'error');
        } finally {
            setIsCreatingCoupon(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
                <HiOutlineUserCircle className="text-9xl text-orange-500 mb-6 animate-pulse" />
                <h2 className="text-4xl font-black tracking-tighter uppercase">Forbidden</h2>
                <Link to="/" className="mt-8 px-10 py-4 bg-orange-500 rounded-full font-black hover:bg-orange-600 transition-all">Return to Portal</Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} logout={handleLogout} />

            <main className={`${isSidebarOpen ? 'ml-72' : 'ml-20'} flex-1 transition-all duration-500 min-h-screen flex flex-col`}>
                <AdminHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} user={user} activeTab={activeTab} onImport={handleImport} />

                <div className="p-10 max-w-7xl mx-auto w-full flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-60">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-slate-900 rounded-lg animate-pulse"></div>
                                </div>
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mt-8">Synchronizing Platform Hub</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {activeTab === 'overview' && <OverviewTab stats={stats} chartData={chartData} />}
                            {activeTab === 'live-ops' && <LiveOps ordersList={ordersList} />}
                            {activeTab === 'orders' && <OrderPipeline ordersList={ordersList} onUpdateOrder={handleUpdateOrder} />}
                            {activeTab === 'users' && <UserHub usersList={usersList} onUpdateUser={handleUpdateUser} />}
                            {activeTab === 'vendors' && <MerchantNetwork vendorsList={vendorsList} onUpdateVendor={handleUpdateVendor} onCreateVendor={handleCreateVendor} onDeleteVendor={handleDeleteVendor} />}
                            {activeTab === 'menu' && <MenuManagement vendorsList={vendorsList} />}
                            {activeTab === 'fleet' && <FleetHub usersList={usersList} onUpdateUser={handleUpdateUser} onCreateDriver={handleCreateDriver} onDeleteDriver={handleUpdateUser} />}
                            {activeTab === 'marketing' && (
                                <div className="space-y-12">
                                    <PromotionsHub couponsList={couponsList} newCoupon={newCoupon} setNewCoupon={setNewCoupon} handleCreateCoupon={handleCreateCoupon} isCreatingCoupon={isCreatingCoupon} />
                                    <ContentHub />
                                </div>
                            )}
                            {activeTab === 'finance' && <Financials chartData={chartData} />}
                            {activeTab === 'support' && <SupportCenter />}
                            {activeTab === 'settings' && <SystemSettings />}
                        </div>
                    )}
                </div>
                
                <footer className="px-10 py-6 border-t border-slate-100 bg-white/50 backdrop-blur-sm text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saro Platform Engine v2.4.0 • Secured Administrative Access</p>
                </footer>
            </main>
        </div>
    );
};

export default AdminDashboard;
