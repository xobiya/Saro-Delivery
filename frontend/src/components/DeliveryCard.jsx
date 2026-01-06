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

    const cardStyle = compact ? { ...styles.card, ...styles.compactCard } : styles.card;

    return (
        <div style={cardStyle}>
            {!compact && (
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <span style={styles.orderId}>#{order._id.substring(0, 8)}</span>
                        <span style={{ ...styles.badge, backgroundColor: getStatusColor(order.status) }}>
                            {order.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div style={styles.orderType}>
                        {order.type === 'food_delivery' ? '🍕 Food' : '📦 Package'}
                        <span style={{
                            ...styles.payBadge,
                            backgroundColor: order.paymentStatus === 'paid' ? '#27ae60' : '#f39c12'
                        }}>
                            {order.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                        </span>
                    </div>
                </div>
            )}

            {userRole === 'customer' && order.status !== 'pending' && order.status !== 'cancelled' && (
                <div style={styles.trackingBanner}>
                    <a href={`/track/${order._id}`} style={styles.trackLink}>🛰️ Live Track Delivery</a>
                </div>
            )}

            <div style={styles.body}>
                {!compact && (
                    <div style={styles.locationSection}>
                        <div style={styles.locItem}>
                            <div style={styles.locDot} />
                            <div style={styles.locContent}>
                                <span style={styles.locLabel}>PICKUP</span>
                                <span style={styles.locAddress}>{order.pickupLocation?.address}</span>
                            </div>
                        </div>
                        <div style={styles.locConnector} />
                        <div style={styles.locItem}>
                            <div style={{ ...styles.locDot, backgroundColor: '#e67e22' }} />
                            <div style={styles.locContent}>
                                <span style={styles.locLabel}>DROP OFF</span>
                                <span style={styles.locAddress}>{order.dropoffLocation?.address}</span>
                            </div>
                        </div>
                        <button onClick={() => openNavigation(order.dropoffLocation)} style={styles.navBtn}>
                            📍 Navigate
                        </button>
                    </div>
                )}

                {isDriver && order.user && (
                    <div style={compact ? styles.compactCustomerBox : styles.customerBox}>
                        <div style={styles.custInfo}>
                            <span style={styles.custName}>{order.user.name}</span>
                            <span style={styles.custPhone}>{order.user.phone}</span>
                        </div>
                        <div style={styles.custActions}>
                            <a href={`tel:${order.user.phone}`} style={styles.callBtn}>📞 Call</a>
                            {compact && (
                                <button onClick={() => openNavigation(order.dropoffLocation)} style={styles.compactNavBtn}>📍 Nav</button>
                            )}
                        </div>
                    </div>
                )}

                {!compact && (
                    <div style={styles.itemPreview}>
                        <span style={styles.itemTitle}>Order Summary</span>
                        {order.items.map((item, idx) => (
                            <div key={idx} style={styles.itemRow}>
                                <span>{item.quantity}x {item.name}</span>
                                <span>{item.price * item.quantity} ETB</span>
                            </div>
                        ))}
                        <div style={styles.totalRow}>
                            <span>Total Pay</span>
                            <span>{order.totalAmount} ETB</span>
                        </div>
                    </div>
                )}

                {order.notes && !compact && (
                    <div style={styles.notesBox}>
                        <strong>Note:</strong> {order.notes}
                    </div>
                )}
            </div>

            {isDriver && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div style={styles.actions}>
                    {!order.driver ? (
                        <button onClick={() => handleStatusChange('confirmed')} style={styles.acceptBtn}>Accept Job</button>
                    ) : (
                        <div style={styles.statusStepper}>
                            {(order.status === 'confirmed' || order.status === 'preparing') && (
                                <div style={styles.waitMessage}>Waiting for Vendor...</div>
                            )}
                            {order.status === 'ready' && (
                                <button onClick={() => handleStatusChange('picked_up')} style={styles.stepBtn}>Confirm Pickup</button>
                            )}
                            {order.status === 'picked_up' && (
                                <button onClick={() => handleStatusChange('in_transit')} style={{ ...styles.stepBtn, backgroundColor: '#f39c12' }}>Start Delivery</button>
                            )}
                            {order.status === 'in_transit' && (
                                <button onClick={() => handleStatusChange('delivered')} style={{ ...styles.stepBtn, backgroundColor: '#27ae60' }}>Complete Delivery</button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '1rem',
    },
    compactCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    orderId: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#34495e',
    },
    badge: {
        color: '#fff',
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
    },
    orderType: {
        fontSize: '0.85rem',
        color: '#7f8c8d',
        backgroundColor: '#f8f9fa',
        padding: '0.3rem 0.6rem',
        borderRadius: '4px',
    },
    locationSection: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        marginBottom: '1.5rem',
    },
    locItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
    },
    locDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#3498db',
        marginTop: '1.2rem',
    },
    locConnector: {
        width: '2px',
        height: '20px',
        backgroundColor: '#eee',
        marginLeft: '4px',
        margin: '2px 0 2px 4px',
    },
    locContent: {
        display: 'flex',
        flexDirection: 'column',
    },
    locLabel: {
        fontSize: '0.65rem',
        fontWeight: 'bold',
        color: '#bdc3c7',
        letterSpacing: '1px',
    },
    locAddress: {
        fontSize: '0.95rem',
        color: '#2c3e50',
        fontWeight: '500',
    },
    navBtn: {
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '0.5rem 0.8rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        background: '#fff',
        cursor: 'pointer',
        fontSize: '0.85rem',
        color: '#34495e',
    },
    compactNavBtn: {
        padding: '4px 8px',
        borderRadius: '6px',
        border: '1px solid #3498db',
        color: '#3498db',
        background: '#fff',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    customerBox: {
        backgroundColor: '#f1f8ff',
        padding: '1rem',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    compactCustomerBox: {
        backgroundColor: 'rgba(52, 152, 219, 0.05)',
        padding: '0.75rem',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    custInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    custActions: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    custName: {
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: '0.95rem',
    },
    custPhone: {
        fontSize: '0.8rem',
        color: '#3498db',
    },
    callBtn: {
        textDecoration: 'none',
        backgroundColor: '#fff',
        color: '#27ae60',
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        border: '1px solid #27ae60',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    itemPreview: {
        borderTop: '1px solid #eee',
        paddingTop: '1rem',
        marginBottom: '1.5rem',
    },
    itemTitle: {
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: '#95a5a6',
        display: 'block',
        marginBottom: '0.5rem',
    },
    itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: '#7f8c8d',
        marginBottom: '0.25rem',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px dashed #eee',
        fontWeight: 'bold',
        fontSize: '1rem',
        color: '#e67e22',
    },
    notesBox: {
        fontSize: '0.8rem',
        color: '#7f8c8d',
        backgroundColor: '#fdf7e3',
        padding: '0.75rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
    },
    actions: {
        marginTop: 'auto',
    },
    acceptBtn: {
        width: '100%',
        padding: '0.8rem',
        borderRadius: '12px',
        border: 'none',
        backgroundColor: '#34495e',
        color: '#fff',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(52, 73, 94, 0.2)',
    },
    statusStepper: {
        display: 'flex',
        width: '100%',
    },
    stepBtn: {
        width: '100%',
        padding: '0.8rem',
        borderRadius: '12px',
        border: 'none',
        backgroundColor: '#3498db',
        color: '#fff',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    waitMessage: {
        textAlign: 'center',
        padding: '0.8rem',
        color: '#9b59b6',
        fontWeight: 'bold',
        width: '100%',
        backgroundColor: '#f4f0f7',
        borderRadius: '8px',
        fontSize: '0.9rem',
    },
    payBadge: {
        fontSize: '0.65rem',
        padding: '0.1rem 0.4rem',
        borderRadius: '4px',
        color: '#fff',
        marginLeft: '0.5rem',
        fontWeight: 'bold',
        verticalAlign: 'middle',
    },
    trackingBanner: {
        backgroundColor: '#f1f8ff',
        padding: '0.8rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
        border: '1px dashed #3498db',
    },
    trackLink: {
        color: '#3498db',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    }
};

export default DeliveryCard;
