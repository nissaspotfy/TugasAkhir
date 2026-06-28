import React, { useEffect } from 'react';
import AppRouter from './router';
import GamifiedPopup from './components/GamifiedPopup';
import useAuthStore from './stores/authStore';
import useNotificationStore from './stores/notificationStore';

function App() {
  const { token, isAuthenticated } = useAuthStore();
  const { initializeSocket, disconnectSocket } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      initializeSocket(token);
    } else {
      disconnectSocket();
    }
    
    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, token, initializeSocket, disconnectSocket]);

  return (
    <>
      <AppRouter />
      <GamifiedPopup />
    </>
  )
}

export default App
