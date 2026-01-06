const About = () => {
    return (
        <div style={styles.container}>
            <div className="container">
                <section style={styles.header}>
                    <h1 style={styles.title}>About Saro Delivery</h1>
                    <p style={styles.subtitle}>Connecting you with the flavors of Arba Minch.</p>
                </section>

                <section style={styles.content}>
                    <div style={styles.imageBlock}>
                        <img
                            src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800"
                            alt="Delivery Team"
                            style={styles.image}
                        />
                    </div>
                    <div style={styles.textBlock}>
                        <h3>Our Mission</h3>
                        <p>
                            Saro Delivery was founded to bridge the gap between hungry customers and the best local restaurants and hotels.
                            We believe that getting great food delivered should be fast, easy, and reliable.
                        </p>
                        <h3>Why Choose Us?</h3>
                        <ul>
                            <li><strong>Local Focus:</strong> We partner exclusively with trusted Arba Minch vendors.</li>
                            <li><strong>Speed:</strong> Our dedicated fleet ensures your food arrives hot.</li>
                            <li><strong>Community:</strong> We support local businesses and create jobs for drivers.</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '3rem 0',
    },
    header: {
        textAlign: 'center',
        marginBottom: '4rem',
    },
    title: {
        fontSize: '3rem',
        color: '#333',
        marginBottom: '1rem',
    },
    subtitle: {
        fontSize: '1.25rem',
        color: '#777',
    },
    content: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '3rem',
        alignItems: 'center',
    },
    imageBlock: {
        flex: '1 1 400px',
    },
    image: {
        width: '100%',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    textBlock: {
        flex: '1 1 400px',
        fontSize: '1.1rem',
        lineHeight: '1.8',
        color: '#555',
    }
};

export default About;
