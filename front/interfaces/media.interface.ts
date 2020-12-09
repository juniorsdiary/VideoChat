export interface IGetMediaArguments {
    audio?: string;
    video?: string;
}

export interface IMediaDevices {
    audio: MediaDeviceInfo[];
    video: MediaDeviceInfo[];
}

export interface IMediaDevicesIdInput {
    audio: string;
    video: string;
}

export interface IConstrains {
    [key: string]: any
}

export interface IStreamMediaDevices {
    audio: MediaDeviceInfo | null | undefined;
    video: MediaDeviceInfo | null | undefined;
}

export type IMediaStream = MediaStream | null | undefined;