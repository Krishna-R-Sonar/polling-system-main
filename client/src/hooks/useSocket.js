// polling-system-main/client/src/hooks/useSocket.js
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const useSocket = () => {
  const socketRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!socketRef.current) {
      // Use environment variable for backend URL
      const serverUrl = process.env.NODE_ENV === 'production' 
        ? process.env.REACT_APP_API_URL || 'https://polling-system-main.onrender.com'
        : 'http://localhost:5001';

      console.log('useSocket: Connecting to', serverUrl);
      console.log('useSocket: REACT_APP_API_URL=', process.env.REACT_APP_API_URL);

      socketRef.current = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        autoConnect: true
      });

      socketRef.current.on('connect', () => {
        console.log('useSocket: Connected with ID:', socketRef.current.id);
        setIsInitialized(true);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('useSocket: Connection error:', error);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('useSocket: Disconnected:', reason);
        setIsInitialized(false);
      });
    }

    return () => {
      if (socketRef.current) {
        console.log('useSocket: Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsInitialized(false);
      }
    };
  }, []);

  return socketRef.current;
};

export default useSocket;