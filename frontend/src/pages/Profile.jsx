import { useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import { useLocale } from '../context/LocaleContext.jsx';
import { FaUserEdit, FaMapMarkerAlt, FaHistory, FaShieldAlt, FaCamera, FaSpinner } from 'react-icons/fa';

const safeErr = (err) => {
    const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
    return msg || 'Something went wrong';
};

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const { t } = useLocale();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', language: 'en', theme: 'system', notifications: { sms: true, email: false, push: false, promotions: true } });

    const [addressDraft, setAddressDraft] = useState({
        label: 'Home',
        city: 'Arba Minch',
        area: '',
        streetOrLandmark: '',
        notes: '',
        isDefault: false,
    });

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const [avatarUploading, setAvatarUploading] = useState(false);

    const [reauthStep, setReauthStep] = useState('idle'); // idle | sent | verified
    const [reauthCode, setReauthCode] = useState('');
    const [reauthToken, setReauthToken] = useState('');
    const [deleting, setDeleting] = useState(false);

    const addresses = useMemo(() => profile?.addresses || [], [profile]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.getCached('/profile', { ttlMs: 60 * 1000 });
            setProfile(data);
            setForm({
                name: data.name || '',
                email: data.email || '',
                language: data.preferences?.language || 'en',
                theme: data.preferences?.theme || 'system',
                notifications: {
                    sms: !!data.preferences?.notifications?.sms,
                    email: !!data.preferences?.notifications?.email,
                    push: !!data.preferences?.notifications?.push,
                    promotions: !!data.preferences?.notifications?.promotions,
                },
            });
        } catch (err) {
            addToast(safeErr(err), 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        setOrdersLoading(true);
        try {
            const { data } = await api.getCached('/deliveries', { ttlMs: 30 * 1000 });
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            // Non-fatal for profile page
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/profile', {
                name: form.name,
                email: form.email,
                language: form.language,
                theme: form.theme,
                notifications: form.notifications,
            });
            addToast(t('profile.saved', 'Profile updated'), 'success');
            await loadProfile();
        } catch (err) {
            addToast(safeErr(err), 'error');
        } finally {
            setSaving(false);
        }
    };

    const onUploadAvatar = async (file) => {
        if (!file) return;
        setAvatarUploading(true);
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            const res = await api.post('/profile/avatar', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfile((p) => (p ? { ...p, avatarUrl: res.data?.avatarUrl || p.avatarUrl } : p));
            addToast(t('profile.avatarUpdated', 'Avatar updated'), 'success');
        } catch (err) {
            addToast(safeErr(err), 'error');
        } finally {
            setAvatarUploading(false);
        }
    };

    const onAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/profile/addresses', addressDraft);
            setProfile((p) => (p ? { ...p, addresses: res.data.addresses || [] } : p));
            addToast(t('profile.addressAdded', 'Address saved'), 'success');
            setAddressDraft({ ...addressDraft, streetOrLandmark: '', notes: '', isDefault: false });
        } catch (err) {
            addToast(safeErr(err), 'error');
        }
    };

    const onSetDefaultAddress = async (addressId) => {
        try {
            const res = await api.put(`/profile/addresses/${addressId}`, { isDefault: true });
            setProfile((p) => (p ? { ...p, addresses: res.data.addresses || [] } : p));
            addToast(t('profile.defaultUpdated', 'Default updated'), 'success');
        } catch (err) {
            addToast(safeErr(err), 'error');
        }
    };

    const onDeleteAddress = async (addressId) => {
        if (!confirm(t('profile.confirmDeleteAddress', 'Delete this address?'))) return;
        try {
            const res = await api.delete(`/profile/addresses/${addressId}`);
            setProfile((p) => (p ? { ...p, addresses: res.data.addresses || [] } : p));
            addToast(t('profile.addressDeleted', 'Address deleted'), 'success');
        } catch (err) {
            addToast(safeErr(err), 'error');
        }
    };

    const startReauth = async () => {
        try {
            await api.post('/profile/security/reauth/start');
            setReauthStep('sent');
            addToast(t('profile.codeSent', 'Code sent'), 'success');
        } catch (err) {
            addToast(safeErr(err), 'error');
        }
    };

    const verifyReauth = async () => {
        try {
            const res = await api.post('/profile/security/reauth/verify', { code: reauthCode });
            setReauthToken(res.data?.reauthToken || '');
            setReauthStep('verified');
            addToast(t('profile.verified', 'Verified'), 'success');
        } catch (err) {
            addToast(safeErr(err), 'error');
        }
    };

    const onLogoutAll = async () => {
        if (!confirm(t('profile.confirmLogoutAll', 'Logout all devices?'))) return;
        try {
            await api.post('/profile/security/logout-all');
            addToast(t('profile.loggedOutAll', 'Logged out everywhere'), 'success');
            // current token is now revoked
            logout();
        } catch (err) {
            addToast(safeErr(err), 'error');
        }
    };

    const onDeleteAccount = async () => {
        if (!confirm(t('profile.confirmDeleteAccount', 'Delete your account? This will deactivate it.'))) return;
        setDeleting(true);
        try {
            await api.post('/profile/security/delete', { reauthToken });
            addToast(t('profile.accountDeleted', 'Account deactivated'), 'success');
            logout();
        } catch (err) {
            addToast(safeErr(err), 'error');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh] pt-32">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden shadow-lg border-4 border-white relative z-10">
                                {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-extrabold text-3xl">{(profile?.name || 'U').charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 cursor-pointer text-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors z-20">
                                {avatarUploading ? <FaSpinner className="animate-spin text-sm" /> : <FaCamera className="text-sm" />}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    disabled={avatarUploading}
                                    onChange={(e) => onUploadAvatar(e.target.files?.[0])}
                                />
                            </label>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-extrabold text-gray-900 font-display mb-1">{profile?.name || 'User Profile'}</h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-gray-500 font-medium">
                                <span className="capitalize px-2 py-1 bg-gray-100 rounded-md">{user?.role}</span>
                                {profile?.phoneVerified && <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md">✓ Phone Verified</span>}
                                {profile?.emailVerified && <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">✓ Email Verified</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={logout} className="px-6 py-2 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column (Forms & Settings) */}
                    <div className="lg:col-span-7 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        
                        {/* Personal Info Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
                                <FaUserEdit className="text-orange-500" />
                                <h3 className="text-lg font-bold text-white">Personal Information</h3>
                            </div>
                            <div className="p-6 md:p-8">
                                <form onSubmit={onSaveProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                            <input
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                            <input
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="name@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                        <input 
                                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" 
                                            value={profile?.phone || ''} 
                                            readOnly 
                                            title="Phone numbers cannot be changed directly."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Language</label>
                                            <select
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                value={form.language}
                                                onChange={(e) => setForm({ ...form, language: e.target.value })}
                                            >
                                                <option value="en">English</option>
                                                <option value="am">አማርኛ</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Theme Preference</label>
                                            <select
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                value={form.theme}
                                                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                                            >
                                                <option value="system">System Default</option>
                                                <option value="light">Light Mode</option>
                                                <option value="dark">Dark Mode</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-4">Notification Preferences</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: 'sms', label: 'SMS Order Updates' },
                                                { id: 'email', label: 'Email Order Updates' },
                                                { id: 'push', label: 'Push Notifications' },
                                                { id: 'promotions', label: 'Promotions & Offers' }
                                            ].map((pref) => (
                                                <label key={pref.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={form.notifications[pref.id]}
                                                            onChange={(e) => setForm({
                                                                ...form,
                                                                notifications: { ...form.notifications, [pref.id]: e.target.checked }
                                                            })}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full transition-colors ${form.notifications[pref.id] ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.notifications[pref.id] ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{pref.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-50"
                                        disabled={saving}
                                    >
                                        {saving ? <FaSpinner className="animate-spin mr-2" /> : null}
                                        {saving ? 'Saving Changes...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
                                <FaShieldAlt className="text-orange-500" />
                                <h3 className="text-lg font-bold text-white">Security & Account</h3>
                            </div>
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                    <div>
                                        <h4 className="font-bold text-gray-900">Active Sessions</h4>
                                        <p className="text-sm text-gray-500">Sign out from all other browsers and devices.</p>
                                    </div>
                                    <button className="px-4 py-2 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors whitespace-nowrap" onClick={onLogoutAll}>
                                        Logout Everywhere
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="font-bold text-red-600 mb-2">Danger Zone</h4>
                                    <p className="text-sm text-gray-500 mb-4">Deleting an account requires phone verification (OTP). This action cannot be undone.</p>
                                    
                                    {reauthStep === 'idle' && (
                                        <button className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-200" onClick={startReauth} disabled={deleting || avatarUploading}>
                                            Verify to Delete Account
                                        </button>
                                    )}

                                    {reauthStep === 'sent' && (
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3">
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={reauthCode}
                                                onChange={(e) => setReauthCode(e.target.value)}
                                                placeholder="Enter 6-digit OTP code"
                                                inputMode="numeric"
                                            />
                                            <div className="flex gap-3">
                                                <button className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50" onClick={startReauth}>
                                                    Resend Code
                                                </button>
                                                <button className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md" onClick={verifyReauth}>
                                                    Verify
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {reauthStep === 'verified' && (
                                        <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center disabled:opacity-50" onClick={onDeleteAccount} disabled={deleting}>
                                            {deleting ? <FaSpinner className="animate-spin mr-2" /> : null}
                                            {deleting ? 'Deleting Account...' : 'Permanently Delete Account'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Addresses & Orders) */}
                    <div className="lg:col-span-5 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        
                        {/* Saved Addresses */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
                                <FaMapMarkerAlt className="text-orange-500" />
                                <h3 className="text-lg font-bold text-white">Saved Addresses</h3>
                            </div>
                            <div className="p-6">
                                {addresses.length === 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-500 text-sm border border-gray-100 mb-6">
                                        No saved addresses yet. Add one below to speed up checkout.
                                    </div>
                                ) : (
                                    <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                        {addresses.map((a) => (
                                            <div key={a._id} className={`p-4 rounded-xl border-2 transition-all ${a.isDefault ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-orange-200'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-gray-900">{a.label || 'Address'}</strong>
                                                        {a.isDefault && <span className="bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Default</span>}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{[a.city, a.area].filter(Boolean).join(', ')}</p>
                                                <p className="text-sm font-medium text-gray-800 mb-3">{a.streetOrLandmark}</p>
                                                {a.notes && <p className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-100 mb-3 italic">"{a.notes}"</p>}
                                                
                                                <div className="flex gap-2 pt-2 border-t border-gray-200/60 mt-2">
                                                    {!a.isDefault && (
                                                        <button className="text-xs font-bold text-orange-600 hover:text-orange-700" onClick={() => onSetDefaultAddress(a._id)}>
                                                            Set as Default
                                                        </button>
                                                    )}
                                                    <div className="flex-1"></div>
                                                    <button className="text-xs font-bold text-red-500 hover:text-red-700" onClick={() => onDeleteAddress(a._id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="font-bold text-gray-900 mb-4">Add New Address</h4>
                                    <form onSubmit={onAddAddress} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <input className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={addressDraft.label} onChange={(e) => setAddressDraft({ ...addressDraft, label: e.target.value })} placeholder="Label (e.g. Home)" />
                                            </div>
                                            <div>
                                                <input className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={addressDraft.city} onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })} placeholder="City" />
                                            </div>
                                        </div>
                                        <div>
                                            <input className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={addressDraft.streetOrLandmark} onChange={(e) => setAddressDraft({ ...addressDraft, streetOrLandmark: e.target.value })} placeholder="Street or Landmark *" required />
                                        </div>
                                        <div>
                                            <input className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={addressDraft.area} onChange={(e) => setAddressDraft({ ...addressDraft, area: e.target.value })} placeholder="Area / Kebele (Optional)" />
                                        </div>
                                        <div>
                                            <input className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={addressDraft.notes} onChange={(e) => setAddressDraft({ ...addressDraft, notes: e.target.value })} placeholder="Delivery Notes (Optional)" />
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" checked={addressDraft.isDefault} onChange={(e) => setAddressDraft({ ...addressDraft, isDefault: e.target.checked })} />
                                            <span className="text-sm font-medium text-gray-700">Set as default address</span>
                                        </label>
                                        <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-md">
                                            Save Address
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
                                <FaHistory className="text-orange-500" />
                                <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                            </div>
                            <div className="p-6">
                                {ordersLoading ? (
                                    <div className="flex justify-center py-8">
                                        <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-500 text-sm border border-gray-100">
                                        No order history found.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.slice(0, 5).map((o) => (
                                            <div key={o._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex justify-between items-center mb-2">
                                                    <strong className="text-gray-900 font-mono text-sm">#{String(o._id).slice(-6).toUpperCase()}</strong>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {o.status || 'pending'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">{(o.items?.length || 0)} items</span>
                                                    <span className="font-extrabold text-gray-900">{o.totalAmount} ETB</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
