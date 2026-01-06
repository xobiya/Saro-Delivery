const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
    const sizeMap = {
        sm: '24px',
        md: '40px',
        lg: '60px'
    };

    const spinnerSize = sizeMap[size] || sizeMap.md;

    if (fullScreen) {
        return (
            <div style={styles.fullScreenContainer}>
                <div style={{ ...styles.spinner, width: spinnerSize, height: spinnerSize }}>
                    <div style={styles.spinnerCircle}></div>
                </div>
                <p style={styles.loadingText}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={{ ...styles.spinner, width: spinnerSize, height: spinnerSize }}>
                <div style={styles.spinnerCircle}></div>
            </div>
        </div>
    );
};

const styles = {
    fullScreenContainer: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 'var(--z-modal)',
    },
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
    },
    spinner: {
        position: 'relative',
        animation: 'spin 1s linear infinite',
    },
    spinnerCircle: {
        width: '100%',
        height: '100%',
        border: '3px solid var(--color-neutral-200)',
        borderTop: '3px solid var(--color-primary-500)',
        borderRadius: '50%',
    },
    loadingText: {
        fontSize: 'var(--font-size-base)',
        color: 'var(--color-text-light)',
        fontWeight: 'var(--font-weight-medium)',
    },
};

// Add spin animation safely by creating a new style element
if (typeof document !== 'undefined') {
    const styleId = 'loading-spinner-keyframes';
    // Only add the style if it doesn't already exist
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

export default LoadingSpinner;
