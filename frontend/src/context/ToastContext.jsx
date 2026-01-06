import { createContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, clearAll }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null;

    return (
        <div style={styles.container}>
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

const Toast = ({ toast, onClose }) => {
    const { message, type } = toast;

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'var(--color-success-50)';
            case 'error':
                return 'var(--color-error-50)';
            case 'warning':
                return 'var(--color-warning-50)';
            default:
                return 'var(--color-secondary-50)';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return 'var(--color-success-500)';
            case 'error':
                return 'var(--color-error-500)';
            case 'warning':
                return 'var(--color-warning-500)';
            default:
                return 'var(--color-secondary-400)';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            default:
                return 'ℹ';
        }
    };

    return (
        <div className="toast slide-up" style={{ ...styles.toast, backgroundColor: getTypeStyles() }}>
            <div style={{ ...styles.icon, color: getIconColor() }}>
                {getIcon()}
            </div>
            <div style={styles.message}>{message}</div>
            <button
                onClick={onClose}
                style={styles.closeBtn}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 'var(--z-tooltip)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        maxWidth: '400px',
        width: 'calc(100vw - 40px)',
    },
    toast: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
    },
    icon: {
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-bold)',
        lineHeight: 1,
    },
    message: {
        flex: 1,
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text)',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: 'var(--font-size-2xl)',
        color: 'var(--color-text-light)',
        cursor: 'pointer',
        padding: '0',
        lineHeight: 1,
        transition: 'color var(--transition-fast)',
        minWidth: '24px',
        minHeight: '24px',
    },
};

export default ToastContext;
