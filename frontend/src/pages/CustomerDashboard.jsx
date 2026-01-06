import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import DeliveryCard from '../components/DeliveryCard';
import VendorList from './VendorList';
import OrderForm from '../components/OrderForm';
import SocketContext from '../context/SocketContext';
import ToastContext from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const CustomerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const socket = useContext(SocketContext);
    const { addToast } = useContext(ToastContext);

    useEffect(() => {
        fetchOrders();

        // Check for payment success in URL
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');

        if (paymentStatus === 'success') {
            addToast('Payment successful! Your order is being prepared.', 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (paymentStatus === 'failed') {
            addToast('Payment failed. Please try again.', 'error');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (paymentStatus === 'amount_mismatch') {
            addToast('Payment amount mismatch detected. Please contact support.', 'error');
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (socket) {
            socket.on('orders_updated', () => {
                fetchOrders();
            });
        }

        return () => {
            if (socket) socket.off('orders_updated');
        };
    }, [socket]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/deliveries');
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            addToast('Failed to load orders. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const placeOrder = async (orderData) => {
        try {
            await api.post('/deliveries', { ...orderData, type: 'food_delivery' });
            addToast('Order placed successfully!', 'success');
            setShowForm(false);
            fetchOrders();
        } catch (error) {
            console.error('Error placing order:', error);
            addToast(error.response?.data?.message || 'Failed to place order. Please try again.', 'error');
        }
    };

    return (
        <div className="container">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6 mt-6">
                <h3 className="text-2xl font-semibold">Restaurants & Hotels</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`btn ${showForm ? 'btn-outline' : 'btn-secondary'}`}
                >
                    {showForm ? 'Cancel' : 'Place Custom Order'}
                </button>
            </div>

            {/* Custom Order Form */}
            {showForm && (
                <div className="card mb-6 slide-up">
                    <div className="card-body">
                        <h4 className="text-xl font-semibold mb-4">Custom Order</h4>
                        <OrderForm onSubmit={placeOrder} />
                    </div>
                </div>
            )}

            {/* Vendor List */}
            <VendorList />

            {/* My Orders Section */}
            <div className="mt-12">
                <h3 className="text-2xl font-semibold mb-6">My Recent Orders</h3>

                {loading ? (
                    <LoadingSpinner />
                ) : orders.length === 0 ? (
                    <EmptyState
                        icon="🍽️"
                        title="No orders yet"
                        description="Start by browsing our restaurants and hotels to place your first order"
                        actionLabel="Browse Vendors"
                        onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {orders.map((order) => (
                            <DeliveryCard key={order._id} order={order} userRole="customer" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
