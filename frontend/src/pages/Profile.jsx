import { useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import { useLocale } from '../context/LocaleContext.jsx';

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
            <div className="container" style={{ paddingBottom: 'var(--space-10)' }}>
                <h2 style={{ marginBottom: 'var(--space-2)' }}>{t('profile.title', 'Profile')}</h2>
                <div className="card">{t('common.loading', 'Loading…')}</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: 'var(--space-10)' }}>
            <div style={styles.headerRow}>
                <div>
                    <h2 style={{ marginBottom: 'var(--space-1)' }}>{t('profile.title', 'Profile')}</h2>
                    <div style={styles.subtle}>
                        {user?.role ? `${user.role}` : ''}
                        {profile?.phoneVerified ? ' • phone verified' : ''}
                        {profile?.emailVerified ? ' • email verified' : ''}
                    </div>
                </div>

                <div style={styles.avatarWrap}>
                    <div style={styles.avatar}>
                        {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="avatar" style={styles.avatarImg} />
                        ) : (
                            <span style={styles.avatarInitials}>{(profile?.name || 'U').slice(0, 1).toUpperCase()}</span>
                        )}
                    </div>
                    <label className="btn btn-outline" style={{ cursor: avatarUploading ? 'not-allowed' : 'pointer' }}>
                        {avatarUploading ? t('profile.uploading', 'Uploading…') : t('profile.changePhoto', 'Change')}
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            style={{ display: 'none' }}
                            disabled={avatarUploading}
                            onChange={(e) => onUploadAvatar(e.target.files?.[0])}
                        />
                    </label>
                </div>
            </div>

            <div style={styles.grid}>
                <div className="card" style={styles.card}>
                    <h3 style={styles.cardTitle}>{t('profile.personal', 'Personal info')}</h3>
                    <form onSubmit={onSaveProfile} style={{ display: 'grid', gap: 'var(--space-3)' }}>
                        <div>
                            <label style={styles.label}>{t('profile.name', 'Full name')}</label>
                            <input
                                className="input"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder={t('profile.namePh', 'Your name')}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>{t('profile.email', 'Email')}</label>
                            <input
                                className="input"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label style={styles.label}>{t('profile.phone', 'Phone')}</label>
                            <input className="input" value={profile?.phone || ''} readOnly />
                            <div style={styles.hint}>{t('profile.phoneHint', 'To change phone: use Security below')}</div>
                        </div>

                        <div style={styles.twoCol}>
                            <div>
                                <label style={styles.label}>{t('profile.language', 'Language')}</label>
                                <select
                                    className="input"
                                    value={form.language}
                                    onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                                >
                                    <option value="en">English</option>
                                    <option value="am">አማርኛ</option>
                                </select>
                            </div>
                            <div>
                                <label style={styles.label}>{t('profile.theme', 'Theme')}</label>
                                <select
                                    className="input"
                                    value={form.theme}
                                    onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                                >
                                    <option value="system">System</option>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.switchGrid}>
                            <label style={styles.switchRow}>
                                <input
                                    type="checkbox"
                                    checked={form.notifications.sms}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, notifications: { ...f.notifications, sms: e.target.checked } }))
                                    }
                                />
                                <span>{t('profile.nSms', 'SMS updates')}</span>
                            </label>
                            <label style={styles.switchRow}>
                                <input
                                    type="checkbox"
                                    checked={form.notifications.email}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, notifications: { ...f.notifications, email: e.target.checked } }))
                                    }
                                />
                                <span>{t('profile.nEmail', 'Email updates')}</span>
                            </label>
                            <label style={styles.switchRow}>
                                <input
                                    type="checkbox"
                                    checked={form.notifications.push}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, notifications: { ...f.notifications, push: e.target.checked } }))
                                    }
                                />
                                <span>{t('profile.nPush', 'Push notifications')}</span>
                            </label>
                            <label style={styles.switchRow}>
                                <input
                                    type="checkbox"
                                    checked={form.notifications.promotions}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, notifications: { ...f.notifications, promotions: e.target.checked } }))
                                    }
                                />
                                <span>{t('profile.nPromo', 'Promotions')}</span>
                            </label>
                        </div>

                        <button className="btn btn-primary" disabled={saving} type="submit">
                            {saving ? t('profile.saving', 'Saving…') : t('profile.save', 'Save changes')}
                        </button>
                    </form>
                </div>

                <div className="card" style={styles.card}>
                    <h3 style={styles.cardTitle}>{t('profile.addresses', 'Saved addresses')}</h3>

                    {addresses.length === 0 ? (
                        <div style={styles.empty}>{t('profile.noAddresses', 'No saved addresses yet.')}</div>
                    ) : (
                        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                            {addresses.map((a) => (
                                <div key={a._id} style={styles.addressItem}>
                                    <div style={{ flex: 1 }}>
                                        <div style={styles.addressTop}>
                                            <strong>{a.label || 'Address'}</strong>
                                            {a.isDefault ? <span style={styles.badge}>{t('profile.default', 'Default')}</span> : null}
                                        </div>
                                        <div style={styles.subtle}>{[a.city, a.area].filter(Boolean).join(' • ')}</div>
                                        <div style={{ marginTop: 4 }}>{a.streetOrLandmark}</div>
                                        {a.notes ? <div style={styles.hint}>{a.notes}</div> : null}
                                    </div>
                                    <div style={styles.addrActions}>
                                        {!a.isDefault ? (
                                            <button className="btn btn-outline" onClick={() => onSetDefaultAddress(a._id)}>
                                                {t('profile.makeDefault', 'Make default')}
                                            </button>
                                        ) : null}
                                        <button className="btn btn-outline" onClick={() => onDeleteAddress(a._id)}>
                                            {t('profile.delete', 'Delete')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={styles.divider}></div>

                    <form onSubmit={onAddAddress} style={{ display: 'grid', gap: 'var(--space-3)' }}>
                        <div style={styles.twoCol}>
                            <div>
                                <label style={styles.label}>{t('profile.addrLabel', 'Label')}</label>
                                <input
                                    className="input"
                                    value={addressDraft.label}
                                    onChange={(e) => setAddressDraft((d) => ({ ...d, label: e.target.value }))}
                                    placeholder="Home"
                                />
                            </div>
                            <div>
                                <label style={styles.label}>{t('profile.city', 'City')}</label>
                                <input
                                    className="input"
                                    value={addressDraft.city}
                                    onChange={(e) => setAddressDraft((d) => ({ ...d, city: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={styles.label}>{t('profile.area', 'Area / kebele')}</label>
                            <input
                                className="input"
                                value={addressDraft.area}
                                onChange={(e) => setAddressDraft((d) => ({ ...d, area: e.target.value }))}
                                placeholder={t('profile.areaPh', 'Optional')}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>{t('profile.street', 'Street or landmark')}</label>
                            <input
                                className="input"
                                value={addressDraft.streetOrLandmark}
                                onChange={(e) => setAddressDraft((d) => ({ ...d, streetOrLandmark: e.target.value }))}
                                placeholder={t('profile.streetPh', 'e.g., Secha, near Arbaminch University gate')}
                                required
                            />
                        </div>
                        <div>
                            <label style={styles.label}>{t('profile.notes', 'Notes')}</label>
                            <input
                                className="input"
                                value={addressDraft.notes}
                                onChange={(e) => setAddressDraft((d) => ({ ...d, notes: e.target.value }))}
                                placeholder={t('profile.notesPh', 'Optional: gate color, call when arriving…')}
                            />
                        </div>
                        <label style={styles.switchRow}>
                            <input
                                type="checkbox"
                                checked={addressDraft.isDefault}
                                onChange={(e) => setAddressDraft((d) => ({ ...d, isDefault: e.target.checked }))}
                            />
                            <span>{t('profile.setDefault', 'Set as default')}</span>
                        </label>
                        <button className="btn btn-primary" type="submit">
                            {t('profile.addAddress', 'Add address')}
                        </button>
                    </form>
                </div>

                <div className="card" style={styles.card}>
                    <h3 style={styles.cardTitle}>{t('profile.orders', 'Order history')}</h3>
                    {ordersLoading ? (
                        <div style={styles.subtle}>{t('common.loading', 'Loading…')}</div>
                    ) : orders.length === 0 ? (
                        <div style={styles.empty}>{t('profile.noOrders', 'No orders yet.')}</div>
                    ) : (
                        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                            {orders.slice(0, 10).map((o) => (
                                <div key={o._id} style={styles.orderItem}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <strong>#{String(o._id).slice(-6)}</strong>
                                        <span style={styles.badge}>{o.status || 'pending'}</span>
                                    </div>
                                    <div style={styles.subtle}>
                                        {(o.items?.length || 0)} items • {o.totalAmount} {t('common.etb', 'ETB')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card" style={styles.card}>
                    <h3 style={styles.cardTitle}>{t('profile.security', 'Security')}</h3>

                    <button className="btn btn-outline" onClick={onLogoutAll}>
                        {t('profile.logoutAll', 'Logout all devices')}
                    </button>

                    <div style={styles.divider}></div>

                    <div style={styles.subtle}>{t('profile.deleteInfo', 'Deleting an account requires phone verification (OTP).')}</div>

                    {reauthStep === 'idle' ? (
                        <button className="btn btn-outline" onClick={startReauth} disabled={deleting || avatarUploading}>
                            {t('profile.verifyToDelete', 'Verify to delete account')}
                        </button>
                    ) : null}

                    {reauthStep === 'sent' ? (
                        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                            <input
                                className="input"
                                value={reauthCode}
                                onChange={(e) => setReauthCode(e.target.value)}
                                placeholder={t('profile.codePh', 'Enter 6-digit code')}
                                inputMode="numeric"
                            />
                            <div style={styles.twoCol}>
                                <button className="btn btn-outline" type="button" onClick={startReauth}>
                                    {t('profile.resend', 'Resend')}
                                </button>
                                <button className="btn btn-primary" type="button" onClick={verifyReauth}>
                                    {t('profile.verify', 'Verify')}
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {reauthStep === 'verified' ? (
                        <button className="btn" style={{ background: 'var(--color-error-500)' }} onClick={onDeleteAccount} disabled={deleting}>
                            {deleting ? t('profile.deleting', 'Deleting…') : t('profile.deleteAccount', 'Delete account')}
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

const styles = {
    headerRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
    },
    subtle: {
        color: 'var(--color-text-light)',
        fontSize: 'var(--font-size-sm)',
    },
    grid: {
        display: 'grid',
        gap: 'var(--space-6)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    },
    card: {
        padding: 'var(--space-5)',
    },
    cardTitle: {
        marginTop: 0,
        marginBottom: 'var(--space-4)',
    },
    label: {
        display: 'block',
        marginBottom: 6,
        fontWeight: 'var(--font-weight-medium)',
    },
    hint: {
        marginTop: 6,
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-light)',
    },
    twoCol: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-3)',
    },
    switchGrid: {
        display: 'grid',
        gap: 'var(--space-2)',
    },
    switchRow: {
        display: 'flex',
        gap: 'var(--space-2)',
        alignItems: 'center',
        fontSize: 'var(--font-size-sm)',
    },
    divider: {
        height: 1,
        background: 'rgba(0,0,0,0.06)',
        margin: 'var(--space-5) 0',
    },
    empty: {
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-neutral-50)',
        color: 'var(--color-text-light)',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 999,
        background: 'var(--color-secondary-50)',
        color: 'var(--color-secondary-700)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
    },
    addressItem: {
        display: 'flex',
        gap: 'var(--space-3)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-4)',
        background: 'var(--color-surface)',
    },
    addressTop: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
    },
    addrActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        minWidth: 130,
    },
    orderItem: {
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-4)',
        background: 'var(--color-surface)',
    },
    avatarWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500))',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
    },
    avatarInitials: {
        color: 'white',
        fontWeight: 'var(--font-weight-bold)',
        fontSize: 'var(--font-size-lg)',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
};

export default Profile;
