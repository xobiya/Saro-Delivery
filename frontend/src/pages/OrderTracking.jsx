import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    if (loading) return <div style={styles.loading}>Loading tracking data...</div>;
    if (!order) return <div style={styles.error}>Order not found or access denied.</div>;

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Waitng for confirmation...';
            case 'preparing': return 'Chef is preparing your meal 👨‍🍳';
            case 'ready': return 'Order is ready and waiting for driver 🛵';
            case 'picked_up': return 'Driver has picked up your order!';
            case 'in_transit': return 'Driver is on the way to you! 🏁';
            case 'delivered': return 'Enjoy your meal! Delivered. ✅';
            default: return status;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>&larr; Dashboard</button>
                <h2 style={styles.title}>Track Order #{id.substring(0, 8)}</h2>
            </div>

            <div style={styles.grid}>
                <div style={styles.mapSide}>
                    <MapView
                        pickup={order.pickupLocation}
                        dropoff={order.dropoffLocation}
                    />
                </div>

                <div style={styles.infoSide}>
                    <div style={styles.statusCard}>
                        <span style={styles.statusLabel}>Current Status</span>
                        <h3 style={styles.statusText}>{getStatusText(order.status)}</h3>
                        <div style={styles.progressBar}>
                            <div style={{
                                ...styles.progressFill,
                                width: order.status === 'delivered' ? '100%' :
                                    order.status === 'in_transit' ? '80%' :
                                        order.status === 'picked_up' ? '60%' :
                                            order.status === 'ready' ? '40%' : '20%'
                            }} />
                        </div>
                    </div>

                    <div style={styles.driverCard}>
                        <h4>Delivery Details</h4>
                        <p><strong>Customer:</strong> {order.user?.name}</p>
                        <p><strong>Address:</strong> {order.dropoffLocation?.address}</p>
                        {order.driver && (
                            <div style={styles.driverInfo}>
                                <div style={styles.driverAvatar}>🛵</div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>{order.driver.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#777' }}>Your Delivery Hero</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '1rem',
        height: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
    },
    backBtn: {
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        border: '1px solid #ddd',
        background: '#fff',
        cursor: 'pointer',
    },
    title: { margin: 0 },
    grid: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '1rem',
        overflow: 'hidden',
    },
    mapSide: {
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #eee',
    },
    infoSide: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    statusCard: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid #eee',
    },
    statusLabel: {
        fontSize: '0.8rem',
        color: '#7f8c8d',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    statusText: {
        margin: '0.5rem 0 1rem 0',
        color: '#2c3e50',
    },
    progressBar: {
        height: '8px',
        backgroundColor: '#eee',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#e67e22',
        transition: 'width 0.5s ease',
    },
    driverCard: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid #eee',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    },
    driverInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #eee',
    },
    driverAvatar: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#f1f8ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
    },
    loading: { textAlign: 'center', padding: '5rem' },
    error: { textAlign: 'center', padding: '5rem', color: 'red' }
};

export default OrderTracking;
