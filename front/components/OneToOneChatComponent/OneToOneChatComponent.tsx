import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from "next/router";
import 'webrtc-adapter';

import { WebRTCController } from '../../controllers/WebRTCController';

import { getMediaStream, stopMediaStream, getCurrentDevicesFromStream } from '../../utils/media/getMedia';
import { executePromiseQueue } from '../../utils/executePromiseQueue';

import { SocketContext } from '../../contexts/SocketContext';

import { ChooseDevices } from '../../components/common/ChooseDevices';
import { Video } from '../../components/common/Video';

import { IOffer, IUser, IRemoteData, ISocketData, IOnICECandidateData } from '../../interfaces';
import { IMediaStream } from '../../interfaces/media.interface';

const OneToOneChatContainer = () => {
    const {
        state: { socketId },
        actions: { emit, emitAnyway, subscribe }
    }: any = useContext(SocketContext);

    // state
    const [users, setUsers] = useState<IUser[]>([]);
    const [localStream, setLocalStream] = useState<IMediaStream>(null);
    const [remoteStreams, setRemoteStreams] = useState<IRemoteData[]>([]);

    const router = useRouter();

    const handleSetMediaDevice = useCallback(async ({ audio, video }) => {
        const currentDevices = await getCurrentDevicesFromStream(localStream);

        if (audio && currentDevices.audio?.deviceId !== audio || video && currentDevices.video?.deviceId !== video) {
            stopMediaStream(localStream);

            const stream = await getMediaStream({ audio, video });

            const peerConnection = WebRTCController.getPeerConnectionInstance(socketId);

            if (peerConnection && stream) {
                setLocalStream(stream);
                peerConnection.applyNewLocalStream(stream);
            }
        }
    }, [socketId]);

    const handleUpdateUsers = useCallback((users: IUser[]) => setUsers(users), []);

    const onCreateOffer = async ({ userId, offer }: IOffer) => {
        const answer = await emit('one2one:sendOffer', { mainUserId: socketId, senderId: userId, offer });
        const peerConnectionInstance = WebRTCController.getPeerConnectionInstance(userId);

        if (peerConnectionInstance && userId && answer) {
            await peerConnectionInstance.processAnswer({ answer });
            const stream = peerConnectionInstance.getRemoteStream();
            if (userId !== socketId) {
                setRemoteStreams(prev => ([...prev, { userId, stream }]));
            }
        }
    };

    const onIceCandidate = async ({ userId, candidate }: IOnICECandidateData) => {
        emit('one2one:onIceCandidate', { userId, candidate });
    };

    const onLocalStreamAvailable = async (stream: IMediaStream) => {
        setLocalStream(stream);
        const users = await emit('one2one:getCurrentUsers');
        const peerConnection = WebRTCController.getPeerConnectionInstance(socketId);
        await peerConnection.connectToVideoChat();
        const usersExceptMe = users.filter((u: IUser) => u.socketId !== socketId);

        if (usersExceptMe.length) {
            emit('one2one:userConnected')
            const promiseConnections = usersExceptMe.map((u: IUser) => handleConnectToUser.bind(this, { userId: u.socketId }));
            await executePromiseQueue(promiseConnections);
        }
    }

    const handleUserLeft = (data: ISocketData) => {
        WebRTCController.releasePeerConnection({ userId: data.userId });
        setRemoteStreams(prev => prev.filter(remoteData => remoteData.userId !== data.userId));
    }

    const handleAddIceCandidate = async ({ userId, candidate }: ISocketData) => {
        const peerConnection = WebRTCController.getPeerConnectionInstance(userId);

        if (peerConnection) {
            await peerConnection.addIceCandidate(candidate as RTCIceCandidate);
        }
    };

    const handleConnectToUser = async (data: ISocketData) => {
        if (data.userId) {
            const peerConnection = WebRTCController.createPeerConnection({
                userId: data.userId,
                isReceiveOnly: true,
                onCreateOffer: onCreateOffer,
                onIceCandidate: onIceCandidate,
            });
            await peerConnection.connectToVideoChat();
        }
    };

    useEffect(() => {
        (async () => {
            if (socketId) {
                WebRTCController.createPeerConnection({
                    userId: socketId,
                    onCreateOffer: onCreateOffer,
                    onIceCandidate: onIceCandidate,
                    onLocalStreamAvailable: onLocalStreamAvailable
                });
            }
        })();
    }, [socketId]);

    // chat logic
    useEffect(() => {
        (async () => {
            if (router?.query?.token && socketId) {
                const data = await emit(
                    'one2one:joinRoom',
                    { roomId: router?.query?.token },
                );
                handleUpdateUsers(data.users);
            }
        })();
    }, [router, socketId]);

    useEffect(() => {
        if (socketId) {
            subscribe('one2one:iceCandidate', handleAddIceCandidate);
            subscribe('one2one:userLeft', handleUserLeft);
            subscribe('one2one:userConnected', handleConnectToUser);
            subscribe('one2one:availableUsers', handleUpdateUsers);
        }
    }, [socketId]);

    return (
        <>
            Video Chat Room
            <ChooseDevices onChooseMediaDevice={handleSetMediaDevice} />
            <Video stream={localStream} muted />
            {remoteStreams?.map((remoteData: IRemoteData) => (
                <Video
                    key={remoteData.userId}
                    stream={remoteData.stream}
                    userId={remoteData.userId}
                />
            ))}
        </>
    );
};

export default React.memo(OneToOneChatContainer);