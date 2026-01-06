import { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import DriverDashboard from './DriverDashboard';
import AdminDashboard from './AdminDashboard';
import { useNavigate, Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    if (user.role === 'vendor' || user.role === 'restaurant') {
        return <Navigate to="/vendor-dashboard" />;
    }

    if (user.role === 'driver') {
        return <Navigate to="/driver/dashboard" />;
    }

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h2>Welcome, {user.name}</h2>
            <p style={{ marginBottom: '2rem', color: '#777' }}>Role: {user.role}</p>

            {user.role === 'customer' && <CustomerDashboard />}
            {user.role === 'driver' && <DriverDashboard />}
            {user.role === 'admin' && <AdminDashboard />}
        </div>
    );
};

export default Dashboard;
