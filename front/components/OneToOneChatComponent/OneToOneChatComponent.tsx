import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from "next/router";
import 'webrtc-adapter';

import { WebRTCController } from '../../controllers/WebRTCController';

import { getMediaStream, stopMediaStream, getCurrentDevicesFromStream, getMediaDevicesResolution, getMediaStreamWithConstrain } from '../../utils/media/getMedia';
import { executePromiseQueue } from '../../utils/executePromiseQueue';

import { SocketContext } from '../../contexts/SocketContext';

import { ChooseDevices } from '../../components/common/ChooseDevices';
import { Video } from '../../components/common/Video';

import { IOffer, IUser, IRemoteData, ISocketData, IOnICECandidateData, IChooseMediaConstrainsProps } from '../../interfaces';
import { IMediaStream, IMediaConstrains, IStreamMediaDevices } from '../../interfaces/media.interface';

function ChooseMediaConstrains({ onChangeMediaConstrains, currentAudioDevice, currentVideoDevice }: IChooseMediaConstrainsProps) {
    const [availableResolutions, setAvailableResolutions] = useState<any>([]);

    useEffect(() => {
        const deviceResolutions = getMediaDevicesResolution(currentAudioDevice, currentVideoDevice);
        for (let i = 0; i < deviceResolutions.length - 1; i++) {
            setTimeout(() => {
                getMediaStreamWithConstrain({video: deviceResolutions[i].video, audio: deviceResolutions[i].audio })
                    .then(stream => {
                        stopMediaStream(stream);
                        setAvailableResolutions((prev: any) => ([...prev, deviceResolutions[i]]));
                    })
                    .catch(e => {
                        console.log(e);
                    })
            }, 1000)
        }
    }, []);

    const handleChooseResolution = (resolution: any) => {
        onChangeMediaConstrains({ video: resolution.video, audio: resolution.audio });
    }

    return (
        <div>
            <p>
                Choose Media Constrains
            </p>
            <ul>
                {availableResolutions.map((resolution: any, i: number) => {
                    return (
                        <li key={`${resolution.label}_${i}`} onClick={() => handleChooseResolution(resolution)}>{resolution.label}</li>
                    )
                })}
            </ul>
        </div>
    );
}

const OneToOneChatContainer = () => {
    const {
        state: { socketId },
        actions: { emit, subscribe }
    }: any = useContext(SocketContext);

    // state
    const [users, setUsers] = useState<IUser[]>([]);
    const [localStream, setLocalStream] = useState<IMediaStream>(null);
    const [remoteStreams, setRemoteStreams] = useState<IRemoteData[]>([]);
    const [currentDevices, setCurrentDevices] = useState<IStreamMediaDevices>({ audio: null, video: null });

    const router = useRouter();

    const handleSetMediaDevice = useCallback(async ({ audio, video }) => {
        const currentDevices = await getCurrentDevicesFromStream(localStream);

        if (audio && currentDevices.audio?.deviceId !== audio || video && currentDevices.video?.deviceId !== video) {
            stopMediaStream(localStream);

            const stream = await getMediaStream({ audio, video });
            const newDevices = await getCurrentDevicesFromStream(stream);

            const peerConnection = WebRTCController.getPeerConnectionInstance(socketId);

            if (peerConnection && stream) {
                setLocalStream(stream);
                peerConnection.applyNewLocalStream(stream);
                setCurrentDevices({
                    audio: newDevices.audio,
                    video: newDevices.video
                });
            }
        }
    }, [socketId]);

    const handleUpdateUsers = useCallback((users: IUser[]) => setUsers(users), []);

    const handleChooseMediaConstrains = async (constrains: IMediaConstrains) => {
        stopMediaStream(localStream);
        const stream = await getMediaStreamWithConstrain(constrains);
        const newDevices = await getCurrentDevicesFromStream(stream);

        const peerConnection = WebRTCController.getPeerConnectionInstance(socketId);

        if (peerConnection && stream) {
            setLocalStream(stream);
            peerConnection.applyNewLocalStream(stream);
            setCurrentDevices({
                audio: newDevices.audio,
                video: newDevices.video
            });
        }
    }

    const onCreateOffer = async ({ userId, offer }: IOffer) => {
        const answer = await emit('many2many:sendOffer', { mainUserId: socketId, senderId: userId, offer });
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
        emit('many2many:onIceCandidate', { userId, candidate });
    };

    const onLocalStreamAvailable = async (stream: IMediaStream) => {
        setLocalStream(stream);
        const currentDevices = await getCurrentDevicesFromStream(stream);

        setCurrentDevices({
            audio: currentDevices.audio,
            video: currentDevices.video
        });
        const users = await emit('many2many:getCurrentUsers');
        const peerConnection = WebRTCController.getPeerConnectionInstance(socketId);
        await peerConnection.connectToVideoChat();
        const usersExceptMe = users.filter((u: IUser) => u.socketId !== socketId);

        if (usersExceptMe.length) {
            emit('many2many:userConnected')
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
                    'many2many:joinRoom',
                    { roomId: router?.query?.token },
                );
                handleUpdateUsers(data.users);
            }
        })();
    }, [router, socketId]);

    useEffect(() => {
        if (socketId) {
            subscribe('many2many:iceCandidate', handleAddIceCandidate);
            subscribe('many2many:userLeft', handleUserLeft);
            subscribe('many2many:userConnected', handleConnectToUser);
            subscribe('many2many:availableUsers', handleUpdateUsers);
        }
    }, [socketId]);

    useEffect(() => {
        navigator.mediaDevices.ondevicechange = () => {
            console.log('devices changed')
        }
    }, [])

    return (
        <>
            Video Chat Room
            <ChooseDevices onChooseMediaDevice={handleSetMediaDevice} />
            {(currentDevices.video && currentDevices.audio) && (
                <ChooseMediaConstrains
                    currentAudioDevice={currentDevices.audio}
                    currentVideoDevice={currentDevices.video}
                    onChangeMediaConstrains={handleChooseMediaConstrains}
                />
            )}
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