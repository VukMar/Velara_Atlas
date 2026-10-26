import source from '../../public/content/nexus/fallback-data.json';
import {validateFallbackData} from './nexus-fallback-config.mjs';
export const fallbackData=validateFallbackData(source);
export {openingData,archivalPortraitURL,insigniaURL} from './opening-content.mjs';
