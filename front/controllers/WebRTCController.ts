import { WebRtcPeerConnection } from '../utils/webrtc/WebRtcPeerConnection';
import { ICreatePeerConnection, IWebRTCConnection } from '../interfaces';

class WebRTCControllerConstructor {
    peerConnections: { [userId: string]: IWebRTCConnection };

    constructor() {
        this.peerConnections = {};
    }

    createPeerConnection({
        userId,
        onCreateOffer,
        onIceCandidate,
        onLocalStreamAvailable,
        isReceiveOnly
    }: ICreatePeerConnection): IWebRTCConnection {
        if (!this.peerConnections[userId]) {
            const peerConnection = new WebRtcPeerConnection({
                userId,
                isReceiveOnly,
                onCreateOffer,
                onIceCandidate,
                onLocalStreamAvailable,
            });

            this.peerConnections[userId] = peerConnection;

            return peerConnection;
        }
        return this.peerConnections[userId];
    }

    getPeerConnection = (userId: string): RTCPeerConnection => {
        return this.peerConnections[userId]?.peerConnection;
    }

    getPeerConnectionInstance = (userId: string): IWebRTCConnection => {
        return this.peerConnections[userId];
    }

    releasePeerConnection = ({ userId }: { userId: string }) => {
        const peerConnectionInstance = this.getPeerConnectionInstance(userId);
        peerConnectionInstance?.release();
    }
}

const controller = new WebRTCControllerConstructor();

export const WebRTCController = controller
