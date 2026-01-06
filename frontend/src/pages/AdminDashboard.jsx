import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVendors: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            // Ideally we'd have a specific stats endpoint, but we can compute from general list in a small app
            const [usersRes, vendorsRes, ordersRes] = await Promise.all([
                api.get('/auth/users'), // Assuming this exists or we'll need it
                api.get('/vendors'),
                api.get('/deliveries')
            ]);

            const delivered = ordersRes.data.filter(o => o.status === 'delivered');
            const revenue = delivered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            setStats({
                totalUsers: usersRes.data.length,
                totalVendors: vendorsRes.data.length,
                totalOrders: ordersRes.data.length,
                totalRevenue: revenue
            });
        } catch (error) {
            console.error('Error fetching admin data:', error);
            // Fallback for missing endpoints (like /auth/users if not implemented yet)
            setStats(prev => ({ ...prev, totalUsers: 'N/A' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Admin Overview</h2>
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>Total Users</span>
                    <span style={styles.statValue}>{stats.totalUsers}</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>Total Vendors</span>
                    <span style={styles.statValue}>{stats.totalVendors}</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>Total Orders</span>
                    <span style={styles.statValue}>{stats.totalOrders}</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statLabel}>Total Revenue</span>
                    <span style={{ ...styles.statValue, color: '#27ae60' }}>{stats.totalRevenue} ETB</span>
                </div>
            </div>

            <div style={styles.section}>
                <h3>System Logs & Activity</h3>
                <p style={{ color: '#777' }}>Live monitoring of system activity will appear here...</p>
                <div style={styles.logBox}>
                    <p style={styles.logEntry}>[System] Admin dashboard loaded at {new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        paddingBottom: '2rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        margin: '2rem 0',
    },
    statCard: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid #eee',
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#7f8c8d',
        marginBottom: '0.5rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: '1.8rem',
        fontWeight: '800',
        color: '#2c3e50',
    },
    section: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid #eee',
        marginTop: '2rem',
    },
    logBox: {
        backgroundColor: '#1e1e1e',
        color: '#00ff00',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '1rem',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        minHeight: '100px',
    },
    logEntry: {
        margin: '0 0 0.5rem 0',
    }
};

export default AdminDashboard;
