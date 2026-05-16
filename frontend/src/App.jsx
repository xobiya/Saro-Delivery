import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import VendorMenu from './pages/VendorMenu';
import VendorDashboard from './pages/VendorDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrderTracking from './pages/OrderTracking';
import ProtectedRoute from './components/ProtectedRoute';
import VendorList from './pages/VendorList';
import Checkout from './pages/Checkout';
import OAuthCallback from './pages/OAuthCallback';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <SocketProvider>
                    <CartProvider>
                        <ToastProvider>
                            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                                <ScrollToTop />
                                <MainLayout>
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/vendors" element={<VendorList />} />
                                        <Route path="/about" element={<About />} />
                                        <Route path="/contact" element={<Contact />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/oauth/callback" element={<OAuthCallback />} />

                                        <Route
                                            path="/checkout"
                                            element={
                                                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                                                    <Checkout />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/profile"
                                            element={
                                                <ProtectedRoute allowedRoles={['customer', 'admin', 'driver', 'vendor', 'restaurant']}>
                                                    <Profile />
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
                                            path="/admin/dashboard"
                                            element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <AdminDashboard />
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
                                </MainLayout>
                            </Router>
                        </ToastProvider>
                    </CartProvider>
                </SocketProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
