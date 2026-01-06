import { useState } from 'react';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Thank you, ${formData.name}! We have received your message.`);
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div style={styles.container}>
            <div className="container" style={styles.wrapper}>
                <div style={styles.info}>
                    <h1 style={styles.title}>Contact Us</h1>
                    <p style={styles.text}>We'd love to hear from you. Reach out for support, partnership, or feedback.</p>

                    <div style={styles.details}>
                        <div style={styles.detailItem}>
                            <strong>Address:</strong><br />
                            Arba Minch, Ethiopia<br />
                            Sikela Main Road
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Email:</strong><br />
                            support@saro.com
                        </div>
                        <div style={styles.detailItem}>
                            <strong>Phone:</strong><br />
                            +251 911 22 33 44
                        </div>
                    </div>
                </div>

                <div style={styles.formContainer}>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Send a Message</h3>
                        <div style={styles.group}>
                            <label style={styles.label}>Name</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div style={styles.group}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                style={styles.input}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div style={styles.group}>
                            <label style={styles.label}>Message</label>
                            <textarea
                                style={styles.textarea}
                                rows="5"
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" style={styles.button}>Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '4rem 0',
        backgroundColor: '#fff',
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4rem',
        justifyContent: 'center',
    },
    info: {
        flex: '1 1 300px',
        maxWidth: '500px',
    },
    title: {
        fontSize: '3rem',
        marginBottom: '1rem',
        color: '#333',
    },
    text: {
        fontSize: '1.1rem',
        color: '#666',
        marginBottom: '3rem',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    detailItem: {
        fontSize: '1rem',
        color: '#333',
        lineHeight: '1.5',
    },
    formContainer: {
        flex: '1 1 400px',
        maxWidth: '500px',
    },
    form: {
        backgroundColor: '#f9f9f9',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
    },
    group: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 'bold',
        color: '#555',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        outline: 'none',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        outline: 'none',
        resize: 'vertical',
    },
    button: {
        width: '100%',
        padding: '1rem',
        backgroundColor: '#e67e22',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    }
};

export default Contact;
