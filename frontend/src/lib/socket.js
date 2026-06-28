import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
    return socket;
};

export const connectSocket = (token) => {
    if (socket) {
        if (socket.connected) return socket;
        socket.connect();
        return socket;
    }

    const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1';
    const socketUrl = baseApiUrl.replace('/v1', '');

    socket = io(socketUrl, {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('Socket.io connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket.io disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
        console.error('Socket.io connection error:', err.message);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket.io cleaned up and disconnected');
    }
};
