import { useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import { useLocale } from '../context/LocaleContext.jsx';
import api from '../utils/api';

const DELIVERY_FEE_ETB = 50;

const Checkout = () => {
    const {
        cartItems,
        removeFromCart,
        totalPrice,
        clearCart,
        deliveryDetails,
        setDeliveryDetails,
        paymentMethod,
        setPaymentMethod,
    } = useContext(CartContext);

    const { user } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const { t } = useLocale();
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);

    const totalWithDelivery = useMemo(
        () => totalPrice + (cartItems.length ? DELIVERY_FEE_ETB : 0),
        [totalPrice, cartItems.length]
    );

    const canCheckout = cartItems.length > 0 && !submitting;

    const handlePlaceOrder = async () => {
        if (!canCheckout) return;

        const vendorId = cartItems[0]?.vendorId;
        if (!vendorId) {
            addToast('Missing vendor info. Please reopen the menu and add items again.', 'error');
            return;
        }

        const digits = (deliveryDetails.phone || '').replace(/\D/g, '');
        if (digits.length < 9) {
            addToast('Please add a valid phone number for delivery.', 'error');
            return;
        }

        setSubmitting(true);

        try {
            const notes = [
                deliveryDetails.landmark ? `Landmark: ${deliveryDetails.landmark}` : null,
                deliveryDetails.address ? `Address: ${deliveryDetails.address}` : null,
                deliveryDetails.phone ? `Phone: ${deliveryDetails.phone}` : null,
                deliveryDetails.instructions ? `Instructions: ${deliveryDetails.instructions}` : null,
            ]
                .filter(Boolean)
                .join(' | ');

            const orderData = {
                pickupLocation: { address: 'Vendor Location' },
                dropoffLocation: {
                    address: deliveryDetails.address || deliveryDetails.landmark || 'Arba Minch',
                    landmark: deliveryDetails.landmark || '',
                    phone: deliveryDetails.phone || '',
                    instructions: deliveryDetails.instructions || '',
                    coordinates: { lat: 6.0333, lng: 37.55 },
                },
                items: cartItems.map((item) => ({
                    name: item.name,
                    quantity: item.qty,
                    price: item.price,
                })),
                totalAmount: totalWithDelivery,
                vendorId,
                paymentMethod,
                contactPhone: deliveryDetails.phone || '',
                notes,
            };

            const { data: orderResponse } = await api.post('/deliveries', orderData);

            if (paymentMethod === 'cash') {
                addToast('Order placed! Pay cash on delivery.', 'success');
                clearCart();
                navigate('/profile');
                return;
            }

            const { data: paymentResponse } = await api.post('/payment/chapa', { orderId: orderResponse._id });
            if (paymentResponse.checkout_url) {
                window.location.href = paymentResponse.checkout_url;
                return;
            }

            addToast('Order placed! Payment skipped (Demo Mode)', 'success');
            clearCart();
            navigate('/profile');
        } catch (error) {
            console.error(error);
            addToast(error?.response?.data?.message || 'Failed to place order', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: 980, marginTop: 'var(--space-10)' }}>
            <div className="flex justify-between items-center" style={{ gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div>
                    <h2 className="text-3xl font-bold" style={{ margin: 0 }}>Checkout</h2>
                    <p className="text-light" style={{ marginTop: 'var(--space-2)' }}>
                        Confirm your order and delivery details.
                    </p>
                </div>
                <Link to="/vendors" className="btn btn-outline">Continue Shopping</Link>
        <div className="bg-gray-50 min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <Link to="/vendors" className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-orange-500 hover:shadow-md transition-all">
                            <FaArrowLeft />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 font-display">Checkout</h1>
                            <p className="text-gray-500">Complete your order details below</p>
                        </div>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center animate-fade-in-up">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaShoppingCart className="text-4xl text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added any delicious items to your cart yet.</p>
                        <Link 
                            to="/vendors" 
                            className="inline-flex bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1"
                        >
                            Browse Restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column: Form & Items */}
                        <div className="w-full lg:w-2/3 flex flex-col gap-8">
                            
                            {/* Order Items */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                                <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
                                    <FaShoppingCart className="text-orange-500" />
                                    <h3 className="text-lg font-bold text-white">Your Items</h3>
                                </div>
                                <div className="p-6">
                                    <div className="divide-y divide-gray-100">
                                        {cartItems.map((item) => (
                                            <div key={item._id} className="py-4 flex gap-4 items-center group">
                                                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-300">No Img</div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                    <p className="text-gray-500 text-sm">Qty: {item.qty} &times; {item.price} ETB</p>
                                                    <button
                                                        type="button"
                                                        className="text-red-500 text-sm font-semibold hover:text-red-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeFromCart(item._id)}
                                                        disabled={submitting}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="text-lg font-extrabold text-gray-900">
                                                    {item.price * item.qty} <span className="text-sm font-normal text-gray-500">ETB</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Details */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
                                    <FaMapMarkerAlt className="text-orange-500" />
                                    <h3 className="text-lg font-bold text-white">Delivery Details</h3>
                                </div>
                                <div className="p-6 md:p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Landmark <span className="text-orange-500">*</span></label>
                                            <input
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                                                value={deliveryDetails.landmark}
                                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, landmark: e.target.value })}
                                                placeholder="e.g. Next to Arba Minch University Gate"
                                                disabled={submitting}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number <span className="text-orange-500">*</span></label>
                                            <input
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                                                type="tel"
                                                value={deliveryDetails.phone}
                                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                                                placeholder="+251 911..."
                                                disabled={submitting}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Street / Area (Optional)</label>
                                        <input
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                                            value={deliveryDetails.address}
                                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                                            placeholder="e.g., Secha area, near bus station"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Instructions (Optional)</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors resize-y"
                                            rows="3"
                                            value={deliveryDetails.instructions}
                                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, instructions: e.target.value })}
                                            placeholder="Any special instructions for the driver?"
                                            disabled={submitting}
                                        />
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="block text-sm font-bold text-gray-700 mb-4">Payment Method</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white hover:border-orange-200'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    value="cash" 
                                                    checked={paymentMethod === 'cash'} 
                                                    onChange={() => setPaymentMethod('cash')} 
                                                    className="hidden" 
                                                />
                                                <FaMoneyBillWave className={paymentMethod === 'cash' ? 'text-orange-500' : 'text-gray-400'} />
                                                <span className="font-bold">Cash on Delivery</span>
                                            </label>
                                            <label className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'chapa' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white hover:border-orange-200'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    value="chapa" 
                                                    checked={paymentMethod === 'chapa'} 
                                                    onChange={() => setPaymentMethod('chapa')} 
                                                    className="hidden" 
                                                />
                                                <FaCreditCard className={paymentMethod === 'chapa' ? 'text-orange-500' : 'text-gray-400'} />
                                                <span className="font-bold">Online (Chapa)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="w-full lg:w-1/3 space-y-6">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-28 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <div className="p-6 md:p-8">
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h3>
                                    
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-gray-900">{totalPrice} ETB</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>Delivery Fee</span>
                                            <span className="font-medium text-gray-900">{DELIVERY_FEE_ETB} ETB</span>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-gray-100 pt-4 mb-8">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-extrabold text-orange-500">{totalWithDelivery} ETB</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        onClick={handlePlaceOrder}
                                        disabled={!canCheckout}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...
                                            </span>
                                        ) : (
                                            <span>Place Order Now</span>
                                        )}
                                    </button>

                                    {user?.name && (
                                        <p className="text-center text-sm text-gray-500 mt-4">
                                            Ordering as <span className="font-bold text-gray-700">{user.name}</span>
                                        </p>
                                    )}
                                </div>
                                
                                <div className="bg-orange-50 p-6 border-t border-orange-100 flex gap-4 items-start">
                                    <FaMotorcycle className="text-orange-500 text-2xl flex-shrink-0 mt-1" />
                                    <p className="text-sm text-orange-800 leading-relaxed">
                                        For faster deliveries in Arba Minch, please provide a clear, easily recognizable landmark (e.g. hotel, campus gate, church).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
