import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import SocketContext from '../context/SocketContext';

import ProductManager from '../components/ProductManager';

const VendorDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [view, setView] = useState('orders'); // 'orders' or 'products'
    const socket = useContext(SocketContext);

    useEffect(() => {
        // Only fetch orders if in orders view (optional optimization, but good practice)
        if (view === 'orders') {
            fetchOrders();
        }
    }, [view]);

    useEffect(() => {
        if (view === 'orders') {
            fetchOrders();
        }

        if (socket) {
            socket.on('orders_updated', (data) => {
                if (view === 'orders') fetchOrders();
            });
        }

        return () => {
            if (socket) socket.off('orders_updated');
        };
    }, [socket, view]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/deliveries');
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
        } catch (error) {
            console.error('Error fetching orders:', error);
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

    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    const historyOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
    const totalRevenue = historyOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const [orderSubTab, setOrderSubTab] = useState('active'); // 'active' or 'history'

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h2>Vendor Dashboard</h2>

            <div style={styles.tabs}>
                <button
                    style={{ ...styles.tab, borderBottom: view === 'orders' ? '2px solid #e67e22' : 'none', color: view === 'orders' ? '#e67e22' : '#333' }}
                    onClick={() => setView('orders')}
                >
                    Orders
                </button>
                <button
                    style={{ ...styles.tab, borderBottom: view === 'products' ? '2px solid #e67e22' : 'none', color: view === 'products' ? '#e67e22' : '#333' }}
                    onClick={() => setView('products')}
                >
                    Products
                </button>
            </div>

            {view === 'orders' ? (
                <div style={styles.dashboardGrid}>
                    <div style={styles.orderSubHeader}>
                        <div style={styles.subTabs}>
                            <button
                                onClick={() => setOrderSubTab('active')}
                                style={{
                                    ...styles.subTab,
                                    color: orderSubTab === 'active' ? '#e67e22' : '#777',
                                    fontWeight: orderSubTab === 'active' ? 'bold' : 'normal'
                                }}
                            >
                                Active ({activeOrders.length})
                            </button>
                            <button
                                onClick={() => setOrderSubTab('history')}
                                style={{
                                    ...styles.subTab,
                                    color: orderSubTab === 'history' ? '#e67e22' : '#777',
                                    fontWeight: orderSubTab === 'history' ? 'bold' : 'normal'
                                }}
                            >
                                History ({historyOrders.length})
                            </button>
                        </div>
                        {orderSubTab === 'history' && (
                            <div style={styles.revenueBox}>
                                Total Revenue: <strong>{totalRevenue} ETB</strong>
                            </div>
                        )}
                    </div>

                    <div style={styles.section}>
                        {orderSubTab === 'active' ? (
                            activeOrders.length === 0 ? <p>No active orders.</p> : (
                                <div style={styles.list}>
                                    {activeOrders.map(order => (
                                        <div key={order._id} style={styles.orderCard}>
                                            <div style={styles.header}>
                                                <h4>Order #{order._id.substring(0, 6)}</h4>
                                                <span style={{
                                                    ...styles.badge,
                                                    backgroundColor: order.status === 'pending' ? 'orange' :
                                                        order.status === 'preparing' ? '#3498db' :
                                                            order.status === 'ready' ? '#27ae60' : '#7f8c8d'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div style={styles.body}>
                                                <p><strong>Customer:</strong> {order.user?.name || 'Guest'}</p>
                                                <ul style={styles.items}>
                                                    {order.items.map((item, idx) => (
                                                        <li key={idx}>{item.quantity}x {item.name}</li>
                                                    ))}
                                                </ul>
                                                <p className='total'><strong>Total:</strong> {order.totalAmount} ETB</p>
                                            </div>
                                            <div style={styles.actions}>
                                                {(order.status === 'pending' || order.status === 'confirmed') && (
                                                    <button onClick={() => updateStatus(order._id, 'preparing')} style={styles.acceptBtn}>Start Preparing</button>
                                                )}
                                                {order.status === 'preparing' && (
                                                    <button onClick={() => updateStatus(order._id, 'ready')} style={styles.readyBtn}>Mark Ready for Pickup</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            historyOrders.length === 0 ? <p>No order history.</p> : (
                                <div style={styles.list}>
                                    {historyOrders.map(order => (
                                        <div key={order._id} style={{ ...styles.orderCard, opacity: 0.8 }}>
                                            <div style={styles.header}>
                                                <h4>Order #{order._id.substring(0, 6)}</h4>
                                                <span style={{
                                                    ...styles.badge,
                                                    backgroundColor: order.status === 'delivered' ? '#27ae60' : '#e74c3c'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div style={styles.body}>
                                                <p><strong>Customer:</strong> {order.user?.name || 'Guest'}</p>
                                                <p><strong>Completed:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
                                                <p className='total'><strong>Total:</strong> {order.totalAmount} ETB</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            ) : (
                <ProductManager />
            )}
        </div>
    );
};

const styles = {
    tabs: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid #ddd',
    },
    tab: {
        padding: '1rem 2rem',
        background: 'none',
        border: 'none',
        fontSize: '1.1rem',
        cursor: 'pointer',
        color: '#333',
    },
    dashboardGrid: {
        display: 'grid',
        gap: '2rem',
    },
    section: {
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #eee'
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    orderCard: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    },
    badge: {
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    body: {
        fontSize: '0.9rem',
    },
    items: {
        margin: '0.5rem 0',
        paddingLeft: '1.2rem',
    },
    actions: {
        marginTop: '1rem',
        display: 'flex',
        gap: '0.5rem',
    },
    acceptBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#e67e22',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    readyBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#27ae60',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    orderSubHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #eee',
    },
    subTabs: {
        display: 'flex',
        gap: '1.5rem',
    },
    subTab: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '0.25rem 0',
    },
    revenueBox: {
        fontSize: '1rem',
        color: '#2c3e50',
    }
};

export default VendorDashboard;
