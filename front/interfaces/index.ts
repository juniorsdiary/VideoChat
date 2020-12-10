import { IMediaConstrains, IMediaStream, IStreamMediaDevice } from './media.interface';

export interface ICreatePeerConnection {
    userId: string;
    isReceiveOnly?: boolean;
    onCreateOffer: (data: IOffer) => Promise<void>;
    onIceCandidate: (data: IOnICECandidateData) => Promise<void>;
    onLocalStreamAvailable?: (data: IMediaStream) => void;
}

export interface IPeerConnectionData {
    userId: string;
    isReceiveOnly?: boolean;
    onCreateOffer: (data: IOffer) => Promise<void>;
    onIceCandidate: (data: IOnICECandidateData) => Promise<void>;
    onLocalStreamAvailable?: (data: IMediaStream) => void;
}

export interface IWebRTCConnection {
    peerConnection: RTCPeerConnection;
    userId: string;
    isReceiveOnly: boolean;
    remoteStream?: MediaStream;
    onCreateOffer: (data: IOffer) => Promise<void>;
    onIceCandidate: (data: IOnICECandidateData) => Promise<void>;
    processAnswer: (data: IReceivedAnswer) => Promise<void>;
    addIceCandidate: (data: RTCIceCandidate) => Promise<void>;
    connectToVideoChat: () => void;
    getRemoteStream: () => MediaStream | undefined;
    onLocalStreamAvailable?: (data: IMediaStream) => void;
    applyNewLocalStream: (stream: IMediaStream) => void;
    release: () => void;
}

export interface IOnICECandidateData {
    userId: string;
    candidate?: RTCIceCandidate;
}

export interface IOffer {
    userId: string;
    offer: RTCSessionDescription;
}

export interface IAnswer {
    userId: string;
    answer: RTCSessionDescription;
}

export interface IReceivedAnswer {
    answer: string;
}

export interface IUser {
    socketId: string;
    roomId: string;
}

export interface IRemoteData {
    userId: string;
    stream: IMediaStream
}

export interface ISocketData {
    userId: string;
    candidate?: RTCIceCandidate;
}

export interface IChooseMediaConstrainsProps {
    onChangeMediaConstrains: (constrains: IMediaConstrains) => void;
    currentAudioDevice: IStreamMediaDevice;
    currentVideoDevice: IStreamMediaDevice;
}