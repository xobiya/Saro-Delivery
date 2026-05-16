import React from 'react';

const DeliveryCard = ({ order, onUpdateStatus, userRole, compact = false }) => {
    const isDriver = userRole === 'driver';

    const handleStatusChange = (newStatus) => {
        if (onUpdateStatus) {
            onUpdateStatus(order._id, newStatus);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return '#27ae60';
            case 'cancelled': return '#e74c3c';
            case 'in_transit': return '#f39c12';
            case 'picked_up': return '#3498db';
            case 'preparing': return '#9b59b6';
            default: return '#7f8c8d';
        }
    };

    const openNavigation = (location) => {
        if (location?.coordinates?.lat && location?.coordinates?.lng) {
            window.open(`https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps?q=${encodeURIComponent(location.address + ', Arba Minch')}`, '_blank');
        }
    };

    return (
        <div className={`${compact ? 'bg-white/90 backdrop-blur-md p-4 shadow-lg border-white/50' : 'bg-white p-6 shadow-sm border-gray-100'} rounded-2xl border flex flex-col mb-4 transition-all hover:shadow-md`}>
            {!compact && (
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-800 font-mono">#{order._id.substring(0, 8).toUpperCase()}</span>
                        <span 
                            className="text-white px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wide"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                            {order.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-100">
                        {order.type === 'food_delivery' ? '🍕 Food' : '📦 Package'}
                        <span className={`text-[10px] px-2 py-0.5 rounded text-white font-bold ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-orange-500'}`}>
                            {order.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                        </span>
                    </div>
                </div>
            )}

            {userRole === 'customer' && order.status !== 'pending' && order.status !== 'cancelled' && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4 text-center hover:bg-blue-100 transition-colors">
                    <a href={`/track/${order._id}`} className="text-blue-600 font-bold text-sm flex justify-center items-center gap-2">
                        🛰️ Live Track Delivery
                    </a>
                </div>
            )}

            <div className="flex-1">
                {!compact && (
                    <div className="flex flex-col relative mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 ring-4 ring-blue-100"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">Pickup</span>
                                <span className="text-sm text-gray-800 font-medium">{order.pickupLocation?.address}</span>
                            </div>
                        </div>
                        <div className="w-0.5 h-6 bg-gray-200 ml-1.5 my-1"></div>
                        <div className="flex items-start gap-4">
                            <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 ring-4 ring-orange-100"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">Drop Off</span>
                                <span className="text-sm text-gray-800 font-medium">{order.dropoffLocation?.address}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => openNavigation(order.dropoffLocation)} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold shadow-sm transition-colors"
                        >
                            📍 Navigate
                        </button>
                    </div>
                )}

                {isDriver && order.user && (
                    <div className={`${compact ? 'bg-blue-50/50 p-3 rounded-xl mb-3' : 'bg-blue-50 p-4 rounded-xl mb-6'} flex justify-between items-center border border-blue-100`}>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-sm">{order.user.name}</span>
                            <span className="text-xs text-blue-600 font-medium">{order.user.phone}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <a href={`tel:${order.user.phone}`} className="bg-white text-green-600 px-3 py-1.5 rounded-lg border border-green-200 text-xs font-bold hover:bg-green-50 transition-colors shadow-sm">
                                📞 Call
                            </a>
                            {compact && (
                                <button onClick={() => openNavigation(order.dropoffLocation)} className="bg-white text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm">
                                    📍 Nav
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {!compact && (
                    <div className="border-t border-gray-100 pt-4 mb-6">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Order Summary</span>
                        <div className="space-y-2">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm text-gray-600">
                                    <span><span className="font-bold text-gray-800">{item.quantity}x</span> {item.name}</span>
                                    <span className="font-medium">{item.price * item.quantity} ETB</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 pt-3 border-t border-dashed border-gray-200 font-bold text-orange-600 text-lg">
                            <span>Total Pay</span>
                            <span>{order.totalAmount} ETB</span>
                        </div>
                    </div>
                )}

                {order.notes && !compact && (
                    <div className="text-sm text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100 mb-6">
                        <strong className="font-bold mr-1">Note:</strong> {order.notes}
                    </div>
                )}
            </div>

            {isDriver && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="mt-auto pt-2">
                    {!order.driver ? (
                        <button 
                            onClick={() => handleStatusChange('confirmed')} 
                            className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold shadow-md transition-colors"
                        >
                            Accept Job
                        </button>
                    ) : (
                        <div className="flex w-full">
                            {(order.status === 'confirmed' || order.status === 'preparing') && (
                                <div className="text-center py-3 text-purple-600 font-bold w-full bg-purple-50 rounded-xl border border-purple-100">
                                    Waiting for Vendor...
                                </div>
                            )}
                            {order.status === 'ready' && (
                                <button 
                                    onClick={() => handleStatusChange('picked_up')} 
                                    className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-md transition-colors"
                                >
                                    Confirm Pickup
                                </button>
                            )}
                            {order.status === 'picked_up' && (
                                <button 
                                    onClick={() => handleStatusChange('in_transit')} 
                                    className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md transition-colors"
                                >
                                    Start Delivery
                                </button>
                            )}
                            {order.status === 'in_transit' && (
                                <button 
                                    onClick={() => handleStatusChange('delivered')} 
                                    className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-md transition-colors"
                                >
                                    Complete Delivery
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeliveryCard;
