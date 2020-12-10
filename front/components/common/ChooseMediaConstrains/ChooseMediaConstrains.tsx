import React, {useEffect, useState} from 'react';

import { IChooseMediaConstrainsProps } from "../../../interfaces";

import { getMediaDevicesResolution, getMediaStreamWithConstrain, stopMediaStream } from "../../../utils/media/getMedia";


const ChooseMediaConstrains = ({ onChangeMediaConstrains, currentAudioDevice, currentVideoDevice }: IChooseMediaConstrainsProps) => {
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
            }, 1000);
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
};

export default React.memo(ChooseMediaConstrains);