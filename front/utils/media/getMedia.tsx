import { isSafari } from '../browserDetector';
import {
    IMediaDevicesIdInput,
    IMediaStream,
    IGetMediaArguments,
    IMediaDevices,
    IConstrains,
    IStreamMediaDevices,
    IStreamMediaDevice
} from '../../interfaces/media.interface';

import { MEDIA_DEVICES_RESOLUTIONS } from '../../const/mediaDevicesResolutions';

export const getMediaDevicesResolution = (audioDevice: IStreamMediaDevice, videoDevice: IStreamMediaDevice) => {
    return MEDIA_DEVICES_RESOLUTIONS.map(constrain => {
        return {
            label: constrain.label,
            video: {
                aspectRatio: constrain.ratio,
                deviceId: videoDevice?.deviceId || true,
                height: { exact: constrain.height }
            },
            audio: {
                deviceId: audioDevice?.deviceId || true
            },
        }
    });
}

export const getMediaStream = async ({ audio, video }: IGetMediaArguments): Promise<IMediaStream> => {
    const devices: IMediaDevices = await getMediaDevices();

    const selectedAudioDevice: MediaDeviceInfo = audio
        ? devices.audio.find(device => device.deviceId === audio)!
        : devices.audio[0];

    const selectedVideoDevice: MediaDeviceInfo = video
        ? devices.video.find(device => device.deviceId === video)!
        : devices.video[0];

    const constrains = getMediaDevicesConstraints({
        audio: selectedAudioDevice?.deviceId,
        video: selectedVideoDevice?.deviceId
    });

    let stream: IMediaStream = null;

    for (let i = 0; i < constrains.length; i++) {
        console.log('Try to use constrains');
        console.log(constrains[i]);

        stream = await navigator.mediaDevices.getUserMedia(constrains[i]);

        if (stream) break;
    }

    return stream;
}

export const getMediaStreamWithConstrain = async (constrain: any): Promise<MediaStream> => {
    return await navigator.mediaDevices.getUserMedia(constrain);
}

export const getMediaDevices = async (): Promise<IMediaDevices> => {
    const audio: MediaDeviceInfo[] = [];
    const video: MediaDeviceInfo[] = [];
    const devices = await navigator.mediaDevices.enumerateDevices();
    const filteredDevices = devices.filter(divice => divice.deviceId !== 'default');

    filteredDevices.forEach((device) => {
        if (device.kind === 'audioinput' && !audio.find((d) => d.deviceId === device.deviceId)) audio.push(device);
        if (device.kind === 'videoinput' && !video.find((d) => d.deviceId === device.deviceId)) video.push(device);
    });

    return {
        audio,
        video
    };
};

export const getMediaDevicesConstraints = ({ audio, video }: IMediaDevicesIdInput): IConstrains => {
    const supportedConstrains = navigator.mediaDevices.getSupportedConstraints();
    console.log('supportedConstrains');
    console.log(supportedConstrains);

    const constraints = [
        {
            video: {
                aspectRatio: 16 / 9,
                deviceId: video,
                height: { exact: 120 },
            },
            audio: { deviceId: audio },
        },
        {
            video: {
                aspectRatio: 16 / 9,
                deviceId: video,
                height: { exact: 120 },
            },
            audio: { deviceId: audio },
        },
        {
            video: true,
            audio: true,
        },
    ];

    return isSafari() ? constraints.slice(1) : constraints;
};

export const stopMediaStream = (stream: IMediaStream): void => {
    if (stream) {
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();

        if (audioTracks?.length) {
            audioTracks.forEach(track => track.stop())
        }

        if (videoTracks?.length) {
            videoTracks.forEach(track => track.stop())
        }
    }
    return;
}

export const getCurrentDevicesFromStream = async (stream: IMediaStream): Promise<IStreamMediaDevices> => {
    const devices = await getMediaDevices();

    if (stream) {
        const devicesIds: IStreamMediaDevices = { audio: null, video: null };
        try {
            const track = stream.getAudioTracks()[0];
            const { deviceId } = track.getSettings();
            if (deviceId) {
                devicesIds.audio = devices.audio.find(device => device.deviceId === deviceId);
            }

        } catch (e) {
            console.error('Cant get settings from audioStream');
        }
        try {
            const track = stream.getVideoTracks()[0];
            const { deviceId } = track.getSettings();
            if (deviceId) {
                devicesIds.video = devices.video.find(device => device.deviceId === deviceId);
            }
        } catch (e) {
            console.error('Cant get settings from videoStream');
        }
        return devicesIds;
    }

    return {
        audio: null,
        video: null,
    }
}
