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
            </div>

            {!cartItems.length ? (
                <div className="card" style={{ marginTop: 'var(--space-8)' }}>
                    <div className="card-body">
                        <h3 className="text-xl font-semibold" style={{ marginTop: 0 }}>Your cart is empty</h3>
                        <p className="text-light">Browse vendors and add items to place an order.</p>
                        <Link to="/vendors" className="btn btn-primary">Browse Vendors</Link>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-6)', marginTop: 'var(--space-8)' }} className="checkout-grid">
                    {/* Left: Cart + Delivery Details */}
                    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
                        <div className="card">
                            <div className="card-body">
                                <div className="flex justify-between items-center" style={{ gap: 'var(--space-3)' }}>
                                    <h3 className="text-xl font-semibold" style={{ margin: 0 }}>Your Items</h3>
                                    <button type="button" className="btn btn-ghost" onClick={clearCart} disabled={submitting}>
                                        Clear cart
                                    </button>
                                </div>

                                <div style={{ marginTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-3)' }}>
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="flex justify-between items-center" style={{ gap: 'var(--space-4)' }}>
                                            <div style={{ display: 'grid', gap: 2 }}>
                                                <div style={{ fontWeight: 700 }}>{item.qty}× {item.name}</div>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => removeFromCart(item._id)}
                                                    disabled={submitting}
                                                    style={{ justifyContent: 'flex-start', padding: 0, minHeight: 'unset' }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div style={{ fontWeight: 600 }}>{item.price * item.qty} {t('common.etb')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-body">
                                <h3 className="text-xl font-semibold" style={{ marginTop: 0 }}>Delivery Details</h3>

                                <div style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                                    <div>
                                        <label className="label">Landmark (recommended)</label>
                                        <input
                                            className="input"
                                            value={deliveryDetails.landmark}
                                            onChange={(e) => setDeliveryDetails({ landmark: e.target.value })}
                                            placeholder={t('cart.addressPlaceholder')}
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Street / Area (optional)</label>
                                        <input
                                            className="input"
                                            value={deliveryDetails.address}
                                            onChange={(e) => setDeliveryDetails({ address: e.target.value })}
                                            placeholder="e.g., Secha area, near bus station"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Phone number</label>
                                        <input
                                            className="input"
                                            type="tel"
                                            value={deliveryDetails.phone}
                                            onChange={(e) => setDeliveryDetails({ phone: e.target.value })}
                                            placeholder={t('cart.phonePlaceholder')}
                                            disabled={submitting}
                                        />
                                        <div className="form-hint">We may call to confirm your landmark.</div>
                                    </div>

                                    <div>
                                        <label className="label">Instructions (optional)</label>
                                        <textarea
                                            className="textarea"
                                            value={deliveryDetails.instructions}
                                            onChange={(e) => setDeliveryDetails({ instructions: e.target.value })}
                                            placeholder={t('cart.instructionsPlaceholder')}
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Payment</label>
                                        <select
                                            className="select"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            disabled={submitting}
                                        >
                                            <option value="cash">{t('cart.payCash')}</option>
                                            <option value="chapa">{t('cart.payOnline')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary */}
                    <div style={{ display: 'grid', gap: 'var(--space-6)', alignContent: 'start' }}>
                        <div className="card">
                            <div className="card-body">
                                <h3 className="text-xl font-semibold" style={{ marginTop: 0 }}>Order Summary</h3>

                                <div style={{ display: 'grid', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                                    <div className="flex justify-between"><span>Subtotal</span><span>{totalPrice} {t('common.etb')}</span></div>
                                    <div className="flex justify-between"><span>Delivery fee</span><span>{DELIVERY_FEE_ETB} {t('common.etb')}</span></div>
                                    <div className="flex justify-between" style={{ fontWeight: 800, marginTop: 'var(--space-2)' }}>
                                        <span>Total</span><span>{totalWithDelivery} {t('common.etb')}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg"
                                    style={{ width: '100%', marginTop: 'var(--space-6)' }}
                                    onClick={handlePlaceOrder}
                                    disabled={!canCheckout}
                                >
                                    {submitting ? t('common.loading') : t('cart.checkout')}
                                </button>

                                {user?.name && (
                                    <div className="text-sm text-light" style={{ marginTop: 'var(--space-3)' }}>
                                        Signed in as <strong>{user.name}</strong>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-body">
                                <h4 className="text-lg font-semibold" style={{ marginTop: 0 }}>Tip</h4>
                                <p className="text-light" style={{ marginBottom: 0 }}>
                                    For Arba Minch deliveries, a clear landmark (hotel, campus gate, church, roundabout) helps drivers find you faster.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick responsive helper */}
            <style>{`
                @media (max-width: 900px) {
                    .checkout-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default Checkout;
