import React, { useEffect, useRef, memo } from 'react';
import { IMediaStream } from "../../../interfaces/media.interface";
import { AiOutlineAudioMuted, AiOutlineAudio } from 'react-icons/ai';
import { BiVideoOff } from 'react-icons/bi';
import { BsCameraVideo } from 'react-icons/bs';

interface VideoProps {
    stream?: IMediaStream,
    muted?: boolean
    isAudioMuted: boolean
    isVideoMuted: boolean
    userId: string;
    onToggleCapability: (data: { userId: string; toggleValue: boolean, kind: string }) => void;
}

const Video = ({ userId, stream, muted, onToggleCapability, isAudioMuted, isVideoMuted }: VideoProps) => {
    const video = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (stream) {
            if (video.current) {
                video.current.srcObject = stream;
            }
        }
    }, [stream]);

    const handleMuteVideo = () => {
        if (onToggleCapability) onToggleCapability({ userId, toggleValue: !isVideoMuted, kind: 'Video' });
    };

    const handleToggleAudio = () => {
        if (onToggleCapability) onToggleCapability({ userId, toggleValue: !isAudioMuted, kind: 'Audio' });
    };

    return (
        <div>
            {!isAudioMuted
                ? <AiOutlineAudioMuted onClick={handleToggleAudio} />
                : <AiOutlineAudio onClick={handleToggleAudio} />
            }
            {!isVideoMuted
                ? <BiVideoOff onClick={handleMuteVideo} />
                : <BsCameraVideo onClick={handleMuteVideo} />
            }
            <video
                style={{ maxWidth: '100%', width: '700px' }}
                ref={video}
                muted={muted}
                autoPlay
                playsInline
            />
        </div>
    );
};

export default memo(Video);
