import { useState, useEffect, useCallback, useRef } from 'react';

const useWebSocket = (url) => {
    const [data, setData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const ws = useRef(null);

    const connect = useCallback(() => {
        try {
            ws.current = new WebSocket(url);

            ws.current.onopen = () => {
                setIsConnected(true);
                setError(null);
            };

            ws.current.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                setData(parsedData);
            };

            ws.current.onerror = (err) => {
                console.error('WebSocket error:', err);
                setError(err);
            };

            ws.current.onclose = () => {
                setIsConnected(false);
                // Basic reconnection logic
                setTimeout(() => connect(), 3000);
            };
        } catch (err) {
            setError(err);
        }
    }, [url]);

    useEffect(() => {
        connect();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [connect]);

    return { data, isConnected, error };
};

export default useWebSocket;
