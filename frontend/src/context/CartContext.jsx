import { createContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'saro_cart_v1';

const safeParse = (value) => {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const getInitialState = () => {
    const stored = safeParse(localStorage.getItem(STORAGE_KEY));
    const deliveryDefaults = { landmark: '', address: '', phone: '', instructions: '' };
    if (!stored) {
        return {
            cartItems: [],
            deliveryDetails: deliveryDefaults,
            paymentMethod: 'cash',
        };
    }
    return {
        cartItems: Array.isArray(stored.cartItems) ? stored.cartItems : [],
        deliveryDetails: { ...deliveryDefaults, ...(stored.deliveryDetails || {}) },
        paymentMethod: stored.paymentMethod || 'cash',
    };
};

export const CartProvider = ({ children }) => {
    const [{ cartItems, deliveryDetails, paymentMethod }, setState] = useState(getInitialState);

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ cartItems, deliveryDetails, paymentMethod })
        );
    }, [cartItems, deliveryDetails, paymentMethod]);

    const addToCart = (item, vendorId) => {
        // Check if item from same vendor
        if (cartItems.length > 0 && cartItems[0].vendorId !== vendorId) {
            if (!window.confirm("Start a new basket? You have items from another vendor.")) return;
            setState((prev) => ({ ...prev, cartItems: [] }));
        }

        setState((prev) => {
            const prevItems = prev.cartItems;
            const existItem = prevItems.find((x) => x._id === item._id);
            if (existItem) {
                return {
                    ...prev,
                    cartItems: prevItems.map((x) =>
                        x._id === item._id ? { ...x, qty: x.qty + 1 } : x
                    ),
                };
            } else {
                return {
                    ...prev,
                    cartItems: [...prevItems, { ...item, qty: 1, vendorId }],
                };
            }
        });
    };

    const removeFromCart = (id) => {
        setState((prev) => ({
            ...prev,
            cartItems: prev.cartItems.filter((x) => x._id !== id),
        }));
    };

    const clearCart = () => {
        setState((prev) => ({ ...prev, cartItems: [] }));
    };

    const clearAll = () => {
        setState({
            cartItems: [],
            deliveryDetails: { landmark: '', address: '', phone: '', instructions: '' },
            paymentMethod: 'cash',
        });
    };

    const setDeliveryDetails = (patch) => {
        setState((prev) => ({
            ...prev,
            deliveryDetails: { ...prev.deliveryDetails, ...patch },
        }));
    };

    const setPaymentMethod = (next) => {
        setState((prev) => ({ ...prev, paymentMethod: next }));
    };

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    const value = useMemo(
        () => ({
            cartItems,
            addToCart,
            removeFromCart,
            clearCart,
            clearAll,
            totalPrice,
            deliveryDetails,
            setDeliveryDetails,
            paymentMethod,
            setPaymentMethod,
        }),
        [cartItems, deliveryDetails, paymentMethod, totalPrice]
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
