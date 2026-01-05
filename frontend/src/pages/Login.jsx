import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            addToast('Please fix the errors in the form', 'error');
            return;
        }

        setLoading(true);

        try {
            const data = await login(email, password);
            addToast(`Welcome back, ${data.name}!`, 'success');

            // Navigate based on role
            if (data.role === 'driver') {
                navigate('/driver/dashboard');
            } else if (data.role === 'vendor' || data.role === 'restaurant') {
                navigate('/vendor-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            addToast(error.response?.data?.message || 'Invalid email or password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '480px', marginTop: 'var(--space-16)' }}>
            <div className="card">
                <div className="card-body">
                    <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
                    <p className="text-center text-light mb-8">Sign in to continue to Saro Delivery</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="label">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({ ...errors, email: '' });
                                }}
                                className={`input ${errors.email ? 'error' : ''}`}
                                disabled={loading}
                                autoComplete="email"
                            />
                            {errors.email && <p className="form-error">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: '' });
                                    }}
                                    className={`input ${errors.password ? 'error' : ''}`}
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 'var(--space-3)',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-light)',
                                        fontSize: 'var(--font-size-sm)',
                                        padding: 'var(--space-2)',
                                    }}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.password && <p className="form-error">{errors.password}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo Accounts */}
                    <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-4)', backgroundColor: 'var(--color-neutral-100)', borderRadius: 'var(--radius-md)' }}>
                        <p className="text-sm font-medium mb-2">Demo Accounts:</p>
                        <p className="text-xs text-light" style={{ lineHeight: 1.6 }}>
                            <strong>Driver:</strong> kebede@saro.com / password123<br />
                            <strong>Customer:</strong> almaz@gmail.com / password123
                        </p>
                    </div>

                    {/* Register Link */}
                    <p className="text-center mt-6 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-medium">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
