import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // You could log this to an error reporting service here
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.content}>
                        <div style={styles.iconContainer}>
                            <span style={styles.icon}>⚠️</span>
                        </div>
                        <h1 style={styles.title}>Oops! Something went wrong</h1>
                        <p style={styles.description}>
                            We're sorry, but something unexpected happened.
                            The error has been logged and we'll look into it.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={styles.errorDetails}>
                                <summary style={styles.errorSummary}>Error Details</summary>
                                <pre style={styles.errorText}>{this.state.error.toString()}</pre>
                            </details>
                        )}
                        <div style={styles.actions}>
                            <button onClick={this.handleReset} className="btn btn-primary">
                                Go to Homepage
                            </button>
                            <button onClick={() => window.location.reload()} className="btn btn-outline">
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-background)',
    },
    content: {
        maxWidth: '600px',
        textAlign: 'center',
    },
    iconContainer: {
        marginBottom: 'var(--space-6)',
    },
    icon: {
        fontSize: '5rem',
    },
    title: {
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text)',
        marginBottom: 'var(--space-4)',
    },
    description: {
        fontSize: 'var(--font-size-lg)',
        color: 'var(--color-text-light)',
        marginBottom: 'var(--space-6)',
        lineHeight: 'var(--line-height-relaxed)',
    },
    errorDetails: {
        marginTop: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-neutral-100)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'left',
    },
    errorSummary: {
        cursor: 'pointer',
        fontWeight: 'var(--font-weight-medium)',
        marginBottom: 'var(--space-2)',
    },
    errorText: {
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-error-700)',
        overflow: 'auto',
        maxHeight: '200px',
    },
    actions: {
        display: 'flex',
        gap: 'var(--space-4)',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
};

export default ErrorBoundary;
