import { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

const Login = () => {
    const [mode, setMode] = useState('phone'); // phone | email
    const [step, setStep] = useState('enterPhone'); // enterPhone | enterOtp
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpExpiresIn, setOtpExpiresIn] = useState(null);
    const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login, setUserInfo } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const navigate = useNavigate();
    const location = useLocation();

    const redirectTarget = useMemo(() => {
        const from = location.state?.from;
        if (from?.pathname && from.pathname !== '/login') {
            return from.pathname + (from.search || '');
        }
        return '/profile';
    }, [location.state]);

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

    const handleOAuth = (provider) => {
        window.location.href = `/api/auth/${provider}?redirect=${encodeURIComponent(redirectTarget)}`;
    };

    useEffect(() => {
        if (resendCooldownSeconds <= 0) return;
        const intervalId = setInterval(() => {
            setResendCooldownSeconds((s) => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(intervalId);
    }, [resendCooldownSeconds]);

    const startOtp = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/otp/start', {
                phone,
                purpose: 'login',
            });
            setOtpExpiresIn(data.expiresInSeconds);
            setStep('enterOtp');
            setResendCooldownSeconds(60);
            addToast('Verification code sent by SMS', 'success');
        } catch (err) {
            addToast(err?.response?.data?.message || 'Failed to send code', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        if (resendCooldownSeconds > 0) return;
        await startOtp();
    };

    const verifyOtp = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/otp/verify', {
                phone,
                code: otp,
            });

            if (data.needsProfile) {
                addToast('This phone is new. Please create an account first.', 'error');
                navigate('/register', { replace: true, state: { phone: data.phone, otpSessionToken: data.otpSessionToken } });
                return;
            }

            setUserInfo(data);
            addToast('Signed in successfully!', 'success');
            navigate(redirectTarget, { replace: true });
        } catch (err) {
            addToast(err?.response?.data?.message || 'Invalid code', 'error');
        } finally {
            setLoading(false);
        }
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

            const from = location.state?.from;
            const fromPath = from?.pathname;
            const fromSearch = from?.search || '';
            const canUseFrom =
                !!fromPath &&
                fromPath !== '/login' &&
                (
                    data.role === 'admin' ||
                    (data.role === 'driver' && fromPath.startsWith('/driver')) ||
                    ((data.role === 'vendor' || data.role === 'restaurant') && fromPath.startsWith('/vendor')) ||
                    (data.role === 'customer' && !fromPath.startsWith('/driver') && !fromPath.startsWith('/vendor'))
                );

            if (canUseFrom) {
                navigate(fromPath + fromSearch, { replace: true });
                return;
            }

            // Navigate based on role
            if (data.role === 'driver') {
                navigate('/driver/dashboard');
            } else if (data.role === 'vendor' || data.role === 'restaurant') {
                navigate('/vendor-dashboard');
            } else {
                navigate('/profile');
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

                    <div className="flex flex-col gap-3" style={{ marginBottom: 'var(--space-6)' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleOAuth('google')}
                            disabled={loading}
                        >
                            Continue with Google
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleOAuth('facebook')}
                            disabled={loading}
                        >
                            Continue with Facebook
                        </button>
                    </div>

                    <div className="flex" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                        <button
                            type="button"
                            className={`btn ${mode === 'phone' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ flex: 1 }}
                            onClick={() => {
                                setMode('phone');
                                setStep('enterPhone');
                                setOtp('');
                                setOtpExpiresIn(null);
                                setResendCooldownSeconds(0);
                            }}
                            disabled={loading}
                        >
                            Phone
                        </button>
                        <button
                            type="button"
                            className={`btn ${mode === 'email' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ flex: 1 }}
                            onClick={() => setMode('email')}
                            disabled={loading}
                        >
                            Email
                        </button>
                    </div>

                    {mode === 'phone' ? (
                        <div className="flex flex-col gap-4">
                            {step === 'enterPhone' ? (
                                <>
                                    <div>
                                        <label className="label">Phone number</label>
                                        <input
                                            type="tel"
                                            className="input"
                                            placeholder="09xxxxxxxx or +2519xxxxxxxx"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            disabled={loading}
                                            autoComplete="tel"
                                        />
                                        <div className="form-hint">We use your phone so drivers can confirm your landmark.</div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-primary btn-lg"
                                        onClick={startOtp}
                                        disabled={loading || !phone.trim() || resendCooldownSeconds > 0}
                                    >
                                        {loading ? 'Sending code…' : 'Send verification code'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="label">Verification code</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="input"
                                            placeholder="6-digit code"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            disabled={loading}
                                        />
                                        <div className="form-hint">
                                            {otpExpiresIn ? `Code expires in ~${Math.ceil(otpExpiresIn / 60)} min.` : 'Enter the code sent by SMS.'}
                                            {resendCooldownSeconds > 0 ? ` Resend available in ${resendCooldownSeconds}s.` : ''}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-primary btn-lg"
                                        onClick={verifyOtp}
                                        disabled={loading || otp.length !== 6}
                                    >
                                        {loading ? 'Verifying…' : 'Continue'}
                                    </button>

                                    <div className="flex" style={{ gap: 'var(--space-3)' }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            style={{ flex: 1 }}
                                            onClick={() => {
                                                setStep('enterPhone');
                                                setOtp('');
                                                setOtpExpiresIn(null);
                                                setResendCooldownSeconds(0);
                                            }}
                                            disabled={loading}
                                        >
                                            Change number
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            style={{ flex: 1 }}
                                            onClick={resendOtp}
                                            disabled={loading || resendCooldownSeconds > 0}
                                        >
                                            {resendCooldownSeconds > 0 ? `Resend in ${resendCooldownSeconds}s` : 'Resend'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
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
                    )}

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
