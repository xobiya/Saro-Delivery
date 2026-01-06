const EmptyState = ({
    icon = '📦',
    title = 'No items found',
    description,
    actionLabel,
    onAction
}) => {
    return (
        <div style={styles.container} className="fade-in">
            <div style={styles.iconContainer}>
                <span style={styles.icon}>{icon}</span>
            </div>
            <h3 style={styles.title}>{title}</h3>
            {description && <p style={styles.description}>{description}</p>}
            {actionLabel && onAction && (
                <button onClick={onAction} className="btn btn-primary" style={styles.actionBtn}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12)',
        textAlign: 'center',
    },
    iconContainer: {
        marginBottom: 'var(--space-4)',
    },
    icon: {
        fontSize: '4rem',
        opacity: 0.5,
        filter: 'grayscale(0.3)',
    },
    title: {
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-text)',
        marginBottom: 'var(--space-2)',
    },
    description: {
        fontSize: 'var(--font-size-base)',
        color: 'var(--color-text-light)',
        maxWidth: '400px',
        marginBottom: 'var(--space-6)',
    },
    actionBtn: {
        marginTop: 'var(--space-2)',
    },
};

export default EmptyState;
