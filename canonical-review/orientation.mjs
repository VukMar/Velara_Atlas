import assert from 'node:assert/strict';

export const orientationStatus='RECONCILED_D130';
export const orientationPolicy={status:orientationStatus,authority:'D-130; Worldbuilding PR #43 merged at 0ef93d16d70ce9633451acd8612c8e5ac39c11b1',transform:{x:'mapper_x - 32.5',y:'unchanged approved VELARA-Y-v1 elevation',z:'32.5 - mapper_y'},sourceArtifactApproved:true,reconciliation:'Authoritative v1.1 tuples directly reimported. No Atlas-only sign correction remains. Publication approval remains separate.',crosswalk:'Permanent ID assignments and ordering preserved; coordinate/provenance references synchronized to authoritative v1.1.'};

function parts(value){assert.match(String(value),/^-?\d+(?:\.\d+)?$/);const s=String(value);return {places:s.split('.')[1]?.length??0,integer:BigInt(s.replace('.',''))};}
function format(integer,places){const negative=integer<0n;let digits=(negative?-integer:integer).toString().padStart(places+1,'0');if(places)digits=digits.slice(0,-places)+'.'+digits.slice(-places);digits=digits.replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'');return (negative?'-':'')+digits;}
export function decimalDifference(left,right){const a=parts(left),b=parts(right),places=Math.max(a.places,b.places);return format(a.integer*10n**BigInt(places-a.places)-b.integer*10n**BigInt(places-b.places),places);}
export function negateDecimal(value){parts(value);return Number(value)===0?String(value).replace(/^-/,''):String(value).startsWith('-')?String(value).slice(1):'-'+value;}
export function correctedXYZText(record){
 const [x,y,z]=record.xyzText;
 assert.equal(decimalDifference(x,'0'),decimalDifference(record.mapperXY[0],'32.5'),'Source X must still match original Mapper x');
 assert.equal(decimalDifference(z,'0'),decimalDifference('32.5',record.mapperXY[1]),'Authoritative D-130 orientation required; never flip Z again');
 const corrected=[x,y,z];
 assert.equal(decimalDifference(corrected[2],'0'),decimalDifference('32.5',record.mapperXY[1]));
 return corrected;
}
