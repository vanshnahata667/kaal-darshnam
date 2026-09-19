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
  const camera=new THREE.PerspectiveCamera(38,el.clientWidth/el.clientHeight,.1,150);camera.position.set(24,19,28);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-label","Interactive schematic temple reconstruction");
  const controls=new OrbitControls(camera,renderer.domElement);controlsRef.current=controls;controls.target.set(0,3,0);controls.enableDamping=true;controls.minDistance=12;controls.maxDistance=55;controls.maxPolarAngle=Math.PI/2.1;controls.autoRotateSpeed=.8;
  scene.add(new THREE.HemisphereLight(0xffffff,0x7b8477,2.5));const sun=new THREE.DirectionalLight(0xfff8e6,3.5);sun.position.set(-14,25,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22});scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xdfe4dd,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;scene.add(ground);
  const stone=new THREE.MeshStandardMaterial({color:0xb0a18b,roughness:.94}), edge=new THREE.MeshStandardMaterial({color:0x988b76,roughness:.95}), inferred=new THREE.MeshStandardMaterial({color:0x9bbaa9,roughness:.9}), speculative=new THREE.MeshStandardMaterial({color:0x93a9bd,roughness:.8});
  const parts:THREE.Mesh[]=[];
  function box(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material=stone,name="Pillared hall"){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.feature=name;scene.add(mesh);parts.push(mesh);return mesh}
  function cylinder(x:number,y:number,z:number,r:number,h:number,mat:THREE.Material=stone,name="Pillared hall"){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,8),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.userData.feature=name;scene.add(mesh);parts.push(mesh);return mesh}
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
     for(let i=0;i<4;i++)box(0,.18+i*.25,2,12-i*.45, .28,7-i*.35,edge,"Surya Kund");
     for(let x=-5;x<=5;x+=2)for(let z=0;z<=4;z+=2)box(x,.9,z,.42,1.4,.42,stone,"Kund pavilion");
     box(0,2,-3,8,2.8,4,stone,"Sabha Mandapa");
     for(let x=-3;x<=3;x+=2)box(x,3.8,-3,.38,3,.38,inferred,"Carved pillar");
     box(0,4.7,-3,6.5,.35,3.2,inferred,"Mandapa roof");
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
  return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();controls.dispose();controlsRef.current=null;renderer.domElement.removeEventListener("pointerdown",down);renderer.domElement.removeEventListener("pointerup",click);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}});renderer.dispose();renderer.domElement.remove()};
 },[monument,modelURL,intact,stage,onSelect]);
 if(!modelURL&&!['hampi','konark','modhera','nalanda','shanti-stupa'].includes(monument))return <div className="viewer"><div className="empty"><h3>No 3D model added yet</h3><p>Add a self-contained GLB file in Manage places.</p></div></div>;
 return <><div className="viewer" ref={host}>{error&&<div className="empty"><h3>{modelURL?'This model could not be loaded':'3D is unavailable in this browser'}</h3><p>{modelURL?'Choose a valid, self-contained GLB file.':'Enable WebGL or explore the photographs and history tabs.'}</p></div>}</div><div className="viewer-tools"><button title="Zoom in" onClick={()=>{const c=controlsRef.current;if(c){c.object.position.sub(c.target).multiplyScalar(.85).add(c.target);c.update()}}}><ZoomIn size={18}/></button><button title="Zoom out" onClick={()=>{const c=controlsRef.current;if(c){c.object.position.sub(c.target).multiplyScalar(1.15).add(c.target);c.update()}}}><ZoomOut size={18}/></button><button title="Reset camera" onClick={()=>{const c=controlsRef.current;if(c){c.object.position.set(24,19,28);c.target.set(0,3,0);c.update()}}}><RotateCcw size={18}/></button></div></>;
}
