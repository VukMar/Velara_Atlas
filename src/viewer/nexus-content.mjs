import source from '../../public/content/nexus/fallback-data.json';
import openingSource from '../../public/content/nexus/opening-data.json';
import archivalPortraitURL from '../../public/assets/nexus/nexus-form.png';
import insigniaURL from '../../public/assets/nexus/mcr-insignia.png';
import {validateFallbackData} from './nexus-fallback-config.mjs';
import {validateOpeningData} from './nexus-opening-config.mjs';

export const fallbackData=validateFallbackData(source);
export const openingData=validateOpeningData(openingSource);
export {archivalPortraitURL,insigniaURL};
