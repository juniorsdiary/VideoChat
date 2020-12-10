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
    audio: IStreamMediaDevice;
    video: IStreamMediaDevice;
}

export type IStreamMediaDevice = MediaDeviceInfo | null | undefined

export interface IMediaConstrains {

}

export type IMediaStream = MediaStream | null | undefined;