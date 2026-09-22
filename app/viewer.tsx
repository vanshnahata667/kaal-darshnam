"use client";
import {useEffect,useRef,useState} from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RotateCcw,ZoomIn,ZoomOut} from "lucide-react";

export default function Viewer({monument,modelURL,intact,stage,rotating,onSelect}:{monument:string;modelURL?:string;intact:boolean;stage:number;rotating:boolean;onSelect:(name:string)=>void}){
 const host=useRef<HTMLDivElement>(null),controlsRef=useRef<OrbitControls|null>(null),rotation=useRef(rotating); const [error,setError]=useState(false);
 useEffect(()=>{rotation.current=rotating},[rotating]);
 useEffect(()=>{
  if(!host.current)return;setError(false); const el=host.current; let renderer:THREE.WebGLRenderer;let disposed=false;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true})}catch{queueMicrotask(()=>{if(!disposed)setError(true)});return}
  const scene=new THREE.Scene();scene.background=new THREE.Color("#e7eae6");scene.fog=new THREE.Fog("#e7eae6",45,95);
  const camera=new THREE.PerspectiveCamera(38,el.clientWidth/el.clientHeight,.1,150);camera.position.set(16,12,18);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-label","Interactive schematic temple reconstruction");
  const controls=new OrbitControls(camera,renderer.domElement);controlsRef.current=controls;controls.target.set(0,3,0);controls.enableDamping=true;controls.minDistance=12;controls.maxDistance=55;controls.maxPolarAngle=Math.PI/2.1;controls.autoRotateSpeed=.8;
  scene.add(new THREE.HemisphereLight(0xffffff,0x7b8477,2.5));const sun=new THREE.DirectionalLight(0xfff8e6,3.5);sun.position.set(-14,25,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22});scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xdfe4dd,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;scene.add(ground);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
  sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;
  const textureCanvas=document.createElement('canvas');textureCanvas.width=256;textureCanvas.height=256;
  const context=textureCanvas.getContext('2d')!;const pixels=context.createImageData(256,256);
  let seed=42;for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const value=165+(seed%65);pixels.data.set([value,value,value,255],i)}context.putImageData(pixels,0,0);
  const texture=new THREE.CanvasTexture(textureCanvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,3);
  const stone=new THREE.MeshStandardMaterial({color:monument==='nalanda'?0xb07860:0xbfb4a0,roughness:.86,bumpMap:texture,bumpScale:.045}), edge=new THREE.MeshStandardMaterial({color:0x938a79,roughness:.95,bumpMap:texture,bumpScale:.035}), inferred=new THREE.MeshStandardMaterial({color:0x94ac9d,roughness:.9}), speculative=new THREE.MeshStandardMaterial({color:0x8d9dab,roughness:.8});
  const parts:THREE.Mesh[]=[];
  function box(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material=stone,name="Pillared hall"){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.feature=name;scene.add(mesh);parts.push(mesh);return mesh}
  function cylinder(x:number,y:number,z:number,r:number,h:number,mat:THREE.Material=stone,name="Pillared hall"){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.feature=name;scene.add(mesh);parts.push(mesh);return mesh}
  const full=intact || stage===0;
  if(modelURL){new GLTFLoader().load(modelURL,gltf=>{if(disposed)return;const bounds=new THREE.Box3().setFromObject(gltf.scene),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());const scale=14/Math.max(size.x,size.y,size.z);gltf.scene.position.copy(center).multiplyScalar(-scale);gltf.scene.position.y-=bounds.min.y*scale-center.y*scale;gltf.scene.scale.setScalar(scale);gltf.scene.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=true;object.receiveShadow=true;object.userData.feature='Uploaded model';parts.push(object)}});scene.add(gltf.scene)},undefined,()=>{if(!disposed)setError(true)})}
  else if(monument==="hampi"){
   for(let i=0;i<3;i++)box(0,.17+i*.27,-2,12-i*.4,.28,11-i*.4,edge);
   for(let x=-4;x<=4;x+=2)for(let z=-5;z<=1;z+=2){const height=!full&&stage>1&&x===4&&z===1?1.8:3.8;box(x,1,z,.9,.3,.9,edge);box(x,1.15+height/2,z,.48,height,.48);box(x,1.15+height,z,.85,.3,.85,edge);for(let k=0;k<3;k++)box(x,1.5+k*.9,z,.6,.12,.6,edge)}
   for(let x=-4;x<=4;x+=2)box(x,5.15,-2,.6,.4,7.8,stone);
   if(full||stage===1){box(0,5.5,-2,10.2,.35,8.3,inferred,"Hall roof");for(let i=0;i<3;i++)box(0,5.85+i*.32,-3,6.5-i*1.3,.32,4.6-i*.8,inferred,"Hall roof")}
   box(0,2.5,-6,4,3.5,2.6,stone,"Sanctuary");
   if(full)for(let i=0;i<6;i++)box(0,4.5+i*.48,-6,4.5-i*.57,.47,3.6-i*.43,speculative,"Upper tower");
   // The chariot is a simplified landmark, separate from the hall.
   box(0,.38,7,3.8,.7,3.6,edge,"Stone chariot");box(0,1.15,7,3,.8,2.8,stone,"Stone chariot");
   for(const x of [-1.25,1.25])for(const z of [6,8]){const wheel=cylinder(x,.9,z,.65,.25,edge,"Stone chariot");wheel.rotation.z=Math.PI/2}
   for(const x of [-.9,.9])for(const z of [6.15,7.85])box(x,2.25,z,.32,1.7,.32,stone,"Stone chariot");
   for(let i=0;i<3;i++)box(0,3.25+i*.27,7,2.9-i*.5,.28,2.9-i*.5,stone,"Stone chariot");
   if(full)for(let i=0;i<3;i++)box(0,4.05+i*.3,7,1.6-i*.4,.3,1.6-i*.4,speculative,"Upper tower");
   for(let i=0;i<5;i++)box(0,.1+i*.14,3.9-i*.28,2.6,.2,.42,edge);
  }else if(monument==='konark'){
   for(let i=0;i<4;i++)box(0,.2+i*.3,0,13-i*.45,.32,9-i*.45,edge,"Chariot platform");
   box(2,3,0,5.5,3.6,5.5,stone,"Assembly hall");
   for(let i=0;i<10;i++)box(2,5+i*.33,0,6-i*.46,.33,6-i*.46,stone,"Assembly hall");cylinder(2,8.45,0,.65,.4,edge,"Assembly hall");
   box(-3,1.7,0,4.5,1.1,4.5,stone,"Sanctuary");
   if(full||stage===1){for(let i=0;i<(full?18:7);i++)box(-3,2.5+i*.5,0,4.5-i*.18,.5,4.5-i*.18,speculative,"Upper tower");if(full)cylinder(-3,11.5,0,.8,.5,speculative,"Upper tower")}
   for(const z of [-4.4,4.4])for(let x=-5;x<=5;x+=2){const wheel=cylinder(x,.95,z,.85,.22,edge,"Chariot wheels");wheel.rotation.x=Math.PI/2;}
   for(let i=0;i<7;i++)box(6.5+i*.3,1.15-i*.15,0,.4,.25,2.5,edge,"Chariot platform");
    }else if(monument==='modhera'){
     for(let i=0;i<5;i++){const w=12-i*1.4,d=7-i*.8,y=.85-i*.15;box(0,y,2-d/2,w,.18,.45,edge,"Surya Kund");box(0,y,2+d/2,w,.18,.45,edge,"Surya Kund");box(-w/2,y,2,.45,.18,d,edge,"Surya Kund");box(w/2,y,2,.45,.18,d,edge,"Surya Kund")}box(0,.06,2,5,.1,2.8,stone,"Surya Kund");
     for(const x of [-5,5])for(const z of [-1,5]){box(x,1.1,z,.8,.5,.8,stone,"Kund pavilion");box(x,1.45,z,.55,.25,.55,edge,"Kund pavilion")}
     box(0,.55,-3,8,.65,4.5,edge,"Sabha Mandapa");
     for(let x=-3;x<=3;x+=2)for(const z of [-4.3,-1.7]){cylinder(x,2.25,z,.22,3,stone,"Carved pillar");box(x,.95,z,.7,.25,.7,edge,"Carved pillar");box(x,3.75,z,.8,.3,.8,stone,"Carved pillar");for(let y=1.4;y<3.5;y+=.55)cylinder(x,y,z,.29,.1,edge,"Carved pillar")}
     for(const z of [-4.3,-1.7])box(0,4,z,7.5,.3,.55,stone,"Mandapa beams");
     if(full)for(let i=0;i<4;i++)box(0,4.25+i*.25,-3,7.5-i*1.1,.25,4-i*.55,inferred,"Mandapa roof");
     box(0,2,-6,4.8,2.6,3.8,stone,"Sanctuary");
     if(full)for(let i=0;i<5;i++)box(0,3.5+i*.38,-6,4.2-i*.55,.35,3.2-i*.42,speculative,"Lost tower");
    }else if(monument==='nalanda'){
     for(let z=-4;z<=4;z+=2){box(-4,1,z,5.5,2.2,1.2,stone,"Residential monastery");box(4,1,z,5.5,2.2,1.2,stone,"Residential monastery");}
     for(let x=-2;x<=2;x+=2)box(x,.8,0,.5,1.6,.5,edge,"Monastery pillar");
     box(0,2.2,6,4.5,3.6,4.5,stone,"Temple mound");
   for(let i=0;i<(full?6:3);i++)box(0,4+i*.45,6,3.8-i*.55,.35,3.8-i*.55,speculative,"Temple superstructure");
    }else if(monument==='shanti-stupa'){
     cylinder(0,.5,0,5,.9,edge,"Stupa base");
     cylinder(0,2,0,3.8,2.2,stone,"Stupa drum");
     const dome=new THREE.Mesh(new THREE.SphereGeometry(3.9,24,12,0,Math.PI*2,0,Math.PI/2),stone);dome.position.set(0,3.1,0);dome.castShadow=true;dome.userData.feature='Stupa dome';scene.add(dome);parts.push(dome);
     box(0,6.4,0,.8,4.2,.8,inferred,"Harmika");
     for(let i=0;i<4;i++)box(0,8.6+i*.35,0,2.2-i*.35,.22,2.2-i*.35,speculative,"Chattravali");
  }
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let downX=0,downY=0;
  const down=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY};const click=(e:PointerEvent)=>{if(Math.hypot(e.clientX-downX,e.clientY-downY)>6)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(parts)[0];if(hit)onSelect(hit.object.userData.feature)};
  renderer.domElement.addEventListener("pointerdown",down);renderer.domElement.addEventListener("pointerup",click);
  const resize=new ResizeObserver(()=>{if(!el.clientWidth||!el.clientHeight)return;camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)});resize.observe(el);
  let frame=0;const draw=()=>{controls.autoRotate=rotation.current;controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(draw)};draw();
  return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();controls.dispose();controlsRef.current=null;renderer.domElement.removeEventListener("pointerdown",down);renderer.domElement.removeEventListener("pointerup",click);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}});texture.dispose();renderer.dispose();renderer.domElement.remove()};
 },[monument,modelURL,intact,stage,onSelect]);
 if(!modelURL&&!['hampi','konark','modhera','nalanda','shanti-stupa'].includes(monument))return <div className="viewer"><div className="empty"><h3>No 3D model added yet</h3><p>Add a self-contained GLB file in Manage places.</p></div></div>;
 return <><div className="viewer" ref={host}>{error&&<div className="empty"><h3>{modelURL?'This model could not be loaded':'3D is unavailable in this browser'}</h3><p>{modelURL?'Choose a valid, self-contained GLB file.':'Enable WebGL or explore the photographs and history tabs.'}</p></div>}</div><div className="viewer-tools"><button title="Zoom in" onClick={()=>{const c=controlsRef.current;if(c){c.object.position.sub(c.target).multiplyScalar(.85).add(c.target);c.update()}}}><ZoomIn size={18}/></button><button title="Zoom out" onClick={()=>{const c=controlsRef.current;if(c){c.object.position.sub(c.target).multiplyScalar(1.15).add(c.target);c.update()}}}><ZoomOut size={18}/></button><button title="Reset camera" onClick={()=>{const c=controlsRef.current;if(c){c.object.position.set(16,12,18);c.target.set(0,3,0);c.update()}}}><RotateCcw size={18}/></button></div></>;
}
