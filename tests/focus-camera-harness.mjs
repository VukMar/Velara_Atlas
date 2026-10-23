import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Vector3} from 'three';
import {CameraController} from '../src/viewer/camera-controller.mjs';

// Real OrbitControls numerical update, without browser input listeners. Browser
// callbacks cover the actual canvas input path separately.
class Controls extends OrbitControls {
  constructor(camera){super(camera);}
  dispose(){this.disposals=(this.disposals??0)+1;}
}
export const records=[
  {id:'star',entityType:'celestial_body',objectType:'star',physicalDiameterKm:600000},
  {id:'planet',entityType:'celestial_body',objectType:'planet',physicalDiameterKm:12000},
  {id:'small',entityType:'celestial_body',objectType:'asteroid',physicalDiameterKm:64},
  {id:'unknown',entityType:'celestial_body',objectType:'planet'},
  {id:'station',entityType:'station'},
  {id:'gate',entityType:'gate',objectType:'short_range_gate'},
  {id:'zone',entityType:'spatial_zone'}
].map((e,i)=>({...e,position:{x:12000+i*1000,y:600,z:-16000+i*500}}));
export function harness({Controller=CameraController,animated=true,mode='top'}={}) {
  let time=0,next=0;const pending=new Map(),all=[];
  const motion=new EventTarget();motion.matches=false;
  const clock={now:()=>time,request:fn=>{pending.set(++next,fn);all.push(fn);return next;},cancel:id=>pending.delete(id),motion};
  const canvas=new EventTarget(),m={renderer:{domElement:canvas,setSize(){}},container:{clientWidth:400,clientHeight:400,dataset:{}},
    map:{origin:{x:0,y:0,z:0},size:{x:100000,y:10000,z:100000},unit:'CNU'},positionKey:'position',
    entities:records,anchors:records.filter(e=>e.id!=='zone').map(entity=>({entity,position:new Vector3(...Object.values(entity.position))})),zoneGroups:[],mode};
  const c=new Controller(m,Controls,true,animated?clock:{motion:{matches:true,addEventListener(){},removeEventListener(){}}});m.cameraController=c;
  for(const method of ['reset','resize','setMode','positionPerspective','restoreView'])m[method]=(...args)=>c[method](...args);
  m.render=()=>{c.constrain();m.renders=(m.renders??0)+1;};
  m.zoneGroups=[{userData:{entity:records.at(-1),intersection:{witness:records.at(-1).position,
    min:{x:17000,y:400,z:-14000},max:{x:19000,y:800,z:-12000},chart:{min:{x:-50000,z:-50000},max:{x:50000,z:50000}}}}}];
  c.reset();if(mode==='perspective')c.setMode(mode);
  const step=t=>{time=t;const callbacks=[...pending.values()];pending.clear();for(const fn of callbacks)fn(t);};
  return {c,m,clock,motion,canvas,pending,all,step};
}
export function state({m}) {
  const camera=c=>({position:c.position.toArray(),quaternion:c.quaternion.toArray(),up:c.up.toArray(),zoom:c.zoom,
    near:c.near,far:c.far,projection:c.projectionMatrix.toArray(),...(c.isOrthographicCamera?{frustum:[c.left,c.right,c.top,c.bottom]}:{aspect:c.aspect})});
  return {mode:m.mode,camera:camera(m.camera),orthographic:camera(m.orthographic),perspective:camera(m.perspective),
    target:m.controls.target.toArray(),inspection:m.inspection??null,limits:Object.fromEntries(['enablePan','minZoom','maxZoom','minDistance','maxDistance'].map(k=>[k,m.controls[k]])),
    savedTop:m.savedTop?{position:m.savedTop.position.toArray(),target:m.savedTop.target.toArray(),zoom:m.savedTop.zoom}:null};
}
