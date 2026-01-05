import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import CartDrawer from './components/CartDrawer';
import VendorMenu from './pages/VendorMenu';
import VendorDashboard from './pages/VendorDashboard';
import DriverDashboard from './pages/DriverDashboard';
import OrderTracking from './pages/OrderTracking';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <SocketProvider>
                    <CartProvider>
                        <ToastProvider>
                            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                                <Navbar />
                                <CartDrawer />
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/contact" element={<Contact />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />

                                    <Route
                                        path="/dashboard"
                                        element={
                                            <ProtectedRoute allowedRoles={['customer', 'admin', 'driver']}>
                                                <Dashboard />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="/driver/dashboard"
                                        element={
                                            <ProtectedRoute allowedRoles={['driver', 'admin']}>
                                                <DriverDashboard />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="/vendor-dashboard"
                                        element={
                                            <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                                                <VendorDashboard />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="/track/:id"
                                        element={
                                            <ProtectedRoute allowedRoles={['customer', 'driver', 'admin']}>
                                                <OrderTracking />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route path="/menu/:id" element={<VendorMenu />} />
                                </Routes>
                            </Router>
                        </ToastProvider>
                    </CartProvider>
                </SocketProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
