import { createContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item, vendorId) => {
        // Check if item from same vendor
        if (cartItems.length > 0 && cartItems[0].vendorId !== vendorId) {
            if (!window.confirm("Start a new basket? You have items from another vendor.")) return;
            setCartItems([]);
        }

        setCartItems((prevItems) => {
            const existItem = prevItems.find((x) => x._id === item._id);
            if (existItem) {
                return prevItems.map((x) =>
                    x._id === item._id ? { ...x, qty: x.qty + 1 } : x
                );
            } else {
                return [...prevItems, { ...item, qty: 1, vendorId }];
            }
        });
    };

    const removeFromCart = (id) => {
        setCartItems((prevItems) =>
            prevItems.filter((x) => x._id !== id)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
