import { createContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Connect to backend (same-origin by default; override with VITE_SOCKET_URL if needed)
        const socketUrl = import.meta.env.VITE_SOCKET_URL || undefined;
        const newSocket = io(socketUrl, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 10000,
        });
        socketRef.current = newSocket;
        setSocket(newSocket);

        // Useful in dev when Vite proxy/backend restarts reset connections
        newSocket.on('connect_error', (err) => {
            // eslint-disable-next-line no-console
            console.warn('[socket] connect_error', err?.message || err);
        });

        return () => {
            try {
                newSocket.removeAllListeners();
                newSocket.disconnect();
            } finally {
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
