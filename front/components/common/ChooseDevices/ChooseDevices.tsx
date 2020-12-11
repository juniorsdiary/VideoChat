import React, { useState, useEffect } from 'react';
import { getMediaDevices } from '../../../utils/media/getMedia';

import { Device } from '../Device';

interface IChooseMediaDeviceProps {
    onChooseMediaDevice: (devices: { [key: string]: string }) => void;
}

const ChooseDevices = ({ onChooseMediaDevice }: IChooseMediaDeviceProps): JSX.Element => {
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        (async () => {
            const devices = await getMediaDevices();
            setAudioDevices(devices.audio);
            setVideoDevices(devices.video);
        })();
    }, []);

    return (
        <div >
            Choose Devices
            Audio
            {audioDevices.map((device: MediaDeviceInfo) => (
                <Device
                    key={device.deviceId}
                    kind="audio"
                    device={device}
                    onChooseDevice={onChooseMediaDevice}
                />
            ))}
            Video
            {videoDevices.map((device: MediaDeviceInfo) => (
                <Device
                    key={device.deviceId}
                    kind="video"
                    device={device}
                    onChooseDevice={onChooseMediaDevice}
                />
            ))}
        </div>
    );
};

export default React.memo(ChooseDevices);