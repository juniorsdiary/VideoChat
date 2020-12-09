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

    // updateCodecPriority(sdp) {
    //     // prefer vp8 codec instead of transcoding
    //     const vp8 = sdp.match(/a=rtpmap:.* VP8\/90000/gi);
    //     if (!vp8) {
    //         return sdp;
    //     }
    //     const vp8Payloads = vp8.map(h => h.split('rtpmap:')[1].split('VP8')[0].trim());
    //     const mVideo = sdp.match(/m=video .*/i)[0].split(' ');
    //     const videoData = mVideo.slice(0, 3).join(' ');
    //     const existedPayloads = mVideo.slice(3, mVideo.length - 1).filter(p => !vp8Payloads.includes(p));
    //     return sdp.replace(/m=video .*/i, `${videoData} ${vp8Payloads.join(' ')} ${existedPayloads.join(' ')}`);
    // }
}

const controller = new WebRTCControllerConstructor();

export const WebRTCController = controller
