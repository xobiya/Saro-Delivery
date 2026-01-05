import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'customer', phone: ''
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData.name, formData.email, formData.password, formData.role, formData.phone);
            navigate('/dashboard');
        } catch (error) {
            alert('Registration failed');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} style={styles.input} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} style={styles.input} required />
                <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} style={styles.input} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} style={styles.input} required />
                <select name="role" onChange={handleChange} style={styles.input}>
                    <option value="customer">Customer</option>
                    <option value="driver">Driver</option>
                </select>
                <button type="submit" style={styles.button}>Register</button>
            </form>
        </div>
    );
};

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    input: {
        padding: '0.75rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '1rem',
    },
    button: {
        padding: '0.75rem',
        backgroundColor: '#27ae60',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    }
};

export default Register;
