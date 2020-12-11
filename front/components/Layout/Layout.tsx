import React from 'react';
import 'webrtc-adapter';

import { Navigation } from '../Navigation';
// import { ErudaContainer } from "../common/ErudaContainer";

import { SocketContextProvider } from '../../contexts/SocketContext';

interface IProps {
    children: React.ReactNode;
}

const Layout = ({ children }: IProps): JSX.Element => (
    <SocketContextProvider>
        <Navigation />
        {children}
        {/*<ErudaContainer />*/}
    </SocketContextProvider>
);

export default Layout;
