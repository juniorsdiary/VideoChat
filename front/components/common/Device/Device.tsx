import React, {useCallback} from 'react';

interface IDeviceProps {
    device: MediaDeviceInfo;
    onChooseDevice: (devices: { [key: string]: string }) => void;
    kind: string;
}

const Device = ({ kind, device, onChooseDevice}: IDeviceProps) => {
    const handleChooseDevice = useCallback(() => {
        onChooseDevice({ [kind]: device.deviceId });
    }, [onChooseDevice]);

    return (
        <div onClick={handleChooseDevice}>
            {device.label}
        </div>
    );
};

export default React.memo(Device);