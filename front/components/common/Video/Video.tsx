import React, { useEffect, useRef, memo } from 'react';
import { IMediaStream } from "../../../interfaces/media.interface";

interface VideoProps {
    stream?: IMediaStream,
    muted?: boolean
    userId?: string
}

const Video = ({ stream, muted }: VideoProps) => {
    const video = useRef<HTMLVideoElement | null>(null);
    useEffect(() => {
        if (stream) {
            if (video.current) {
                video.current.srcObject = stream;
            }
        }
    }, [stream]);

    return (
        <div>
            <video
                style={{ width: '700px' }}
                ref={video}
                muted={muted}
                autoPlay
                playsInline
            />
        </div>
    );
};

export default memo(Video);
