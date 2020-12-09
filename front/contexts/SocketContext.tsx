import React, {
    useCallback, useEffect, useRef, useState,
} from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'ws://localhost:8001';

const DEFAULT_SOCKET = {
    actions: {},
    state: {},
};

const SocketContext = React.createContext(DEFAULT_SOCKET);

const EVENT_LISTENERS = {};

let isConnecting = false;

const SocketContextProvider = (props): JSX.Element => {
    const { children } = props;

    const eventsToSendRef= useRef([]);
    const socketRef = useRef<SocketIOClient.Socket | null>();

    const [socketId, setSocketId] = useState<string>('');

    const emit = useCallback((event, data) => new Promise((resolve, reject) => {
        if (socketRef.current) {
            socketRef.current.emit(event, data, ({ err, result }) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        } else {
            resolve('');
        }
    }), []);

    // eslint-disable-next-line consistent-return
    const emitAnyway = useCallback((event, data) => {
        if (socketRef.current) {
            return emit(event, data);
        }
        if (!eventsToSendRef.current) {
            eventsToSendRef.current = [];
        }
        const newSocketEventData = {
            event,
            data,
        };
        eventsToSendRef.current.push(newSocketEventData);
    }, [emit]);

    const subscribe = useCallback((event, handler) => {
        if (socketRef.current) {
            socketRef.current.on(event, handler);
        }

        EVENT_LISTENERS[event] = EVENT_LISTENERS[event] || [];
        EVENT_LISTENERS[event].push(handler);
    }, [socketRef.current]);

    const unsubscribe = useCallback((event, handler) => {
        if (socketRef.current) {
            socketRef.current.removeListener(event, handler);
        }

        if (EVENT_LISTENERS[event]?.length) {
            EVENT_LISTENERS[event] = EVENT_LISTENERS[event].filter((el) => el !== handler);

            if (!EVENT_LISTENERS[event]?.length) {
                delete EVENT_LISTENERS[event];
            }
        }
    }, [socketRef.current]);

    const connect = useCallback(async () => {
        if (isConnecting || socketRef.current) {
            return;
        }
        isConnecting = true;

        const socket: SocketIOClient.Socket = io(SOCKET_URL, { transports: ['websocket'], timeout: 10000 });

        const events = Object.keys(EVENT_LISTENERS);

        events.map((event) => {
            EVENT_LISTENERS[event].map((handler) => {
                socket.on(event, handler);
            });
        });

        socket.on('connect', () => {
            isConnecting = false;
            socketRef.current = socket;
            setSocketId(socket.id);
            if (eventsToSendRef.current) {
                eventsToSendRef.current.map(({ event, data }) => emit(event, data));
                eventsToSendRef.current = [];
            }
        });
        socket.on('disconnect', () => {
            console.log('disconnect')
            socketRef.current = null;
            isConnecting = false;
        });
    }, [emit]);

    const disconnect = useCallback((clearCache = true) => {
        if (!socketRef.current) {
            return;
        }
        socketRef.current.disconnect();
        if (clearCache) {
            eventsToSendRef.current = [];
        }
    }, []);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, []);

    const actions = {
        subscribe,
        unsubscribe,
        emit,
        emitAnyway,
        disconnect,
        connect,
    };

    const state = {
        socketId,
    }

    return (
        <SocketContext.Provider value={{ state, actions }}>
            {children}
        </SocketContext.Provider>
    );
};

export {
    SocketContext,
    SocketContextProvider,
};
