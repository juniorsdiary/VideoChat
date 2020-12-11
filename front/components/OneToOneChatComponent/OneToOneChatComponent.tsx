import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from "next/router";
import 'webrtc-adapter';

// controller
import { WebRTCController } from '../../controllers/WebRTCController';

//media helpers
import { getMediaStream, stopMediaStream, getCurrentDevicesFromStream, getMediaStreamWithConstrain } from '../../utils/media/getMedia';
import { executePromiseQueue } from '../../utils/executePromiseQueue';

// contexts
import { SocketContext } from '../../contexts/SocketContext';

// components
import { ChooseDevices } from '../../components/common/ChooseDevices';
import { ChooseMediaConstrains } from '../../components/common/ChooseMediaConstrains';
import { Video } from '../../components/common/Video';

// interfaces and types
import { IOffer, IUser, IRemoteData, ILocalData, ISocketData, IOnICECandidateData } from '../../interfaces';
import { IMediaStream, IMediaConstrains, IStreamMediaDevices } from '../../interfaces/media.interface';

const OneToOneChatContainer = () => {
    const {
        state: { socketId },
        actions: { emit, subscribe }
    }: any = useContext(SocketContext);

    // state
    const [users, setUsers] = useState<IUser[]>([]);
    const [localUserData, setLocalUserData] = useState<ILocalData>({ userId: socketId, isAudioMuted: false, isVideoMuted: false });
    const [remoteStreams, setRemoteStreams] = useState<IRemoteData[]>([]);
    const [currentDevices, setCurrentDevices] = useState<IStreamMediaDevices>({ audio: null, video: null });

    const router = useRouter();

    const handleSetMediaDevice = useCallback(async ({ audio, video }) => {
        const currentDevices = await getCurrentDevicesFromStream(localUserData.stream);

        if (
            audio && currentDevices.audio?.deviceId !== audio
            || video && currentDevices.video?.deviceId !== video
        ) {
            const stream = await getMediaStream({ audio, video });

            await applyStreamToPeerConnection(stream);
        }
    }, [socketId]);

    const applyStreamToPeerConnection = async (newStream: IMediaStream) => {
        const newDevices = await getCurrentDevicesFromStream(newStream);
        const peerConnection = WebRTCController.getPeerConnectionInstance(socketId);

        if (peerConnection && newStream) {
            setLocalUserData({ userId: socketId, stream: newStream, isAudioMuted: true, isVideoMuted: true });

            peerConnection.applyNewLocalStream(newStream);

            setCurrentDevices({
                audio: newDevices.audio,
                video: newDevices.video
            });
        }
    }

    const applyConstrainsToStream = async (constrains: any) => {
        const videoTracks = localUserData?.stream?.getVideoTracks();
        const audioTracks = localUserData?.stream?.getAudioTracks();
        if (videoTracks) {
            const videoTrackPromises = videoTracks.map(async track => {
                await track.applyConstraints(constrains.video);
            });
            await Promise.all(videoTrackPromises);
        }

        if (audioTracks) {
            const audioTrackPromises = audioTracks.map(async track => {
                await track.applyConstraints(constrains.audio);
            });
            await Promise.all(audioTrackPromises);
        }
    }

    const handleUpdateUsers = useCallback((users: IUser[]) => setUsers(users), []);

    const handleChooseMediaConstrains = async (constrains: any) => {
        // change stream hardly

        // stopMediaStream(localUserData.stream);
        // const stream = await getMediaStreamWithConstrain(constrains);
        // await applyStreamToPeerConnection(stream);

        // change tracks in existing stream
        await applyConstrainsToStream(constrains);
    }

    const onCreateOffer = async ({ userId, offer }: IOffer) => {
        const answer = await emit('many2many:sendOffer',
            {
                mainUserId: socketId,
                senderId: userId,
                offer
            }
        );

        const peerConnectionInstance = WebRTCController.getPeerConnectionInstance(userId);

        if (peerConnectionInstance && userId && answer) {
            await peerConnectionInstance.processAnswer({ answer });
            const stream = peerConnectionInstance.getRemoteStream();
            if (userId !== socketId) {
                const newUserData = { userId, stream, isAudioMuted: true, isVideoMuted: true };
                setRemoteStreams(prev => ([ ...prev, newUserData ]));
            }
        }
    };

    const onIceCandidate = async ({ userId, candidate }: IOnICECandidateData) => {
        emit('many2many:onIceCandidate', { userId, candidate });
    };

    const onLocalStreamAvailable = async (stream: IMediaStream) => {
        setLocalUserData(prev => ({ ...prev, stream }));

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
            emit('many2many:userConnected');
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

    const handleToggleCapability = (data: { userId: string; toggleValue: boolean, kind: string }) => {
        const isLocalUser = data.userId === socketId;
        const key = data.kind === 'Audio' ? 'getAudioTracks' : 'getVideoTracks';
        if (isLocalUser) {
            setLocalUserData(prev => {
                const stream = prev.stream;
                if (stream) {
                    stream[key]().forEach(track => {
                        track.enabled = data.toggleValue;
                    });
                    return {
                        ...prev,
                        [`is${data.kind}Muted`]: data.toggleValue,
                    };
                }
                return prev;
            })
        } else {
            setRemoteStreams(prev => {
                return prev.map(remoteUserData => {
                    if (remoteUserData.userId === data.userId) {
                        const stream = remoteUserData.stream;
                        if (stream) {
                            stream[key]().forEach(track => {
                                track.enabled = data.toggleValue;
                            });
                            return {
                                ...remoteUserData,
                                [`is${data.kind}Muted`]: data.toggleValue,
                            };
                        }
                    }
                    return remoteUserData;
                });
            })
        }
    }

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

    return (
        <>
            Video Chat Room
            <ChooseDevices
                onChooseMediaDevice={handleSetMediaDevice}
            />
            {(currentDevices.video && currentDevices.audio) && (
                <ChooseMediaConstrains
                    currentAudioDevice={currentDevices.audio}
                    currentVideoDevice={currentDevices.video}
                    onChangeMediaConstrains={handleChooseMediaConstrains}
                />
            )}
            <Video
                userId={socketId}
                stream={localUserData?.stream}
                isAudioMuted={localUserData?.isAudioMuted}
                isVideoMuted={localUserData?.isVideoMuted}
                onToggleCapability={handleToggleCapability}
                muted
            />
            {remoteStreams?.map((remoteData: IRemoteData) => (
                <Video
                    key={remoteData.userId}
                    stream={remoteData.stream}
                    userId={remoteData.userId}
                    isAudioMuted={remoteData.isAudioMuted}
                    isVideoMuted={remoteData.isVideoMuted}
                    onToggleCapability={handleToggleCapability}
                />
            ))}
        </>
    );
};

export default React.memo(OneToOneChatContainer);