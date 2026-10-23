import source from '../../public/content/nexus/fallback-data.json';
import archivalPortraitURL from '../../public/assets/nexus/nexus-form.png';
import {validateFallbackData} from './nexus-fallback-config.mjs';

export const fallbackData=validateFallbackData(source);
export {archivalPortraitURL};
