import { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaSpinner,
    FaReceipt,
    FaHome,
    FaMotorcycle,
    FaArrowRight,
    FaShoppingBag,
    FaHeadset,
    FaRedo,
} from 'react-icons/fa';
import CartContext from '../context/CartContext';
import api from '../utils/api';

/* ─────────────────────────────────────────
   State definitions
───────────────────────────────────────── */
const STATES = {
    verifying: {
        icon: FaSpinner,
        iconColor: 'text-orange-500 animate-spin',
        iconBg: 'bg-orange-100',
        ringColor: 'ring-orange-200',
        badge: 'bg-orange-100 text-orange-700',
        badgeText: 'VERIFYING',
        headline: 'Verifying your payment…',
        subtext: 'Please wait while we confirm your payment with Chapa. This usually takes a few seconds.',
        strip: null,
    },
    success: {
        icon: FaCheckCircle,
        iconColor: 'text-green-500',
        iconBg: 'bg-green-100',
        ringColor: 'ring-green-200',
        badge: 'bg-green-100 text-green-700',
        badgeText: 'PAID',
        headline: 'Payment Successful! 🎉',
        subtext: "We've received your payment. Your food is being prepared and will be on its way soon.",
        strip: { icon: FaMotorcycle, text: 'Estimated delivery: 25–40 minutes.' },
    },
    failed: {
        icon: FaTimesCircle,
        iconColor: 'text-red-500',
        iconBg: 'bg-red-100',
        ringColor: 'ring-red-200',
        badge: 'bg-red-100 text-red-700',
        badgeText: 'FAILED',
        headline: 'Payment Failed',
        subtext: 'Your payment could not be processed. No money has been deducted. Please try again.',
        strip: null,
    },
    already_paid: {
        icon: FaCheckCircle,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-100',
        ringColor: 'ring-blue-200',
        badge: 'bg-blue-100 text-blue-700',
        badgeText: 'CONFIRMED',
        headline: 'Order Already Confirmed',
        subtext: 'This order was already paid and confirmed. Your food is on the way!',
        strip: { icon: FaMotorcycle, text: 'Estimated delivery: 25–40 minutes.' },
    },
    already_processed: {
        icon: FaCheckCircle,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-100',
        ringColor: 'ring-blue-200',
        badge: 'bg-blue-100 text-blue-700',
        badgeText: 'CONFIRMED',
        headline: 'Payment Already Processed',
        subtext: 'This transaction was already recorded. Your order is confirmed.',
        strip: { icon: FaMotorcycle, text: 'Estimated delivery: 25–40 minutes.' },
    },
    amount_mismatch: {
        icon: FaExclamationTriangle,
        iconColor: 'text-yellow-500',
        iconBg: 'bg-yellow-100',
        ringColor: 'ring-yellow-200',
        badge: 'bg-yellow-100 text-yellow-700',
        badgeText: 'REVIEW',
        headline: 'Payment Amount Mismatch',
        subtext: 'A discrepancy was detected in the payment amount. Please contact our support team immediately.',
        strip: null,
    },
    order_not_found: {
        icon: FaExclamationTriangle,
        iconColor: 'text-yellow-500',
        iconBg: 'bg-yellow-100',
        ringColor: 'ring-yellow-200',
        badge: 'bg-yellow-100 text-yellow-700',
        badgeText: 'UNKNOWN',
        headline: 'Order Not Found',
        subtext: 'The order linked to this payment could not be located. Please contact support.',
        strip: null,
    },
    error: {
        icon: FaTimesCircle,
        iconColor: 'text-red-500',
        iconBg: 'bg-red-100',
        ringColor: 'ring-red-200',
        badge: 'bg-red-100 text-red-700',
        badgeText: 'ERROR',
        headline: 'Verification Error',
        subtext: 'We encountered a problem verifying your payment. Please check your orders page or contact support.',
        strip: null,
    },
};

const SUCCESS_STATES = new Set(['success', 'already_paid', 'already_processed']);

/* ─────────────────────────────────────────
   Animated icon
───────────────────────────────────────── */
const AnimatedIcon = ({ state }) => {
    const cfg = STATES[state] || STATES.error;
    const Icon = cfg.icon;
    return (
        <div
            className={`relative w-28 h-28 rounded-full ${cfg.iconBg} ring-8 ${cfg.ringColor} flex items-center justify-center mx-auto mb-6`}
            style={state !== 'verifying' ? { animation: 'pop 0.45s cubic-bezier(0.175,0.885,0.32,1.275) forwards' } : {}}
        >
            <Icon className={`text-5xl ${cfg.iconColor}`} />
        </div>
    );
};

/* ─────────────────────────────────────────
   Order details card
───────────────────────────────────────── */
const OrderCard = ({ orderId, statusData }) => {
    if (!orderId) return null;
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left space-y-3 mt-6">
            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-1">
                <FaReceipt className="text-orange-500" /> Order Details
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-bold text-gray-800 text-xs break-all max-w-[180px] text-right">{orderId}</span>
            </div>
            {statusData && (
                <>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-bold text-gray-900">{statusData.totalAmount} ETB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment</span>
                        <span className={`font-bold capitalize ${statusData.paymentStatus === 'completed' ? 'text-green-600' : 'text-orange-500'}`}>
                            {statusData.paymentStatus}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order Status</span>
                        <span className="font-bold text-gray-700 capitalize">{statusData.orderStatus}</span>
                    </div>
                    {statusData.dropoffLocation?.address && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Delivering to</span>
                            <span className="font-medium text-gray-700 text-right max-w-[180px]">{statusData.dropoffLocation.address}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────
   Countdown redirect (success only)
───────────────────────────────────────── */
const useCountdown = (active, seconds, onDone) => {
    const [count, setCount] = useState(seconds);
    useEffect(() => {
        if (!active) return;
        if (count <= 0) { onDone(); return; }
        const t = setTimeout(() => setCount(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [active, count, onDone]);
    return count;
};

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
const PaymentReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useContext(CartContext);

    // Params from Chapa redirect  OR  from our backend verify redirect
    const paymentParam = searchParams.get('payment');   // set by backend verify redirect
    const orderId      = searchParams.get('order');      // set by both paths
    const txRef        = searchParams.get('tx_ref') || searchParams.get('trx_ref');     // set by Chapa's return_url
    const amountParam  = searchParams.get('amount');
    const paymentStatusParam = searchParams.get('paymentStatus');

    // If amount is present in redirect, treat the redirect as authoritative and avoid unauthenticated API calls
    const hasRedirectAmount = !!amountParam;

    // Decide initial state: prefer explicit amount/paymentStatus, then paymentParam, then verifying (if we have order/txRef), otherwise error
    const initialState = hasRedirectAmount
        ? (paymentStatusParam === 'completed' ? 'success' : (paymentStatusParam === 'failed' ? 'failed' : 'verifying'))
        : (paymentParam || ((orderId || txRef) ? 'verifying' : 'error'));

    const [state,      setState]      = useState(initialState);
    const [statusData, setStatusData] = useState(null);
    const [attempts,   setAttempts]   = useState(0);
    const MAX_ATTEMPTS = 8;   // poll up to 8 times (≈ 16 seconds)

    const isSuccess = SUCCESS_STATES.has(state);

    /* ── Clear cart when payment confirmed ── */
    useEffect(() => {
        if (isSuccess) clearCart();
    }, [isSuccess]);

    const hasTriggeredVerify = useRef(false);

    // If backend/chapa included amount and paymentStatus in the redirect URL, use them immediately
    useEffect(() => {
        if (!hasRedirectAmount) return;
        setStatusData({ totalAmount: Number(amountParam), paymentStatus: paymentStatusParam || (paymentParam === 'success' ? 'completed' : 'pending'), orderStatus: paymentParam === 'success' ? 'confirmed' : 'pending', dropoffLocation: {} });
        // Do not attempt frontend verification or polling when we already have authoritative redirect data
        // if paymentStatusParam indicates completed, show success; if pending, show verifying UI
        if (paymentStatusParam === 'completed' || paymentParam === 'success') {
            setState('success');
        } else if (paymentStatusParam === 'failed' || paymentParam === 'failed') {
            setState('failed');
        } else {
            setState('verifying');
        }
    }, [hasRedirectAmount]);

    /* ── 1. One-time verification trigger on mount ── */
    useEffect(() => {
        if (!txRef || !orderId || hasTriggeredVerify.current) return;
        if (hasRedirectAmount) return; // skip frontend verification if backend included amount/status
        hasTriggeredVerify.current = true;

        const triggerVerification = async () => {
            try {
                const verifyRes = await api.post('/payment/verify-frontend', { txRef, orderId });
                const verifyStatus = verifyRes.data?.status;

                if (SUCCESS_STATES.has(verifyStatus)) {
                    // Success! Fetch final order details
                    const { data } = await api.get(`/payment/status/${orderId}`);
                    setStatusData(data);
                    setState(verifyStatus); // 'success', 'already_paid', 'already_processed'
                } else if (verifyStatus === 'failed') {
                    const { data } = await api.get(`/payment/status/${orderId}`);
                    setStatusData(data);
                    setState('failed');
                } else if (verifyStatus === 'amount_mismatch') {
                    const { data } = await api.get(`/payment/status/${orderId}`);
                    setStatusData(data);
                    setState('amount_mismatch');
                } else if (verifyStatus === 'order_not_found') {
                    setState('order_not_found');
                }
            } catch (err) {
                console.error('Frontend verification endpoint call failed:', err);
                // Fallback to polling loop will handle status updates automatically
            }
        };

        triggerVerification();
    }, [txRef, orderId]);

    /* ── 2. Independent database polling loop ── */
    useEffect(() => {
        if (state !== 'verifying') return;
        if (hasRedirectAmount) return; // avoid polling protected endpoint when we already have redirect data
        if (attempts >= MAX_ATTEMPTS) {
            // Timed out — give user a useful message based on order data
            setState(statusData?.paymentStatus === 'completed' ? 'success' : 'error');
            return;
        }

        const pollStatus = async () => {
            try {
                const { data } = await api.get(`/payment/status/${orderId}`);
                setStatusData(data);

                if (data.paymentStatus === 'completed') {
                    setState('success');
                } else if (data.paymentStatus === 'failed') {
                    setState('failed');
                } else {
                    // still pending — increment attempts to trigger next poll
                    setAttempts(a => a + 1);
                }
            } catch (err) {
                console.error('Error polling payment status:', err);
                setAttempts(a => a + 1);
            }
        };

        const delay = attempts === 0 ? 1000 : 2500;   // check immediately (1s delay), then every 2.5s
        const timer = setTimeout(pollStatus, delay);
        return () => clearTimeout(timer);
    }, [state, attempts, orderId, statusData]);

    /* ── If paymentParam was given directly, still load order details ── */
    useEffect(() => {
        if (paymentParam && orderId) {
            // If backend included amount/paymentStatus in query params, use them to display details
            const amountParam = searchParams.get('amount');
            const paymentStatusParam = searchParams.get('paymentStatus');
            if (amountParam) {
                setStatusData({ totalAmount: Number(amountParam), paymentStatus: paymentStatusParam || (paymentParam === 'success' ? 'completed' : 'pending'), orderStatus: paymentParam === 'success' ? 'confirmed' : 'pending', dropoffLocation: {} });
                return;
            }

            // Fallback: try to fetch status from API (may require auth)
            api.get(`/payment/status/${orderId}`)
                .then(({ data }) => setStatusData(data))
                .catch(() => {});
        }
    }, [paymentParam, orderId]);

    /* ── Auto-redirect countdown (success only) ── */
    const countdown = useCountdown(
        isSuccess,
        12,
        () => navigate('/profile')
    );

    const cfg = STATES[state] || STATES.error;

    /* ── Gradient bar colour ── */
    const barClass = isSuccess
        ? 'from-green-400 to-emerald-500'
        : state === 'verifying'
        ? 'from-orange-400 to-amber-400 animate-pulse'
        : state === 'failed' || state === 'error'
        ? 'from-red-400 to-rose-500'
        : 'from-yellow-400 to-amber-500';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-20">

            {/* Ambient glow */}
            <div className={`fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20 transition-colors duration-700 ${isSuccess ? 'bg-green-400' : state === 'verifying' ? 'bg-orange-400' : 'bg-red-400'}`} />

            <div className="relative z-10 w-full max-w-md">

                {/* ── Card ── */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

                    {/* Top colour bar */}
                    <div className={`h-2 w-full bg-gradient-to-r ${barClass}`} />

                    <div className="px-8 py-10 text-center">

                        {/* Icon */}
                        <AnimatedIcon state={state} />

                        {/* Badge */}
                        <span className={`inline-block text-xs font-extrabold tracking-widest px-4 py-1 rounded-full mb-4 ${cfg.badge}`}>
                            {cfg.badgeText}
                        </span>

                        {/* Headline */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
                            {cfg.headline}
                        </h1>
                        <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-1">
                            {cfg.subtext}
                        </p>

                        {/* Countdown or polling dots */}
                        {state === 'verifying' && (
                            <p className="text-xs text-orange-500 font-semibold mt-2 animate-pulse">
                                Attempt {Math.min(attempts + 1, MAX_ATTEMPTS)} of {MAX_ATTEMPTS}…
                            </p>
                        )}
                        {isSuccess && (
                            <p className="text-xs text-gray-400 mt-1">
                                Redirecting to your orders in{' '}
                                <span className="font-bold text-orange-500">{countdown}s</span>
                            </p>
                        )}

                        {/* Order card */}
                        {state !== 'verifying' && (
                            <OrderCard orderId={orderId} statusData={statusData} />
                        )}

                        {/* Track order button (success) */}
                        {isSuccess && orderId && (
                            <Link
                                to={`/track/${orderId}`}
                                className="mt-5 flex items-center justify-center gap-3 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
                            >
                                <FaMotorcycle className="text-lg" />
                                Track My Order
                                <FaArrowRight className="text-sm" />
                            </Link>
                        )}

                        {/* Action buttons */}
                        {state !== 'verifying' && (
                            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                {isSuccess ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold py-3 px-5 rounded-xl transition-all"
                                        >
                                            <FaShoppingBag /> My Orders
                                        </Link>
                                        <Link
                                            to="/"
                                            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-5 rounded-xl transition-all"
                                        >
                                            <FaHome /> Home
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/checkout"
                                            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-5 rounded-xl shadow-lg shadow-orange-500/20 transition-all"
                                        >
                                            <FaRedo /> Try Again
                                        </Link>
                                        <Link
                                            to="/"
                                            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-5 rounded-xl transition-all"
                                        >
                                            <FaHome /> Home
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Support link */}
                        <Link
                            to="/contact"
                            className="mt-5 inline-flex items-center gap-2 text-xs text-gray-400 hover:text-orange-500 transition-colors"
                        >
                            <FaHeadset /> Need help? Contact Support
                        </Link>
                    </div>

                    {/* Bottom strip — delivery promise on success */}
                    {isSuccess && cfg.strip && (
                        <div className="bg-orange-50 border-t border-orange-100 px-8 py-5 flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaMotorcycle className="text-orange-500" />
                            </div>
                            <p className="text-sm text-orange-800 leading-relaxed">
                                Your order is confirmed. <strong>{cfg.strip.text}</strong>
                            </p>
                        </div>
                    )}
                </div>

                {/* Branding */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    © {new Date().getFullYear()} Saro Delivery · Arba Minch, Ethiopia
                </p>
            </div>

            <style>{`
                @keyframes pop {
                    0%   { transform: scale(0.5); opacity: 0; }
                    80%  { transform: scale(1.1); }
                    100% { transform: scale(1);   opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default PaymentReturn;
