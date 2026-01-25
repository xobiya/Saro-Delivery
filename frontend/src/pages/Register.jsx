import { useEffect, useMemo, useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import api from '../utils/api';

const Register = () => {
    const location = useLocation();

    const [step, setStep] = useState('phone'); // phone | otp | profile
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSessionToken, setOtpSessionToken] = useState('');
    const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);

    const [formData, setFormData] = useState({
        name: '', email: '', role: 'customer'
    });
    const [loading, setLoading] = useState(false);
    const { setUserInfo } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const navigate = useNavigate();

    const redirectTarget = useMemo(() => {
        const from = location.state?.from;
        if (from?.pathname && from.pathname !== '/login' && from.pathname !== '/register') {
            return from.pathname + (from.search || '');
        }
        return null;
    }, [location.state]);

    const getDefaultRedirectForRole = (role) => {
        if (role === 'driver') return '/driver/dashboard';
        if (role === 'vendor' || role === 'restaurant') return '/vendor-dashboard';
        return '/profile';
    };

    const getPostAuthRedirect = (userData) => {
        if (!redirectTarget) return getDefaultRedirectForRole(userData?.role);

        const role = userData?.role;
        const fromPath = redirectTarget;

        const canUseFrom =
            role === 'admin' ||
            (role === 'driver' && fromPath.startsWith('/driver')) ||
            ((role === 'vendor' || role === 'restaurant') && fromPath.startsWith('/vendor')) ||
            (role === 'customer' && !fromPath.startsWith('/driver') && !fromPath.startsWith('/vendor'));

        return canUseFrom ? fromPath : getDefaultRedirectForRole(role);
    };

    useEffect(() => {
        // If Login OTP verify says the phone is new, it forwards here with session token
        const stPhone = location.state?.phone;
        const stToken = location.state?.otpSessionToken;
        if (stPhone && stToken) {
            setPhone(String(stPhone));
            setOtpSessionToken(String(stToken));
            setStep('profile');
        }
    }, [location.state]);

    useEffect(() => {
        if (resendCooldownSeconds <= 0) return;
        const intervalId = setInterval(() => {
            setResendCooldownSeconds((s) => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(intervalId);
    }, [resendCooldownSeconds]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOAuth = (provider) => {
        // Social sign-up is customer by default
        window.location.href = `/api/auth/${provider}?redirect=${encodeURIComponent('/profile')}`;
    };

    const startOtp = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/otp/start', {
                phone,
                purpose: 'signup',
            });
            addToast('Verification code sent by SMS', 'success');
            if (data?.phone) setPhone(String(data.phone));
            setStep('otp');
            setResendCooldownSeconds(60);
            return data;
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

            if (!data.needsProfile) {
                // Existing account: treat as login
                setUserInfo(data);
                addToast('Signed in successfully!', 'success');
                navigate(getPostAuthRedirect(data), { replace: true });
                return;
            }

            if (data?.phone) setPhone(String(data.phone));
            setOtpSessionToken(data.otpSessionToken);
            setStep('profile');
        } catch (err) {
            addToast(err?.response?.data?.message || 'Invalid code', 'error');
        } finally {
            setLoading(false);
        }
    };

    const completeSignup = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/otp/complete', {
                otpSessionToken,
                name: formData.name,
                role: formData.role,
                email: formData.email,
            });
            setUserInfo(data);
            addToast(`Welcome, ${data.name}!`, 'success');
            navigate(getPostAuthRedirect(data), { replace: true });
        } catch (err) {
            addToast(err?.response?.data?.message || 'Signup failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '480px', marginTop: 'var(--space-16)' }}>
            <div className="card">
                <div className="card-body">
                    <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
                    <p className="text-center text-light mb-8">Join Saro Delivery in Arba Minch</p>

                    <div className="flex flex-col gap-3" style={{ marginBottom: 'var(--space-6)' }}>
                        <button type="button" className="btn btn-outline" onClick={() => handleOAuth('google')} disabled={loading}>
                            Continue with Google
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => handleOAuth('facebook')} disabled={loading}>
                            Continue with Facebook
                        </button>
                    </div>

                    {step === 'phone' && (
                        <div className="flex flex-col gap-4">
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
                                <div className="form-hint">We use your phone to confirm orders and help drivers reach you.</div>
                                {resendCooldownSeconds > 0 && (
                                    <div className="form-hint">You can request a new code in {resendCooldownSeconds}s.</div>
                                )}
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                onClick={startOtp}
                                disabled={loading || !phone.trim() || resendCooldownSeconds > 0}
                            >
                                {loading ? 'Sending code…' : 'Send verification code'}
                            </button>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div className="flex flex-col gap-4">
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
                                    Enter the code sent by SMS.
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
                                        setStep('phone');
                                        setOtp('');
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
                        </div>
                    )}

                    {step === 'profile' && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <label className="label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your name"
                                    onChange={handleChange}
                                    className="input"
                                    value={formData.name}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="label">Email (optional)</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    onChange={handleChange}
                                    className="input"
                                    value={formData.email}
                                    disabled={loading}
                                    autoComplete="email"
                                />
                                <div className="form-hint">Optional — phone login will still work without email.</div>
                            </div>

                            <div>
                                <label className="label">Account Type</label>
                                <select name="role" onChange={handleChange} className="select" value={formData.role} disabled={loading}>
                                    <option value="customer">Customer</option>
                                    <option value="driver">Driver</option>
                                </select>
                                <div className="form-hint">Vendors are created by admin/vendor onboarding.</div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                onClick={completeSignup}
                                disabled={loading || !formData.name.trim() || !otpSessionToken}
                            >
                                {loading ? 'Creating account…' : 'Create account'}
                            </button>

                            <div className="text-xs text-light" style={{ textAlign: 'center' }}>
                                Signing up with <strong>{phone}</strong>
                            </div>
                        </div>
                    )}

                    <p className="text-center mt-6 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
