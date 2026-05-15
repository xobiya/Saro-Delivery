import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaPhoneAlt, FaMapMarkerAlt, FaMotorcycle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import api from '../utils/api';
import MapView from '../components/MapView';
import SocketContext from '../context/SocketContext';

const OrderTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const socket = useContext(SocketContext);

    useEffect(() => {
        fetchOrder();

        if (socket) {
            socket.emit('join_order', id);
            socket.on('order_status_updated', (updatedOrder) => {
                if (updatedOrder._id === id) {
                    setOrder(updatedOrder);
                }
            });
        }

        return () => {
            if (socket) socket.off('order_status_updated');
        };
    }, [id, socket]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/deliveries/${id}`);
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 pt-20">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin shadow-lg mb-4"></div>
                <h2 className="text-xl font-bold text-gray-700">Loading tracking data...</h2>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 pt-20 text-center">
                <FaCheckCircle className="text-6xl text-red-400 mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Not Found</h2>
                <p className="text-gray-500 mb-6">We couldn't find the order you are looking for.</p>
                <button onClick={() => navigate('/profile')} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-600 transition-colors shadow-lg">Go to Profile</button>
            </div>
        );
    }

    const deliveryPhone = order.dropoffLocation?.phone || order.contactPhone || order.user?.phone;

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Waiting for confirmation...';
            case 'preparing': return 'Chef is preparing your meal 👨‍🍳';
            case 'ready': return 'Order is ready and waiting for driver 🛵';
            case 'picked_up': return 'Driver has picked up your order!';
            case 'in_transit': return 'Driver is on the way to you! 🏁';
            case 'delivered': return 'Enjoy your meal! Delivered. ✅';
            default: return status;
        }
    };
    
    const getProgressWidth = (status) => {
        switch (status) {
            case 'pending': return '20%';
            case 'preparing': return '40%';
            case 'ready': return '50%';
            case 'picked_up': return '60%';
            case 'in_transit': return '80%';
            case 'delivered': return '100%';
            default: return '20%';
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-6xl h-full flex flex-col">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-orange-500 hover:shadow-md transition-all"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-display">Track Order <span className="text-orange-500">#{id.substring(0, 8).toUpperCase()}</span></h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-[calc(100vh-200px)] min-h-[600px] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    
                    {/* Map Side */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                        <MapView
                            pickup={order.pickupLocation}
                            dropoff={order.dropoffLocation}
                        />
                        {/* Overlay Status Badge */}
                        <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 z-10">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Live Status</span>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3">{getStatusText(order.status)}</h3>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000 ease-out"
                                    style={{ width: getProgressWidth(order.status) }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Info Side */}
                    <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-2">
                        
                        {/* Delivery Details Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
                            <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
                                <FaMapMarkerAlt className="text-orange-500" />
                                <h3 className="text-lg font-bold text-white">Delivery Details</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</p>
                                        <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</p>
                                        <p className="font-medium text-gray-900">{order.dropoffLocation?.address}</p>
                                    </div>
                                    {order.dropoffLocation?.landmark && (
                                        <div className="border-t border-gray-100 pt-4">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Landmark</p>
                                            <p className="font-medium text-gray-900">{order.dropoffLocation.landmark}</p>
                                        </div>
                                    )}
                                    {order.dropoffLocation?.instructions && (
                                        <div className="border-t border-gray-100 pt-4">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Instructions</p>
                                            <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-xl italic mt-1 border border-orange-100">"{order.dropoffLocation.instructions}"</p>
                                        </div>
                                    )}

                                    {deliveryPhone && (
                                        <div className="border-t border-gray-100 pt-6 mt-2">
                                            <a
                                                href={`tel:${deliveryPhone}`}
                                                className="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                                                aria-label="Call customer"
                                            >
                                                <FaPhoneAlt /> Call Customer
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Driver Card */}
                        {order.driver && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
                                <div className="p-6">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Your Delivery Hero</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl shadow-inner border-2 border-orange-50 text-orange-500">
                                            <FaMotorcycle />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-gray-900">{order.driver.name}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-bold text-green-600">On Duty</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Order Summary */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0 mt-auto">
                            <div className="p-6 bg-gray-50">
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-gray-500">Items ({order.items?.length || 0})</span>
                                    <span className="font-medium">{order.totalAmount - (order.deliveryFee || 50)} ETB</span>
                                </div>
                                <div className="flex justify-between items-center mb-4 text-sm">
                                    <span className="text-gray-500">Delivery Fee</span>
                                    <span className="font-medium">{order.deliveryFee || 50} ETB</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="font-bold text-gray-900">Total Paid</span>
                                    <span className="font-extrabold text-orange-500 text-xl">{order.totalAmount} ETB</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
