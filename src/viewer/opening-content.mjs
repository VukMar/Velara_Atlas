import source from '../../public/content/nexus/opening-data.json';
import archivalPortraitURL from '../../public/assets/nexus/nexus-form.png';
import insigniaURL from '../../public/assets/nexus/mcr-insignia.png';
import {validateOpeningData} from './nexus-opening-config.mjs';
export const openingData=validateOpeningData(source);
export {archivalPortraitURL,insigniaURL};
