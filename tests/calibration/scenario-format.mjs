/** Validate the deliberately reduced local format; never repair authored facts. */
export function validateCalibrationScenario(source) {
  const fail=(ok,path)=>{if(!ok)throw new TypeError(`Invalid calibration scenario: ${path}`);};
  const object=(v,keys,path)=>{
    fail(v!==null&&typeof v==='object'&&!Array.isArray(v),path+' must be an object');
    fail(Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k)),path+' has missing or unsupported fields');
  };
  const text=v=>typeof v==='string'&&v.length>0;
  const year=v=>Number.isInteger(v)&&v>=0;
  const xyz=(v,path,positive=false)=>{
    object(v,['x','y','z'],path);
    fail(Object.values(v).every(n=>Number.isFinite(n)&&(!positive||n>0)),path+' must contain finite '+(positive?'positive ':'')+'XYZ');
  };
  const history=(records,field,path,reference)=>{
    fail(Array.isArray(records),path+' must be an array');
    let end=0;
    for(const r of records) {
      object(r,['fromAE','untilAE',field],path);
      fail(year(r.fromAE)&&(r.untilAE===null||year(r.untilAE)&&r.untilAE>r.fromAE)&&r.fromAE>=end,path+' has invalid or overlapping intervals');
      fail(text(r[field])&&(!reference||reference.has(r[field])),path+' has an invalid '+field);
      end=r.untilAE===null?Infinity:r.untilAE;
    }
  };
  const empty=(v,path)=>fail(Array.isArray(v)&&v.length===0,path+' must remain empty in this local format');
  object(source,['format','version','radiiLY','defaultRadiusLY','preview','dataset'],'scenario');
  fail(source.format==='velara-cantum-calibration'&&source.version===1,'unsupported format/version');
  fail(Array.isArray(source.radiiLY)&&source.radiiLY.length>0&&source.radiiLY.every(r=>Number.isFinite(r)&&r>0)&&new Set(source.radiiLY).size===source.radiiLY.length,'radiiLY must contain unique positive numbers');
  fail(source.radiiLY.includes(source.defaultRadiusLY),'defaultRadiusLY must be a supported radius');
  object(source.preview,['maxYearAE'],'preview');
  const d=source.dataset;
  object(d,['sector','cantums','connections','presentation'],'dataset');
  object(d.sector,['schemaVersion','timeline','map','systems','zones'],'sector');
  fail(d.sector.schemaVersion==='1.2.0','sector.schemaVersion');
  object(d.sector.timeline,['startAE','defaultAE'],'timeline');
  const {startAE,defaultAE}=d.sector.timeline;
  fail(year(startAE)&&year(defaultAE)&&defaultAE>=startAE&&year(source.preview.maxYearAE)&&source.preview.maxYearAE>=defaultAE,'timeline/preview year range');
  object(d.sector.map,['origin','size','unit','planeY'],'map');
  xyz(d.sector.map.origin,'map.origin');xyz(d.sector.map.size,'map.size',true);
  fail(d.sector.map.unit==='ly'&&Number.isFinite(d.sector.map.planeY),'map units/planeY');
  empty(d.sector.zones,'sector.zones');object(d.connections,['connections'],'connections');empty(d.connections.connections,'connections.connections');
  object(d.cantums,['cantums'],'cantums');
  fail(Array.isArray(d.cantums.cantums)&&d.cantums.cantums.length>0,'cantums.cantums');
  const ids=new Set(),cantumIds=new Set();
  const identity=(record,prefix)=>{fail(typeof record.id==='string'&&new RegExp('^'+prefix+'_[0-9]{4,}$').test(record.id)&&!ids.has(record.id),'invalid or duplicate ID');ids.add(record.id);};
  for(const c of d.cantums.cantums) {
    object(c,['id','entityType','sigil','nameHistory','statusHistory','controlHistory','infoCard'],'cantum');identity(c,'can');cantumIds.add(c.id);
    fail(c.entityType==='cantum'&&(c.sigil===null||typeof c.sigil==='string'&&/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(c.sigil)),'cantum type/sigil');
    history(c.nameHistory,'name','cantum.nameHistory');history(c.statusHistory,'status','cantum.statusHistory');empty(c.controlHistory,'cantum.controlHistory');object(c.infoCard,[],'cantum.infoCard');
  }
  fail(Array.isArray(d.sector.systems)&&d.sector.systems.length>0,'sector.systems');
  for(const s of d.sector.systems) {
    object(s,['id','entityType','discoveredAE','colonizedAE','publicDetailPath','positionLY','nameHistory','cantumHistory','statusHistory','controlHistory','infoCard'],'system');identity(s,'sys');
    fail(s.entityType==='star_system'&&year(s.discoveredAE)&&s.colonizedAE===null&&s.publicDetailPath===null,'system type/dates/detail');
    xyz(s.positionLY,'system.positionLY');
    fail(['x','y','z'].every(k=>Math.abs(s.positionLY[k]-d.sector.map.origin[k])<=d.sector.map.size[k]/2),'system outside map bounds');
    history(s.nameHistory,'name','system.nameHistory');history(s.cantumHistory,'cantumId','system.cantumHistory',cantumIds);
    empty(s.statusHistory,'system.statusHistory');empty(s.controlHistory,'system.controlHistory');object(s.infoCard,[],'system.infoCard');
  }
  object(d.presentation,['territoryOverlay'],'presentation');const p=d.presentation.territoryOverlay;
  object(p,['enabledByDefault','fieldThresholdStart','fieldThresholdEnd','opacityMaxPerCantum','opacityCapTotal','cantums'],'territoryOverlay');
  fail(typeof p.enabledByDefault==='boolean'&&Number.isFinite(p.fieldThresholdStart)&&p.fieldThresholdStart>=0&&Number.isFinite(p.fieldThresholdEnd)&&p.fieldThresholdEnd>p.fieldThresholdStart,'overlay enable/thresholds');
  fail([p.opacityMaxPerCantum,p.opacityCapTotal].every(n=>Number.isFinite(n)&&n>=0&&n<=1)&&p.opacityCapTotal>=p.opacityMaxPerCantum,'overlay opacity');
  object(p.cantums,[...cantumIds],'territoryOverlay.cantums');
  for(const style of Object.values(p.cantums)){object(style,['color'],'Cantum style');fail(typeof style.color==='string'&&/^#[0-9a-f]{6}$/i.test(style.color),'Cantum color');}
  return source;
}

export function calibrationDatasetFromScenario(source,radius=source?.defaultRadiusLY) {
  validateCalibrationScenario(source);
  if(!source.radiiLY.includes(radius))throw new RangeError(`Choose a calibration radius: ${source.radiiLY.join(', ')} ly`);
  const {sector,cantums,connections,presentation}=structuredClone(source.dataset);
  for(const style of Object.values(presentation.territoryOverlay.cantums))style.radiusLY=radius;
  return {sector,cantums,connections,detailFiles:new Map(),presentation};
}
