import React from 'react';
import 'webrtc-adapter';

import { Navigation } from '../Navigation';

import { SocketContextProvider } from '../../contexts/SocketContext';

interface IProps {
    children: React.ReactNode;
}

const Layout = ({ children }: IProps): JSX.Element => (
    <SocketContextProvider>
        <Navigation />
        {children}
    </SocketContextProvider>
);

export default Layout;
