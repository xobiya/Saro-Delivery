import { useContext, useState } from 'react';
import CartContext from '../context/CartContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const { cartItems, removeFromCart, totalPrice, clearCart } = useContext(CartContext);
    const [address, setAddress] = useState('My Current Location');
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (!cartItems.length) return;

        // Construct order payload
        // Note: For now, we assume single vendor per order, which is enforced by addToCart logic
        // We need the vendor ID from the items (all items have same vendorId)

        try {
            // We need coordinates for the backend validation. Hardcoding typical Arba Minch user location for demo
            const orderData = {
                pickupLocation: { address: 'Vendor Location' }, // Backend should ideally resolve this from Vendor ID, but for current Order model:
                dropoffLocation: {
                    address: address,
                    coordinates: { lat: 6.0333, lng: 37.5500 } // Default user location
                },
                items: cartItems.map(item => ({
                    name: item.name,
                    quantity: item.qty,
                    price: item.price
                })),
                totalAmount: totalPrice + 50, // + Delivery Fee
                notes: 'Please deliver to front gate'
            };

            const { data: orderResponse } = await api.post('/deliveries', orderData);

            // Initiate Chapa Payment
            try {
                const { data: paymentResponse } = await api.post('/payment/chapa', { orderId: orderResponse._id });
                if (paymentResponse.checkout_url) {
                    // Redirect to Chapa
                    window.location.href = paymentResponse.checkout_url;
                } else {
                    alert('Order Placed! Payment skipped (Demo Mode)');
                    clearCart();
                    navigate('/dashboard');
                }
            } catch (paymentError) {
                console.error("Payment Init Error:", paymentError);
                // Fallback if payment fails (e.g. invalid key in demo) but order created
                alert("Order created, but payment initialization failed. Please pay on delivery.");
                clearCart();
                navigate('/dashboard');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to place order');
        }
    };

    if (cartItems.length === 0) return null;

    return (
        <div style={styles.floater}>
            <div style={styles.header}>
                <h4>Your Cart ({cartItems.length})</h4>
                <button onClick={clearCart} style={styles.clearBtn}>Clear</button>
            </div>

            <div style={styles.items}>
                {cartItems.map(item => (
                    <div key={item._id} style={styles.item}>
                        <span>{item.qty}x {item.name}</span>
                        <span>{item.price * item.qty}</span>
                    </div>
                ))}
            </div>

            <div style={styles.summary}>
                <div style={styles.row}><span>Subtotal:</span> <span>{totalPrice} ETB</span></div>
                <div style={styles.row}><span>Delivery:</span> <span>50 ETB</span></div>
                <div style={{ ...styles.row, fontWeight: 'bold', marginTop: '0.5rem' }}>
                    <span>Total:</span> <span>{totalPrice + 50} ETB</span>
                </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    style={styles.input}
                    placeholder="Delivery Address"
                />
                <button onClick={handleCheckout} style={styles.checkoutBtn}>Checkout</button>
            </div>
        </div>
    );
};

const styles = {
    floater: {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '350px',
        backgroundColor: '#fff',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        padding: '1.5rem',
        border: '1px solid #ddd',
        zIndex: 1000,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '0.5rem',
    },
    clearBtn: {
        background: 'none',
        border: 'none',
        color: 'red',
        cursor: 'pointer',
        fontSize: '0.8rem',
    },
    items: {
        maxHeight: '150px',
        overflowY: 'auto',
        marginBottom: '1rem',
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    input: {
        width: '100%',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    checkoutBtn: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#27ae60',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
    }
};

export default CartDrawer;
