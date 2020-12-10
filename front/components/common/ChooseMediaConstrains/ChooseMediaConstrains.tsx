import React, { useEffect, useState } from 'react';

import { IChooseMediaConstrainsProps } from "../../../interfaces";

import { getMediaDevicesResolution, getMediaStreamWithConstrain, stopMediaStream } from "../../../utils/media/getMedia";


const ChooseMediaConstrains = ({ onChangeMediaConstrains, currentAudioDevice, currentVideoDevice }: IChooseMediaConstrainsProps) => {
    const [availableResolutions, setAvailableResolutions] = useState<any>([]);

    useEffect(() => {
        (async () => {
            const deviceResolutions = getMediaDevicesResolution(currentAudioDevice, currentVideoDevice);

            const devicePromises = deviceResolutions.map(async (resolution: any) => {
                try {
                    const stream = await getMediaStreamWithConstrain({
                        video: resolution.video,
                        audio: resolution.audio
                    });

                    if (stream) {
                        stopMediaStream(stream);
                        return resolution;
                    }
                } catch (e) {
                    console.log(e.name)
                }
            });
            const result = await Promise.all(devicePromises);

            setAvailableResolutions(result.filter(u => Boolean(u)));
        })();
    }, [currentAudioDevice, currentVideoDevice]);

    const handleChooseResolution = (resolution: any) => {
        onChangeMediaConstrains({
            video: resolution.video,
            audio: resolution.audio
        });
    }

    return (
        <div>
            <p>
                Choose Media Constrains
            </p>
            <ul>
                {availableResolutions && availableResolutions.map((resolution: any, i: number) => {
                    if (resolution) {
                        return (
                            <li key={`${resolution.label}_${i}`} onClick={() => handleChooseResolution(resolution)}>{resolution.label}</li>
                        )
                    }
                })}
            </ul>
        </div>
    );
};

export default React.memo(ChooseMediaConstrains);