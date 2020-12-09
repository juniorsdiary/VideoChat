import { getMediaStream, stopMediaStream } from "../media/getMedia";

import { IMediaStream } from "../../interfaces/media.interface";
import {
    IOnICECandidateData,
    IPeerConnectionData,
    IWebRTCConnection,
    IOffer,
    IReceivedAnswer
} from '../../interfaces';

const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302',
        },
        {
            urls: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808',
        },
    ],
};

export class WebRtcPeerConnection implements IWebRTCConnection {
    peerConnection: RTCPeerConnection;
    userId: string;
    isReceiveOnly: boolean;
    remoteStream?: MediaStream;
    onCreateOffer: (data: IOffer) => Promise<void>;
    onIceCandidate: (data: IOnICECandidateData) => Promise<void>;
    onLocalStreamAvailable?: (data: IMediaStream) => void;
    candidateQueue: RTCIceCandidate[];

    constructor(data: IPeerConnectionData) {
        this.peerConnection = new RTCPeerConnection(configuration);
        this.onCreateOffer = data.onCreateOffer;
        this.onIceCandidate = data.onIceCandidate;
        this.onLocalStreamAvailable = data.onLocalStreamAvailable;
        this.isReceiveOnly = data.isReceiveOnly || false;
        this.userId = data.userId;
        this.candidateQueue = [];
        this.initPeerConnectionData().then(() => {
            console.log('Peer Connection data initialized');
        })
    }

    async initPeerConnectionData() {
        if (!this.isReceiveOnly) {
            await this.initPeerConnectionLocalStream();
        }
        this.initPeerConnectionEvents();
        this.shimGetLocalStreams();
        this.shimGetRemoteStreams();
    }

    initPeerConnectionLocalStream = async (): Promise<void> => {
        const stream = await getMediaStream({ audio: '', video: '' });
        if (this.onLocalStreamAvailable) {
            this.addTracks(stream);
            this.onLocalStreamAvailable(stream);
        }
    }

    initPeerConnectionEvents = () => {
        this.peerConnection.onicecandidate = async (e: RTCPeerConnectionIceEvent) => {
            if (!e.candidate) return;
            await this.onIceCandidate({
                userId: this.userId,
                candidate: e.candidate,
            });
        };
    }

    shimGetLocalStreams = () => {
        const pc = this.peerConnection;
        if (!pc.getLocalStreams && pc.getSenders) {
            pc.getLocalStreams = () => {
                const stream = new MediaStream();
                pc.getSenders().forEach((sender: RTCRtpSender) => {
                    const track = sender.track as MediaStreamTrack;
                    stream.addTrack(track);
                });
                return [stream];
            };
        }

    }

    shimGetRemoteStreams = () => {
        const pc = this.peerConnection;
        if (!pc.getRemoteStreams && pc.getReceivers) {
            pc.getRemoteStreams = (): MediaStream[] => {
                const stream = new MediaStream();
                pc.getReceivers().forEach((sender: RTCRtpReceiver) => {
                    const track = sender.track as MediaStreamTrack;
                    stream.addTrack(track);
                });
                return [stream];
            };
        }
    }

    addTracks = (stream: MediaStream | null | undefined) => {
        try {
            const pc = this.peerConnection;

            if (pc.signalingState === 'closed') {
                console.log('The peer connection object is in "closed" state. This is most likely due to an invocation of the dispose method before accepting in the dialogue');
            }

            if (stream) {
                stream.getTracks().forEach((track: MediaStreamTrack) => {
                    pc.addTrack(track, stream);
                });
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    connectToVideoChat = async (): Promise<void> => {
        const pc = this.peerConnection;

        if (this.isReceiveOnly) {
            pc.addTransceiver('audio', {
                direction: 'recvonly'
            });
            pc.addTransceiver('video', {
                direction: 'recvonly'
            });
        }
        const sdpOffer = await pc.createOffer();

        const offer = new RTCSessionDescription({
            type: 'offer',
            sdp: sdpOffer.sdp
        });

        await pc.setLocalDescription(offer);

        await this.onCreateOffer({ userId: this.userId, offer });
        return;
    }

    getRemoteStream(): MediaStream | undefined {
        this.remoteStream = this.peerConnection.getRemoteStreams()[0];
        return this.remoteStream;
    }

    processAnswer = async ({ answer: sdpAnswer }: IReceivedAnswer): Promise<void> => {
        const answer = new RTCSessionDescription({
            type: 'answer',
            sdp: sdpAnswer
        });

        await this.peerConnection.setRemoteDescription(answer);

        if (this.peerConnection.signalingState === 'stable') {
            if (this.candidateQueue.length) {
                const addCandidatesQueue = this.candidateQueue.map(this.addIceCandidate);

                await Promise.all(addCandidatesQueue);

                this.candidateQueue = [];
            }
        }
        return;
    }

    addIceCandidate = async (candidate: RTCIceCandidate): Promise<void> => {
        if (this.peerConnection.signalingState === 'stable') {
            await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate),
            );
        } else {
            this.candidateQueue.push(candidate);
        }
    }

    release = (): void => {
        const pc = this.peerConnection;
        if (pc.signalingState === 'closed') return;
        pc.getLocalStreams().forEach(stopMediaStream);
        pc.close();
    }

    applyNewLocalStream = (stream: IMediaStream): void => {
        const pc = this.peerConnection;
        const videoTrack = stream?.getVideoTracks()[0];
        const audioTrack = stream?.getAudioTracks()[0];

        const senders = pc.getSenders();

        senders.forEach(sender => {
            if (sender.track?.kind === 'video' && videoTrack) sender.replaceTrack(videoTrack);
            if (sender.track?.kind === 'audio' && audioTrack) sender.replaceTrack(audioTrack);
        });
        return;
    }
}