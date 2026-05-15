import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import SocketContext from '../context/SocketContext';
import ProductManager from '../components/ProductManager';
import { FaBoxOpen, FaClipboardList, FaCheckCircle, FaMoneyBillWave, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

const VendorDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [view, setView] = useState('orders'); // 'orders' or 'products'
    const socket = useContext(SocketContext);

    useEffect(() => {
        // Only fetch orders if in orders view (optional optimization, but good practice)
        if (view === 'orders') {
            fetchOrders();
        }
    }, [view]);

    useEffect(() => {
        if (view === 'orders') {
            fetchOrders();
        }

        if (socket) {
            socket.on('orders_updated', (data) => {
                if (view === 'orders') fetchOrders();
            });
        }

        return () => {
            if (socket) socket.off('orders_updated');
        };
    }, [socket, view]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/deliveries');
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/deliveries/${id}`, { status });
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        }
    };

    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    const historyOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
    const totalRevenue = historyOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const [orderSubTab, setOrderSubTab] = useState('active'); // 'active' or 'history'

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ready': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'picked_up': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'in_transit': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in-up">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 font-display">Vendor Dashboard</h2>
                        <p className="text-gray-500 mt-1">Manage your restaurant orders and products.</p>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-200 animate-fade-in-up">
                    <button
                        className={`pb-4 px-4 text-lg font-bold transition-all relative ${view === 'orders' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setView('orders')}
                    >
                        <span className="flex items-center gap-2"><FaClipboardList /> Orders</span>
                        {view === 'orders' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t-lg"></div>}
                    </button>
                    <button
                        className={`pb-4 px-4 text-lg font-bold transition-all relative ${view === 'products' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setView('products')}
                    >
                        <span className="flex items-center gap-2"><FaBoxOpen /> Menu & Products</span>
                        {view === 'products' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t-lg"></div>}
                    </button>
                </div>

                {view === 'orders' ? (
                    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        
                        {/* Sub Tabs and Stats */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setOrderSubTab('active')}
                                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${orderSubTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <FaClock className={orderSubTab === 'active' ? 'text-orange-500' : ''} /> 
                                    Active Orders <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{activeOrders.length}</span>
                                </button>
                                <button
                                    onClick={() => setOrderSubTab('history')}
                                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${orderSubTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <FaCheckCircle className={orderSubTab === 'history' ? 'text-green-500' : ''} /> 
                                    History <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{historyOrders.length}</span>
                                </button>
                            </div>
                            
                            {orderSubTab === 'history' && (
                                <div className="flex items-center gap-3 bg-green-50 px-5 py-3 rounded-xl border border-green-100">
                                    <FaMoneyBillWave className="text-green-500 text-xl" />
                                    <div>
                                        <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Total Revenue</p>
                                        <p className="text-xl font-extrabold text-green-600 leading-none">{totalRevenue} ETB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Orders List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orderSubTab === 'active' ? (
                                activeOrders.length === 0 ? (
                                    <div className="col-span-full py-16 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                                        <FaClipboardList className="text-6xl text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-700">No active orders right now</h3>
                                        <p className="text-gray-500">When customers place orders, they will appear here.</p>
                                    </div>
                                ) : (
                                    activeOrders.map((order, index) => (
                                        <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                                            <div className="p-5 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Order ID</span>
                                                    <h4 className="font-mono font-bold text-gray-900">#{order._id.substring(0, 6).toUpperCase()}</h4>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            
                                            <div className="p-5 flex-1">
                                                <p className="mb-4 text-sm text-gray-600 border-b border-gray-100 pb-4">
                                                    <span className="font-bold text-gray-900">Customer:</span> {order.user?.name || 'Guest'}
                                                </p>
                                                
                                                <div className="space-y-2 mb-4">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="font-medium text-gray-800"><span className="text-orange-500 font-bold">{item.quantity}x</span> {item.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                                                    <span className="font-bold text-gray-500 text-sm">Total</span>
                                                    <span className="font-extrabold text-lg text-gray-900">{order.totalAmount} ETB</span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 bg-gray-50 border-t border-gray-100 gap-2 flex flex-col sm:flex-row">
                                                {(order.status === 'pending' || order.status === 'confirmed') && (
                                                    <button 
                                                        onClick={() => updateStatus(order._id, 'preparing')} 
                                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm text-sm"
                                                    >
                                                        Start Preparing
                                                    </button>
                                                )}
                                                {order.status === 'preparing' && (
                                                    <button 
                                                        onClick={() => updateStatus(order._id, 'ready')} 
                                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm text-sm"
                                                    >
                                                        Mark Ready
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                historyOrders.length === 0 ? (
                                    <div className="col-span-full py-16 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                                        <FaHistory className="text-6xl text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-700">No order history</h3>
                                    </div>
                                ) : (
                                    historyOrders.map((order, index) => (
                                        <div key={order._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                                <h4 className="font-mono font-bold text-gray-600 text-sm">#{order._id.substring(0, 6).toUpperCase()}</h4>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="p-4 text-sm flex-1">
                                                <p className="mb-2"><span className="font-bold text-gray-700">Customer:</span> {order.user?.name || 'Guest'}</p>
                                                <p className="mb-3 text-gray-500 text-xs">{new Date(order.updatedAt).toLocaleString()}</p>
                                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-auto">
                                                    <span className="font-bold text-gray-500">Total</span>
                                                    <span className="font-bold text-gray-900">{order.totalAmount} ETB</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <ProductManager />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorDashboard;
