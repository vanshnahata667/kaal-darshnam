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
  const camera=new THREE.PerspectiveCamera(38,el.clientWidth/el.clientHeight,.1,150);camera.position.set(20,15,24);
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
  else {
   const plaster=new THREE.MeshStandardMaterial({color:0xe7e4db,roughness:.82});
   const gold=new THREE.MeshStandardMaterial({color:0xa18a45,metalness:.55,roughness:.42});
   function ring(x:number,y:number,z:number,r:number,tube:number,mat:THREE.Material,name:string){
    const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,tube,8,48),mat);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.feature=name;scene.add(mesh);parts.push(mesh);return mesh;
   }
   function spire(x:number,y:number,z:number,r:number,h:number,mat:THREE.Material,name:string){
    const profile=Array.from({length:21},(_,i)=>{const t=i/20;return new THREE.Vector2(Math.max(.06,r*Math.pow(1-t,.72)),t*h)});
    const mesh=new THREE.Mesh(new THREE.LatheGeometry(profile,32),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.feature=name;scene.add(mesh);parts.push(mesh);
    for(let i=1;i<13;i++){const t=i/14;ring(x,y+t*h,z,r*Math.pow(1-t,.72),.035,edge,name)}
    cylinder(x,y+h,z,r*.35,.18,gold,name);cylinder(x,y+h+.3,z,.09,.5,gold,name);
   }
   if(monument==='konark'){
    for(let i=0;i<4;i++)box(0,.2+i*.28,0,14-i*.38,.3,9-i*.3,edge,"Chariot platform");
    box(2.4,3,0,5.2,3.5,5.2,stone,"Assembly hall");
    for(let i=0;i<12;i++)box(2.4,4.9+i*.28,0,6-i*.4,.27,6-i*.4,stone,"Assembly hall roof");
    cylinder(2.4,8.35,0,.65,.4,edge,"Assembly hall roof");
    for(const side of [-1,1])for(let i=0;i<7;i++){box(2.4,1.8+i*.4,side*2.66,5.4,.09,.2,edge,"Carved courses");for(let x=.3;x<5;x+=.7)box(x,2.8,side*2.7,.16,2.3,.18,edge,"Carved pilasters")}
    box(-3.4,1.6,0,4.6,.9,4.6,stone,"Sanctuary remains");
    if(full||stage===1)spire(-3.4,2,0,2.3,full?9:4,speculative,"Upper tower");
    for(const z of [-4.45,4.45])for(let i=0;i<12;i++){
     const x=-6.1+i*1.1,wheel=ring(x,.9,z,.47,.08,edge,"Chariot wheels");wheel.rotation.x=0;
     for(let s=0;s<8;s++){const spoke=box(x,.9,z,.05,.86,.065,stone,"Chariot wheel spokes");spoke.rotation.z=s*Math.PI/4}
     const hub=cylinder(x,.9,z,.13,.22,edge,"Chariot wheels");hub.rotation.x=Math.PI/2;
    }
    for(let i=0;i<8;i++)box(7+i*.25,1.1-i*.13,0,.3,.18,2.2,edge,"Entry stairs");
    for(const x of [-2,0,2])for(const z of [7,9]){box(x,.3,z,.8,.3,.8,edge,"Dance hall");cylinder(x,1.2,z,.2,1.6,stone,"Dance hall pillars")}
   }else if(monument==='khajuraho'){
    for(let i=0;i<5;i++)box(0,.15+i*.25,0,9-i*.2,.25,17-i*.25,edge,"Raised platform");
    box(0,2.4,-3,5,2.8,5,stone,"Sanctuary");
    box(0,2.1,1,5.6,2.3,4,stone,"Great hall");
    box(0,1.9,4,4,1.9,3,stone,"Entrance hall");
    spire(0,3.7,-3,2.6,9,stone,"Principal spire");
    for(const x of [-1.9,1.9])for(const z of [-4.8,-2.8,-.9])spire(x,3.1,z,.8,3.5,stone,"Subsidiary spires");
    for(const x of [-1,1])spire(x,3.4,-1,.75,5,stone,"Subsidiary spires");
    spire(0,3.15,1,2.4,3.1,stone,"Great hall roof");spire(0,2.8,4,1.7,2.3,stone,"Entrance roof");
    for(const side of [-1,1])for(let z=-5;z<=5;z+=.75){box(side*2.55,2.35,z,.22,1.8,.3,edge,"Sculptural wall rhythm");cylinder(side*2.69,2.25,z,.12,.65,stone,"Sculptural wall rhythm")}
    for(let i=0;i<8;i++)box(0,1.15-i*.14,6.3+i*.25,2,.18,.3,edge,"Entrance stairs");
   }else if(monument==='nalanda'){
    box(-2,.15,-1,13,.3,14,edge,"Monastery foundation");
    for(const x of [-7,3])for(let z=-6;z<=4;z+=2){box(x,.9,z,1.8,1.4,.25,stone,"Monastic cells");box(x-.85,.9,z+1,.22,1.4,2,stone,"Monastic cells");box(x+.85,.9,z+1,.22,1.4,2,stone,"Monastic cells")}
    for(const z of [-7,6])box(-2,1,z,12,1.7,.4,stone,"Enclosing walls");
    box(-2,.35,-.5,6,.18,8,stone,"Open courtyard");
    for(const x of [-5,1])for(let z=-5;z<=4;z+=1.5)cylinder(x,full?1.7:.8,z,.18,full?2.6:.8,stone,"Courtyard colonnade");
    if(full){for(const x of [-7,3])box(x,3,-.5,2.5,.28,13,inferred,"Monastery roofs");for(const z of [-6,5])box(-2,3,z,8,.28,2,inferred,"Monastery roofs")}
    for(let i=0;i<5;i++)box(7,.35+i*.55,1,5.5-i*.6,.55,6-i*.6,stone,"Temple terraces");
    for(let i=0;i<10;i++)box(7,.15+i*.26,5.8-i*.3,1.5,.25,.4,edge,"Temple staircase");
    if(full)spire(7,3.1,1,1.6,4,speculative,"Upper tower");
    for(let y=.55;y<2.8;y+=.22)box(7,y,4-(y*.6),Math.max(2.5,5.4-y),.04,.05,edge,"Brick courses");
   }else if(monument==='shanti-stupa'){
    for(let i=0;i<4;i++)cylinder(0,.16+i*.22,0,6.2-i*.18,.23,plaster,"Circular terrace");
    cylinder(0,1.3,0,4.6,1.1,plaster,"Lower drum");cylinder(0,2.2,0,4.1,.8,plaster,"Upper terrace");
    for(let i=0;i<48;i++){const a=i*Math.PI/24;cylinder(Math.cos(a)*4.45,2.25,Math.sin(a)*4.45,.05,.6,plaster,"Terrace railing")}
    ring(0,2.58,0,4.45,.065,plaster,"Terrace railing");
    const dome=new THREE.Mesh(new THREE.SphereGeometry(3.5,64,32,0,Math.PI*2,0,Math.PI/2),plaster);dome.position.y=2.65;dome.castShadow=true;dome.receiveShadow=true;dome.userData.feature="White dome";scene.add(dome);parts.push(dome);
    box(0,6.25,0,.8,.65,.8,gold,"Harmika");for(let i=0;i<9;i++)cylinder(0,6.75+i*.22,0,.65-i*.055,.13,gold,"Finial");cylinder(0,8.9,0,.06,.65,gold,"Finial");
    for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const x=Math.cos(a)*4.58,z=Math.sin(a)*4.58;const niche=box(x,1.35,z,.9,.8,.16,edge,"Relief niche");niche.rotation.y=Math.PI/2-a;const medallion=new THREE.Mesh(new THREE.SphereGeometry(.28,20,12),gold);medallion.userData.feature="Relief niche";medallion.scale.z=.3;medallion.position.set(x*1.02,1.4,z*1.02);medallion.rotation.y=Math.PI/2-a;scene.add(medallion);parts.push(medallion)}
    for(let i=0;i<8;i++)box(0,.12+i*.13,7.2-i*.22,2,.18,.3,plaster,"Approach stairs");
   }
  }
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let downX=0,downY=0;
  const down=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY};const click=(e:PointerEvent)=>{if(Math.hypot(e.clientX-downX,e.clientY-downY)>6)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(parts)[0];if(hit)onSelect(hit.object.userData.feature)};
  renderer.domElement.addEventListener("pointerdown",down);renderer.domElement.addEventListener("pointerup",click);
  const resize=new ResizeObserver(()=>{if(!el.clientWidth||!el.clientHeight)return;camera.aspect=el.clientWidth/el.clientHeight;camera.zoom=camera.aspect<1?.85:1;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)});resize.observe(el);
  let frame=0;const draw=()=>{controls.autoRotate=rotation.current;controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(draw)};draw();
  return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();controls.dispose();controlsRef.current=null;renderer.domElement.removeEventListener("pointerdown",down);renderer.domElement.removeEventListener("pointerup",click);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}});texture.dispose();renderer.dispose();renderer.domElement.remove()};
 },[monument,modelURL,intact,stage,onSelect]);
 if(!modelURL&&!['konark','khajuraho','nalanda','shanti-stupa'].includes(monument))return <div className="viewer"><div className="empty"><h3>No 3D model added yet</h3><p>Add a self-contained GLB file in Manage places.</p></div></div>;
 return <><div className="viewer" ref={host}>{error&&<div className="empty"><h3>{modelURL?'This model could not be loaded':'3D is unavailable in this browser'}</h3><p>{modelURL?'Choose a valid, self-contained GLB file.':'Enable WebGL or explore the photographs and history tabs.'}</p></div>}</div><div className="viewer-tools"><button title="Zoom in" onClick={()=>{const c=controlsRef.current;if(c){c.object.position.sub(c.target).multiplyScalar(.85).add(c.target);c.update()}}}><ZoomIn size={18}/></button><button title="Zoom out" onClick={()=>{const c=controlsRef.current;if(c){c.object.position.sub(c.target).multiplyScalar(1.15).add(c.target);c.update()}}}><ZoomOut size={18}/></button><button title="Reset camera" onClick={()=>{const c=controlsRef.current;if(c){c.object.position.set(20,15,24);c.target.set(0,3,0);c.update()}}}><RotateCcw size={18}/></button></div></>;
}
