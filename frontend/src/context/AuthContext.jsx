import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const setUserInfo = (data) => {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
    };

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUserInfo(data);
        return data;
    };

    const register = async (name, email, password, role, phone) => {
        const { data } = await api.post('/auth/register', { name, email, password, role, phone });
        setUserInfo(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setUserInfo }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
