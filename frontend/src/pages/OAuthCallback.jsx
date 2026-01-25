import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OAuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUserInfo } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);

    const [status, setStatus] = useState('Signing you in…');

    useEffect(() => {
        const run = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            const redirect = params.get('redirect') || '/profile';

            if (!token) {
                addToast('OAuth login failed. Please try again.', 'error');
                navigate('/login', { replace: true });
                return;
            }

            // Put token in storage immediately so api interceptor can attach it.
            localStorage.setItem('userInfo', JSON.stringify({ token }));

            try {
                setStatus('Fetching your profile…');
                const { data } = await api.get('/auth/me');
                setUserInfo({ ...data, token });

                addToast('Signed in successfully!', 'success');
                navigate(redirect, { replace: true });
            } catch (err) {
                console.error(err);
                localStorage.removeItem('userInfo');
                addToast('OAuth login failed. Please try again.', 'error');
                navigate('/login', { replace: true });
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="container" style={{ maxWidth: 520, marginTop: 'var(--space-16)' }}>
            <div className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                    <LoadingSpinner />
                    <div className="text-light" style={{ marginTop: 'var(--space-4)' }}>{status}</div>
                </div>
            </div>
        </div>
    );
};

export default OAuthCallback;
