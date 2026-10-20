import * as THREE from 'three';

/** Same restraint as the flat display, including any number of shell intersections. */
export function compositeInfluence(samples, cap=.22) {
  const total=samples.reduce((n,s)=>n+s.alpha,0);
  return {alpha:Math.min(Math.max(0,Math.min(.22,cap)),total),rgb:[0,1,2].map(i=>total?samples.reduce((n,s)=>n+s.rgb[i]*s.alpha,0)/total:0)};
}

/** Geometry-only accumulation, followed by one capped transparent chart layer. */
export class InfluenceCompositor {
  constructor(data,presentation) {
    this.data=data;this.scene=new THREE.Scene();this.disposed=false;
    const settings=presentation?.territoryOverlay ?? {};
    this.cap=Math.max(0,Math.min(.22,settings.opacityCapTotal ?? .22));
    const alpha=Math.max(0,Math.min(.16,settings.opacityMaxPerCantum ?? .16))/2;
    this.meshes=data.map(d=>{
      const geometry=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(d.positions,3))
        .setAttribute('weight',new THREE.Float32BufferAttribute(d.weights,1));
      const material=new THREE.ShaderMaterial({uniforms:{tint:{value:new THREE.Color(d.color)},alpha:{value:alpha}},
        vertexShader:'attribute float weight; varying float vWeight; void main(){vWeight=weight;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader:'uniform vec3 tint; uniform float alpha; varying float vWeight; void main(){float a=alpha*vWeight;gl_FragColor=vec4(tint*a,a);}',
        transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,
        blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,blendEquation:THREE.AddEquation});
      const mesh=new THREE.Mesh(geometry,material);mesh.userData={layer:'territoryEnvelope',cantumId:d.id};
      mesh.raycast=()=>{};this.scene.add(mesh);return mesh;
    });
    this.target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:false,stencilBuffer:false});
    const material=new THREE.ShaderMaterial({uniforms:{accumulation:{value:this.target.texture},cap:{value:this.cap}},
      vertexShader:'varying vec2 vUV; void main(){vUV=position.xy*.5+.5;gl_Position=vec4(position.xy,0.0,1.0);}',
      fragmentShader:`uniform sampler2D accumulation; uniform float cap; varying vec2 vUV;
        void main(){vec4 s=texture2D(accumulation,vUV);gl_FragColor=vec4(s.rgb/max(s.a,0.00001),min(s.a,cap));
        #include <colorspace_fragment>
        }`,transparent:true,depthTest:false,depthWrite:false});
    const geometry=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3));
    this.display=new THREE.Mesh(geometry,material);this.display.frustumCulled=false;this.display.renderOrder=1;
    this.display.userData.layer='territory';this.display.raycast=()=>{};this.display.visible=false;
    this.size=new THREE.Vector2();this.clearColor=new THREE.Color();
  }

  render(renderer,camera) {
    if(!this.display.visible||this.disposed)return;
    renderer.getDrawingBufferSize(this.size);
    if(this.target.width!==this.size.x||this.target.height!==this.size.y)this.target.setSize(this.size.x,this.size.y);
    const target=renderer.getRenderTarget(),alpha=renderer.getClearAlpha();renderer.getClearColor(this.clearColor);
    try {
      renderer.setRenderTarget(this.target);renderer.setClearColor(0,0);renderer.clear();renderer.render(this.scene,camera);
    } finally {renderer.setRenderTarget(target);renderer.setClearColor(this.clearColor,alpha);}
  }

  dispose() {
    if(this.disposed)return;
    this.disposed=true;
    for(const m of this.meshes){m.geometry.dispose();m.material.dispose();}
    this.scene.clear();this.target.dispose();
    // The main scene owns display geometry/material and disposes them once.
  }
}
