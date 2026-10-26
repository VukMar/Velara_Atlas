import {entry} from './entry-voice.mjs';
import fallback from '../../public/assets/nexus/nexus-fallback-message.mp3';

// URL imports only: no media request until an eligible, audio-enabled speech event.
export const voiceURLs=Object.freeze({entry,fallback});
