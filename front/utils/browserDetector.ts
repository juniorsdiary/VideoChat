import { detect } from 'detect-browser';

const browserName = detect()?.name;

export const isSafari = (): boolean => browserName === 'safari';
export const isFirefox = (): boolean => browserName === 'firefox';