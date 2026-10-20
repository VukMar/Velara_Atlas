/** NONCANONICAL, memory-only calibration; never imported by the public viewer. */
export const CALIBRATION_RADII=Object.freeze([2,2.5,3]);
const period=(fromAE,fields,untilAE=null)=>({fromAE,untilAE,...fields});

export function calibrationDataset(radius=2.5) {
  if(!CALIBRATION_RADII.includes(radius))throw new RangeError('Choose a calibration radius: 2, 2.5 or 3 ly');
  const a='can_9101',b='can_9102',systems=[];
  const add=(id,name,x,y,z,cantumId,discoveredAE)=>{
    systems.push({id,entityType:'star_system',discoveredAE,colonizedAE:null,publicDetailPath:null,positionLY:{x,y,z},
      nameHistory:[period(discoveredAE,{name})],cantumHistory:cantumId?[period(discoveredAE,{cantumId})]:[],
      statusHistory:[],controlHistory:[],infoCard:{}});
  };
  for(let i=0;i<6;i++)add(`sys_91${String(i+1).padStart(2,'0')}`,`TEST A${i+1}`,-12+(i%3)*3,.3+(i%3)*.15,-3+Math.floor(i/3)*3,a,i===0?200:300);
  add('sys_9110','TEST A Outpost',10,-1.4,-9,a,800);
  systems.at(-1).cantumHistory=[period(800,{cantumId:a},1300),period(1300,{cantumId:b})];
  for(let i=0;i<6;i++)add(`sys_92${String(i+1).padStart(2,'0')}`,`TEST B${i+1}`,5+(i%3)*3,-.6+(i%3)*.15,7+Math.floor(i/3)*3,b,700);
  add('sys_9301','TEST Unassociated (inside overlay)',-9,1,3,null,200);
  add('sys_9302','TEST Unassociated (outside overlay)',14,.4,0,null,200);
  const cantum=(id,name,sigil,start)=>({id,entityType:'cantum',sigil,
    nameHistory:[period(start,{name})],statusHistory:[period(start,{status:'demonstration'})],controlHistory:[],infoCard:{}});
  return {
    sector:{schemaVersion:'1.2.0',timeline:{startAE:100,defaultAE:1200},
      map:{origin:{x:0,y:0,z:0},size:{x:40,y:12,z:40},unit:'ly',planeY:0},systems,zones:[]},
    cantums:{cantums:[cantum(a,'TEST CALIBRATION A','test-cantum-a',200),cantum(b,'TEST CALIBRATION B',null,700)]},
    connections:{connections:[]},detailFiles:new Map(),
    presentation:{territoryOverlay:{enabledByDefault:true,fieldThresholdStart:.35,fieldThresholdEnd:.65,opacityMaxPerCantum:.16,opacityCapTotal:.22,
      cantums:{[a]:{color:'#638FBD',radiusLY:radius},[b]:{color:'#C99160',radiusLY:radius}}}}
  };
}
