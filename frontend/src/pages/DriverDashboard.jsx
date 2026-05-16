import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import DeliveryCard from '../components/DeliveryCard';
import MapView from '../components/MapView';
import SocketContext from '../context/SocketContext';
import AuthContext from '../context/AuthContext';
import { FaMapMarkedAlt, FaList, FaHistory, FaWallet, FaToggleOn, FaToggleOff, FaMoneyBillWave } from 'react-icons/fa';

const DriverDashboard = () => {
    const [activeTab, setActiveTab] = useState('active'); // active, available, history, earnings
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const socket = useContext(SocketContext);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchOrders();

        if (socket) {
            socket.on('orders_updated', () => {
                fetchOrders();
            });
        }
        return () => {
            if (socket) socket.off('orders_updated');
        };
    }, [socket]);

    // Location Tracking Effect
    useEffect(() => {
        if (!isOnline || !socket) return;

        let watchId;
        const activeOrder = myActiveOrders.find(o => o._id === selectedOrderId) || myActiveOrders[0];
        
        if (activeOrder && (activeOrder.status === 'picked_up' || activeOrder.status === 'in_transit')) {
            if ('geolocation' in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        socket.emit('driver_location_update', {
                            orderId: activeOrder._id,
                            coordinates: { lat: latitude, lng: longitude }
                        });
                    },
                    (error) => console.error('Error watching position:', error),
                    { enableHighAccuracy: true, distanceFilter: 10 }
                );
            }
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isOnline, socket, selectedOrderId, myActiveOrders.length]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/deliveries');
            setOrders(data);

            // Auto-select the first active order if none selected
            const active = data.filter(o => {
                const driverId = o.driver?._id || o.driver;
                return driverId === user._id &&
                    o.status !== 'delivered' &&
                    o.status !== 'cancelled';
            });
            if (active.length > 0 && !selectedOrderId) {
                setSelectedOrderId(active[0]._id);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
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

    // Filter available orders: no driver assigned and not completed/cancelled
    const availableOrders = orders.filter(o =>
        !o.driver &&
        o.status !== 'delivered' &&
        o.status !== 'cancelled'
    );

    // Active orders: assigned to current driver and not finished
    const myActiveOrders = orders.filter(o => {
        const driverId = o.driver?._id || o.driver;
        return driverId === user._id &&
            o.status !== 'delivered' &&
            o.status !== 'cancelled';
    });

    // History: orders delivered by current driver
    const completedOrders = orders.filter(o => {
        const driverId = o.driver?._id || o.driver;
        return driverId === user._id && o.status === 'delivered';
    });

    const activeOrder = myActiveOrders.find(o => o._id === selectedOrderId) || myActiveOrders[0];

    // Calculate Earnings
    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.deliveryFee || 50), 0);
    const today = new Date().toDateString();
    const todayEarnings = completedOrders
        .filter(o => new Date(o.createdAt).toDateString() === today)
        .reduce((sum, order) => sum + (order.deliveryFee || 50), 0);

    const toggleStatus = () => {
        setIsOnline(!isOnline);
        // Ideally, this should make an API call to update the driver's status
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in-up">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 font-display">Driver Terminal</h2>
                        <p className="text-gray-500 mt-1">Manage your deliveries and track your earnings.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                        <button 
                            onClick={toggleStatus}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {isOnline ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                            {isOnline ? 'Online' : 'Offline'}
                        </button>
                        <button 
                            onClick={fetchOrders} 
                            disabled={loading}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-bold transition-colors border border-orange-100"
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-8 pb-2 hide-scrollbar animate-fade-in-up">
                    <button
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'active' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                        onClick={() => setActiveTab('active')}
                    >
                        <FaMapMarkedAlt /> My Active <span className={activeTab === 'active' ? 'bg-white/20 px-2 py-0.5 rounded-lg text-xs' : 'bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs'}>{myActiveOrders.length}</span>
                    </button>
                    <button
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'available' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                        onClick={() => setActiveTab('available')}
                    >
                        <FaList /> Available Jobs <span className={activeTab === 'available' ? 'bg-white/20 px-2 py-0.5 rounded-lg text-xs' : 'bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs'}>{availableOrders.length}</span>
                    </button>
                    <button
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <FaHistory /> History
                    </button>
                    <button
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'earnings' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                        onClick={() => setActiveTab('earnings')}
                    >
                        <FaWallet /> Earnings
                    </button>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {activeTab === 'active' && (
                        myActiveOrders.length === 0 ?
                            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                                <FaMapMarkedAlt className="text-6xl text-gray-200 mb-4" />
                                <h3 className="text-xl font-bold text-gray-700">No active deliveries</h3>
                                <p className="text-gray-500 mt-2">Check available jobs to start earning!</p>
                            </div> :
                            <div className="h-[60vh] bg-white rounded-3xl overflow-hidden border border-gray-200 relative shadow-sm">
                                <MapView
                                    pickup={activeOrder?.pickupLocation}
                                    dropoff={activeOrder?.dropoffLocation}
                                />
                                <div className="absolute top-4 left-4 w-full max-w-sm flex flex-col gap-3">
                                    <DeliveryCard
                                        key={activeOrder?._id}
                                        order={activeOrder}
                                        userRole="driver"
                                        onUpdateStatus={updateStatus}
                                        compact={true}
                                    />
                                    {myActiveOrders.length > 1 && (
                                        <div className="flex gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/50 overflow-x-auto hide-scrollbar">
                                            {myActiveOrders.map((o, i) => (
                                                <button
                                                    key={o._id}
                                                    onClick={() => setSelectedOrderId(o._id)}
                                                    className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${selectedOrderId === o._id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    Order {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                    )}

                    {activeTab === 'available' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {availableOrders.length === 0 ?
                                <div className="col-span-full bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                                    <FaList className="text-6xl text-gray-200 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-700">No new jobs available</h3>
                                    <p className="text-gray-500 mt-2">Check back later for new delivery requests.</p>
                                </div> :
                                availableOrders.map(order => (
                                    <DeliveryCard
                                        key={order._id}
                                        order={order}
                                        userRole="driver"
                                        onUpdateStatus={updateStatus}
                                    />
                                ))
                            }
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedOrders.length === 0 ?
                                <div className="col-span-full bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                                    <FaHistory className="text-6xl text-gray-200 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-700">No history</h3>
                                    <p className="text-gray-500 mt-2">You haven't completed any deliveries yet.</p>
                                </div> :
                                completedOrders.map(order => (
                                    <div key={order._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-gray-200 transition-colors">
                                        <div>
                                            <span className="font-mono font-bold text-gray-900 block mb-1">#{order._id.substring(0, 8).toUpperCase()}</span>
                                            <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block">✓ Delivered</span>
                                            <span className="block font-extrabold text-gray-900">{order.totalAmount} ETB</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {activeTab === 'earnings' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-20">
                                        <FaMoneyBillWave className="text-8xl" />
                                    </div>
                                    <h3 className="text-green-50 font-medium mb-2 relative z-10">Total Earnings</h3>
                                    <p className="text-4xl sm:text-5xl font-extrabold font-display relative z-10">{totalEarnings} <span className="text-2xl font-bold">ETB</span></p>
                                    <p className="mt-4 text-green-100 font-medium relative z-10 text-sm">Lifetime earnings from {completedOrders.length} deliveries</p>
                                </div>
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
                                    <h3 className="text-gray-500 font-medium mb-2">Today's Earnings</h3>
                                    <p className="text-4xl font-extrabold text-gray-900 font-display">{todayEarnings} <span className="text-2xl font-bold text-gray-400">ETB</span></p>
                                    <p className="mt-4 text-gray-500 font-medium text-sm">Keep up the great work!</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
