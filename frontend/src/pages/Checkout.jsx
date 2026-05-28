import { useContext, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import { useLocale } from '../context/LocaleContext.jsx';
import api from '../utils/api';
import { 
    FaArrowLeft, 
    FaShoppingCart, 
    FaMapMarkerAlt, 
    FaMoneyBillWave, 
    FaCreditCard, 
    FaMotorcycle,
    FaReceipt
} from 'react-icons/fa';

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
    const [deliveryErrors, setDeliveryErrors] = useState({});
    const [flowError, setFlowError] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    const groupedItems = useMemo(() => {
        const map = new Map();
        cartItems.forEach((it) => {
            const key = it.vendorId || 'unknown';
            if (!map.has(key)) map.set(key, { vendorId: key, vendorName: it.vendorName || 'Vendor', items: [] });
            map.get(key).items.push(it);
        });
        return Array.from(map.values());
    }, [cartItems]);

    const orderCount = groupedItems.length;
    const hasMultipleVendors = orderCount > 1;
    const discountAmount = hasMultipleVendors ? 0 : (coupon?.discount || 0);

    const totalWithDelivery = useMemo(
        () => totalPrice + (orderCount ? DELIVERY_FEE_ETB * orderCount : 0) - discountAmount,
        [totalPrice, orderCount, discountAmount]
    );

    useEffect(() => {
        if (hasMultipleVendors && coupon) {
            setCoupon(null);
            setCouponCode('');
        }
    }, [hasMultipleVendors, coupon]);

    const canCheckout = cartItems.length > 0 && !submitting && Object.keys(deliveryErrors).length === 0 && deliveryDetails.landmark && deliveryDetails.phone && !(hasMultipleVendors && paymentMethod === 'chapa');

    const handleApplyCoupon = async () => {
        if (hasMultipleVendors) {
            addToast('Coupons apply to a single vendor order. Please split your order first.', 'info');
            return;
        }
        if (!couponCode.trim()) return;
        setValidatingCoupon(true);
        try {
            const { data } = await api.post('/coupons/validate', {
                code: couponCode,
                orderAmount: totalPrice
            });
            setCoupon(data);
            addToast('Coupon applied successfully!', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Invalid coupon', 'error');
            setCoupon(null);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handlePlaceOrder = async () => {
        setFlowError('');
        // Validate locally before submitting
        const errors = {};
        if (!deliveryDetails.landmark || !deliveryDetails.landmark.trim()) {
            errors.landmark = 'Please provide a recognizable landmark for delivery.';
        }

        const digits = (deliveryDetails.phone || '').replace(/\D/g, '');
        if (digits.length < 9) {
            errors.phone = 'Please enter a valid phone number (at least 9 digits).';
        }

        setDeliveryErrors(errors);
        if (Object.keys(errors).length > 0) return;

        if (!canCheckout) return;

        if (hasMultipleVendors && paymentMethod === 'chapa') {
            setFlowError('Online payment currently supports one vendor per order. Choose cash or split your order.');
            addToast('Online payment supports only one vendor per order.', 'warning');
            return;
        }

        if (!groupedItems.every((g) => g.vendorId && g.vendorId !== 'unknown')) {
            addToast('Missing vendor info. Please reopen the menu and add items again.', 'error');
            return;
        }

        // phone already validated above

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
            const buildOrderData = (group, groupTotal) => ({
                pickupLocation: { address: 'Vendor Location' },
                dropoffLocation: {
                    address: deliveryDetails.address || deliveryDetails.landmark || 'Arba Minch',
                    landmark: deliveryDetails.landmark || '',
                    phone: deliveryDetails.phone || '',
                    instructions: deliveryDetails.instructions || '',
                    coordinates: { lat: 6.0333, lng: 37.55 },
                },
                items: group.items.map((item) => ({
                    name: item.name,
                    quantity: item.qty,
                    price: item.price,
                })),
                totalAmount: groupTotal,
                vendorId: group.vendorId,
                paymentMethod,
                contactPhone: deliveryDetails.phone || '',
                notes,
                couponCode: coupon?.code,
                discountAmount,
            });

            const createdOrders = [];
            for (const group of groupedItems) {
                const groupSubtotal = group.items.reduce((sum, item) => sum + item.price * item.qty, 0);
                const groupTotal = groupSubtotal + DELIVERY_FEE_ETB - discountAmount;
                const { data: orderResponse } = await api.post('/deliveries', buildOrderData(group, groupTotal));
                createdOrders.push(orderResponse);
            }

            if (paymentMethod === 'cash') {
                addToast(`Order${createdOrders.length > 1 ? 's' : ''} placed! Pay cash on delivery.`, 'success');
                clearCart();
                navigate('/profile');
                return;
            }

            const primaryOrder = createdOrders[0];
            const { data: paymentResponse } = await api.post('/payment/chapa', { orderId: primaryOrder._id });
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

    // helpers for inline validation feedback
    const onDeliveryChange = (field, value) => {
        setDeliveryDetails({ ...deliveryDetails, [field]: value });

        // clear the field-specific error as user types
        if (deliveryErrors[field]) {
            const n = { ...deliveryErrors };
            delete n[field];
            setDeliveryErrors(n);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50">
            <div className="container max-w-6xl px-4 mx-auto">
                
                {/* Header */}
                <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <Link to="/vendors" className="flex items-center justify-center w-10 h-10 text-gray-500 transition-all bg-white rounded-full shadow-sm hover:text-orange-500 hover:shadow-md">
                            <FaArrowLeft />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 font-display">Checkout</h1>
                            <p className="text-gray-500">Complete your order details below</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8 md:grid-cols-4">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center justify-center text-orange-600 bg-orange-100 rounded-full w-9 h-9">
                            <FaShoppingCart />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Step 1</div>
                            <div className="font-semibold text-gray-800">Items</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center justify-center text-orange-600 bg-orange-100 rounded-full w-9 h-9">
                            <FaMapMarkerAlt />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Step 2</div>
                            <div className="font-semibold text-gray-800">Delivery</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center justify-center text-orange-600 bg-orange-100 rounded-full w-9 h-9">
                            <FaCreditCard />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Step 3</div>
                            <div className="font-semibold text-gray-800">Payment</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center justify-center text-orange-600 bg-orange-100 rounded-full w-9 h-9">
                            <FaReceipt />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Step 4</div>
                            <div className="font-semibold text-gray-800">Review</div>
                        </div>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="p-16 text-center bg-white border border-gray-100 shadow-sm rounded-3xl animate-fade-in-up">
                        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-orange-50">
                            <FaShoppingCart className="text-4xl text-orange-400" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">Your cart is empty</h2>
                        <p className="max-w-md mx-auto mb-8 text-gray-500">Looks like you haven't added any delicious items to your cart yet.</p>
                        <Link 
                            to="/vendors" 
                            className="inline-flex px-8 py-3 font-bold text-white transition-all transform bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 hover:shadow-orange-500/30 hover:-translate-y-1"
                        >
                            Browse Restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 lg:flex-row">
                        {/* Left Column: Form & Items */}
                        <div className="flex flex-col w-full gap-8 lg:w-2/3">
                            
                            {/* Order Items */}
                            <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl animate-fade-in-up">
                                <div className="flex items-center gap-3 px-6 py-4 bg-gray-900">
                                    <FaShoppingCart className="text-orange-500" />
                                    <h3 className="text-lg font-bold text-white">Your Items</h3>
                                </div>
                                <div className="p-6">
                                    {hasMultipleVendors && (
                                        <div className="p-4 mb-4 text-sm border rounded-xl bg-amber-50 border-amber-100 text-amber-700">
                                            You have items from {orderCount} vendors. We will place separate orders for each vendor.
                                        </div>
                                    )}
                                    <div className="divide-y divide-gray-100">
                                        {groupedItems.map((group) => (
                                            <div key={group.vendorId} className="py-2">
                                                <div className="flex items-center justify-between px-3 py-2 mb-3 border border-gray-100 rounded-lg bg-gray-50">
                                                    <div>
                                                        <div className="text-sm text-gray-600">From</div>
                                                        <div className="font-bold text-gray-900">{group.vendorName}</div>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-700">{group.items.length} items</div>
                                                </div>
                                                {group.items.map((item) => (
                                                    <div key={item._id} className="flex items-center gap-4 py-4 group">
                                                        <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-100 rounded-xl">
                                                            {item.imageUrl ? (
                                                                <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                                                            ) : (
                                                                <div className="flex items-center justify-center w-full h-full text-orange-300 bg-orange-50">No Img</div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                            <p className="text-sm text-gray-500">Qty: {item.qty} &times; {item.price} ETB</p>
                                                            <button
                                                                type="button"
                                                                className="mt-1 text-sm font-semibold text-red-500 transition-opacity opacity-0 hover:text-red-700 group-hover:opacity-100"
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
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Details */}
                            <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center gap-3 px-6 py-4 bg-gray-900">
                                    <FaMapMarkerAlt className="text-orange-500" />
                                    <h3 className="text-lg font-bold text-white">Delivery Details</h3>
                                </div>
                                <div className="p-6 space-y-6 md:p-8">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="block mb-2 text-sm font-bold text-gray-700">Landmark <span className="text-orange-500">*</span></label>
                                            <input
                                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors ${deliveryErrors.landmark ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                                value={deliveryDetails.landmark}
                                                onChange={(e) => onDeliveryChange('landmark', e.target.value)}
                                                placeholder="e.g. Next to Arba Minch University Gate"
                                                disabled={submitting}
                                            />
                                            {deliveryErrors.landmark && (
                                                <p className="mt-2 text-sm text-red-600">{deliveryErrors.landmark}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-bold text-gray-700">Phone Number <span className="text-orange-500">*</span></label>
                                            <input
                                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors ${deliveryErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                                type="tel"
                                                value={deliveryDetails.phone}
                                                onChange={(e) => onDeliveryChange('phone', e.target.value)}
                                                placeholder="+251 911..."
                                                disabled={submitting}
                                            />
                                            {deliveryErrors.phone && (
                                                <p className="mt-2 text-sm text-red-600">{deliveryErrors.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-gray-700">Street / Area (Optional)</label>
                                        <input
                                            className="w-full px-4 py-3 transition-colors border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                                            value={deliveryDetails.address}
                                            onChange={(e) => onDeliveryChange('address', e.target.value)}
                                            placeholder="e.g., Secha area, near bus station"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-gray-700">Delivery Instructions (Optional)</label>
                                        <textarea
                                            className="w-full px-4 py-3 transition-colors border border-gray-200 resize-y bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                                            rows="3"
                                            value={deliveryDetails.instructions}
                                            onChange={(e) => onDeliveryChange('instructions', e.target.value)}
                                            placeholder="Any special instructions for the driver?"
                                            disabled={submitting}
                                        />
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="block mb-4 text-sm font-bold text-gray-700">Payment Method</label>
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
                                        {hasMultipleVendors && paymentMethod === 'chapa' && (
                                            <p className="mt-3 text-sm text-amber-700">
                                                Online payment supports one vendor per order. Choose cash or split your order.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="w-full space-y-6 lg:w-1/3">
                            <div className="sticky overflow-hidden bg-white border border-gray-100 shadow-xl rounded-3xl top-28 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <div className="p-6 md:p-8">
                                    <h3 className="mb-6 text-xl font-extrabold text-gray-900">Order Summary</h3>
                                    
                                    <div className="mb-6 space-y-4">
                                        {groupedItems.map((g) => {
                                            const subtotal = g.items.reduce((s, it) => s + it.price * it.qty, 0);
                                            return (
                                                <div key={g.vendorId} className="flex items-center justify-between text-gray-600">
                                                    <span className="text-sm">{g.vendorName} subtotal</span>
                                                    <span className="font-medium text-gray-900">{subtotal} ETB</span>
                                                </div>
                                            );
                                        })}
                                        <div className="flex items-center justify-between text-gray-600">
                                            <span>Delivery Fee {orderCount > 1 ? `(x${orderCount})` : ''}</span>
                                            <span className="font-medium text-gray-900">{orderCount ? DELIVERY_FEE_ETB * orderCount : 0} ETB</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 mb-4 border-t border-gray-100">
                                        <label className="block mb-2 text-sm font-bold text-gray-700">Have a coupon?</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-2 font-bold uppercase border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                placeholder="Enter Code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                disabled={validatingCoupon || !!coupon || hasMultipleVendors}
                                            />
                                            <button
                                                type="button"
                                                onClick={coupon ? () => { setCoupon(null); setCouponCode(''); } : handleApplyCoupon}
                                                className={`px-4 py-2 rounded-xl font-bold transition-all ${coupon ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-900 text-white hover:bg-black'}`}
                                                disabled={validatingCoupon || hasMultipleVendors}
                                            >
                                                {validatingCoupon ? '...' : (coupon ? 'Remove' : 'Apply')}
                                            </button>
                                        </div>
                                        {hasMultipleVendors && (
                                            <p className="mt-2 text-xs text-gray-500">Coupons apply to a single vendor order.</p>
                                        )}
                                    </div>

                                    {coupon && (
                                        <div className="flex items-center justify-between p-3 mb-6 text-sm font-bold text-green-600 border border-green-100 bg-green-50 rounded-xl">
                                            <span>Discount Applied ({coupon.code})</span>
                                            <span>-{coupon.discount} ETB</span>
                                        </div>
                                    )}

                                    <div className="pt-4 mb-8 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-extrabold text-orange-500">{totalWithDelivery} ETB</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 mb-6 text-sm text-gray-600 border-t border-gray-100">
                                        <div className="flex justify-between">
                                            <span>Deliver to</span>
                                            <span className="font-semibold text-gray-800 text-right max-w-[180px]">{deliveryDetails.landmark || 'Add a landmark'}</span>
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span>Phone</span>
                                            <span className="font-semibold text-gray-800">{deliveryDetails.phone || 'Add phone number'}</span>
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span>Payment</span>
                                            <span className="font-semibold text-gray-800 capitalize">{paymentMethod}</span>
                                        </div>
                                    </div>

                                    {flowError && (
                                        <div className="p-3 mb-4 text-sm text-red-600 border border-red-100 rounded-xl bg-red-50">
                                            {flowError}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className="flex items-center justify-center w-full gap-2 px-6 py-4 font-bold text-white transition-all transform bg-orange-500 shadow-lg hover:bg-orange-600 rounded-xl hover:shadow-orange-500/30 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        onClick={handlePlaceOrder}
                                        disabled={!canCheckout}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div> Processing...
                                            </span>
                                        ) : (
                                            <span>{orderCount > 1 ? `Place ${orderCount} Orders` : 'Place Order Now'}</span>
                                        )}
                                    </button>

                                    {user?.name && (
                                        <p className="mt-4 text-sm text-center text-gray-500">
                                            Ordering as <span className="font-bold text-gray-700">{user.name}</span>
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex items-start gap-4 p-6 border-t border-orange-100 bg-orange-50">
                                    <FaMotorcycle className="flex-shrink-0 mt-1 text-2xl text-orange-500" />
                                    <p className="text-sm leading-relaxed text-orange-800">
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
