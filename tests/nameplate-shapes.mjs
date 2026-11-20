// Synthetic, memory-only geometry. Never a dataset or public viewer input.
const line=(n,fn)=>Array.from({length:n},(_,i)=>fn(i));
export const nameplateShapeCases=()=>[
  {shape:'wide',points:line(9,i=>[-48+i*12,0]),radius:11},
  {shape:'tall-narrow',points:line(11,i=>[0,-55+i*11]),radius:6},
  {shape:'tall-with-shoulder',points:[...line(11,i=>[0,-55+i*11]),[-18,25],[18,25]],radius:9},
  {shape:'diagonal',points:line(9,i=>[-44+i*11,-44+i*11]),radius:9},
  {shape:'crescent',points:line(17,i=>{const a=(50+i*16)*Math.PI/180;return [36*Math.cos(a),45*Math.sin(a)];}),radius:9},
  {shape:'L-shaped',points:[...line(9,i=>[-32,-45+i*11]),...line(8,i=>[-21+i*11,43])],radius:10},
  {shape:'broad-lobe',points:[...line(27,i=>[-25,-60+i*4]),...line(10,i=>[-25+i*8,40])],radius:8},
  {shape:'disconnected',points:[[-58,0],[58,0]],radius:23},
  {shape:'tiny',points:[[0,0]],radius:4,sigil:true},
  {shape:'small-sigil',points:[[0,0]],radius:7,sigil:true},
  {shape:'dense',points:line(35,i=>[-36+i%7*12,-24+Math.floor(i/7)*12]),radius:11},
  {shape:'long-name',points:line(9,i=>[-48+i*12,0]),radius:11,name:'TEST COMPLETE UNABBREVIATED TERRITORIAL NAME '.repeat(5)},
  {shape:'unicode',points:line(9,i=>[-48+i*12,0]),radius:11,name:'試験領域 Ελληνικά e\u0301'}
].map(c=>({...c,map:{origin:{x:0,y:0,z:0},size:{x:200,y:40,z:200},unit:'ly',planeY:0},
  groups:[{id:'test',color:'#638FBD',radius:c.radius,points:c.points.map(([x,z],i)=>({id:`test_${i}`,x,z}))}],
  cantums:[{id:'test',name:c.name??'TEST REGION',statusRecord:{},sigil:c.sigil?'test-cantum-a':null}]}));
