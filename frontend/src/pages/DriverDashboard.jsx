import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import DeliveryCard from '../components/DeliveryCard';
import MapView from '../components/MapView';
import SocketContext from '../context/SocketContext';
import AuthContext from '../context/AuthContext';

const DriverDashboard = () => {
    const [activeTab, setActiveTab] = useState('active'); // active, available, history
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
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

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <h2 style={styles.title}>Driver Terminal</h2>
                <button onClick={fetchOrders} style={styles.refreshBtn} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh List'}
                </button>
            </div>

            <div style={styles.tabs}>
                <button
                    style={{ ...styles.tab, borderBottom: activeTab === 'active' ? '3px solid #e67e22' : 'none', color: activeTab === 'active' ? '#e67e22' : '#777' }}
                    onClick={() => setActiveTab('active')}
                >
                    My Active ({myActiveOrders.length})
                </button>
                <button
                    style={{ ...styles.tab, borderBottom: activeTab === 'available' ? '3px solid #e67e22' : 'none', color: activeTab === 'available' ? '#e67e22' : '#777' }}
                    onClick={() => setActiveTab('available')}
                >
                    Available Jobs ({availableOrders.length})
                </button>
                <button
                    style={{ ...styles.tab, borderBottom: activeTab === 'history' ? '3px solid #e67e22' : 'none', color: activeTab === 'history' ? '#e67e22' : '#777' }}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            <div style={styles.content}>
                {activeTab === 'active' && (
                    myActiveOrders.length === 0 ?
                        <div style={styles.emptyState}><p>No active deliveries. Check available jobs to start earning!</p></div> :
                        <div style={styles.activeView}>
                            <div style={styles.mapContainer}>
                                <MapView
                                    pickup={activeOrder?.pickupLocation}
                                    dropoff={activeOrder?.dropoffLocation}
                                />
                                <div style={styles.overlay}>
                                    <DeliveryCard
                                        key={activeOrder?._id}
                                        order={activeOrder}
                                        userRole="driver"
                                        onUpdateStatus={updateStatus}
                                        compact={true}
                                    />
                                    {myActiveOrders.length > 1 && (
                                        <div style={styles.orderSwitcher}>
                                            {myActiveOrders.map((o, i) => (
                                                <button
                                                    key={o._id}
                                                    onClick={() => setSelectedOrderId(o._id)}
                                                    style={{
                                                        ...styles.switchBtn,
                                                        backgroundColor: selectedOrderId === o._id ? '#e67e22' : '#fff',
                                                        color: selectedOrderId === o._id ? '#fff' : '#777',
                                                    }}
                                                >
                                                    Order {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                )}

                {activeTab === 'available' && (
                    <div style={styles.list}>
                        {availableOrders.length === 0 ?
                            <div style={styles.emptyState}><p>No new jobs available at the moment.</p></div> :
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
                    <div style={styles.list}>
                        {completedOrders.length === 0 ?
                            <div style={styles.emptyState}><p>You haven't completed any deliveries yet.</p></div> :
                            completedOrders.map(order => (
                                <div key={order._id} style={styles.historyCard}>
                                    <div style={styles.historyInfo}>
                                        <span style={styles.historyId}>#{order._id.substring(0, 8)}</span>
                                        <span style={styles.historyDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div style={styles.historyStatus}>
                                        <span style={{ color: '#27ae60', fontWeight: 'bold' }}>✓ Delivered</span>
                                        <span style={styles.historyAmount}>{order.totalAmount} ETB</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
        color: '#2c3e50',
    },
    refreshBtn: {
        background: '#ecf0f1',
        border: 'none',
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        cursor: 'pointer',
        color: '#7f8c8d',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid #eee',
        marginBottom: '0',
        backgroundColor: '#fff',
        borderRadius: '8px 8px 0 0',
    },
    tab: {
        flex: 1,
        padding: '1rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '700',
        transition: 'all 0.2s',
    },
    content: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        paddingTop: '1rem',
    },
    activeView: {
        height: '100%',
        position: 'relative',
    },
    mapContainer: {
        height: '100%',
        width: '100%',
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
    },
    overlay: {
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '350px',
        maxWidth: '90%',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    orderSwitcher: {
        display: 'flex',
        gap: '5px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '8px',
        borderRadius: '12px',
        overflowX: 'auto',
    },
    switchBtn: {
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid #eee',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        overflowY: 'auto',
        height: '100%',
        padding: '0 5px 2rem 5px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#fff',
        borderRadius: '12px',
        color: '#95a5a6',
        border: '2px dashed #eee',
    },
    historyCard: {
        padding: '1.5rem',
        border: '1px solid #eee',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    },
    historyInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    historyId: {
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    historyDate: {
        fontSize: '0.85rem',
        color: '#7f8c8d',
    },
    historyStatus: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.25rem',
    },
    historyAmount: {
        fontSize: '1.1rem',
        fontWeight: '800',
        color: '#2c3e50',
    }
};

export default DriverDashboard;
