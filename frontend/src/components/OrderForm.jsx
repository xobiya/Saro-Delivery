import { useState } from 'react';

const OrderForm = ({ onSubmit }) => {
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [note, setNote] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!pickup || !dropoff || !itemName || !itemPrice) return;

        const orderData = {
            pickupLocation: { address: pickup },
            dropoffLocation: { address: dropoff },
            items: [{ name: itemName, price: Number(itemPrice), quantity: 1 }],
            totalAmount: Number(itemPrice) + 50, // simple logic: +50 delivery fee
            notes: note,
        };

        onSubmit(orderData);

        // Reset form
        setPickup('');
        setDropoff('');
        setItemName('');
        setItemPrice('');
        setNote('');
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3>New Delivery Order</h3>
            <div style={styles.group}>
                <label>Pickup Location (Arba Minch)</label>
                <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g., Tourist Hotel"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    required
                />
            </div>
            <div style={styles.group}>
                <label>Dropoff Location</label>
                <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g., AM User Dorm Block 5"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    required
                />
            </div>
            <div style={styles.row}>
                <div style={styles.group}>
                    <label>Item Name</label>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="e.g., Pizza"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        required
                    />
                </div>
                <div style={styles.group}>
                    <label>Price (ETB)</label>
                    <input
                        style={styles.input}
                        type="number"
                        placeholder="0.00"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div style={styles.group}>
                <label>Notes</label>
                <textarea
                    style={styles.textarea}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
            <button type="submit" style={styles.button}>Place Order</button>
        </form>
    );
};

const styles = {
    form: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '2rem',
    },
    group: {
        marginBottom: '1rem',
        textAlign: 'left',
    },
    row: {
        display: 'flex',
        gap: '1rem',
    },
    input: {
        width: '100%',
        padding: '0.5rem',
        fontSize: '1rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        marginTop: '0.25rem',
    },
    textarea: {
        width: '100%',
        padding: '0.5rem',
        fontSize: '1rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        minHeight: '80px',
    },
    button: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#e67e22',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: 'bold',
    }
};

export default OrderForm;
