"use client";
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
export default function PanoramaVideo({src,name}:{src?:string;name:string}){
 const video=useRef<HTMLVideoElement>(null),host=useRef<HTMLDivElement>(null);
 const [immersive,setImmersive]=useState(false),[playing,setPlaying]=useState(false),[time,setTime]=useState(0),[duration,setDuration]=useState(0),[error,setError]=useState('');
 useEffect(()=>{
  if(!immersive||!host.current||!video.current)return;
  const el=host.current;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true})}catch{setError('360 playback needs WebGL. Standard playback remains available.');return}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label',`${name} 360 video`);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(70,1,.01,20);camera.position.z=.1;
  const texture=new THREE.VideoTexture(video.current);texture.colorSpace=THREE.SRGBColorSpace;
  const geometry=new THREE.SphereGeometry(10,64,40);geometry.scale(-1,1,1);
  const material=new THREE.MeshBasicMaterial({map:texture});scene.add(new THREE.Mesh(geometry,material));
  const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableZoom=false;controls.rotateSpeed=-.35;
  const resize=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()});resize.observe(el);
  let frame=0;const draw=()=>{controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(draw)};draw();
  return()=>{cancelAnimationFrame(frame);resize.disconnect();controls.dispose();texture.dispose();geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove()};
 },[immersive,src,name]);
 async function toggle(){const v=video.current;if(!v)return;if(v.paused){try{await v.play();setError('')}catch{setError('Video could not start. Check the file and connection.')}}else v.pause()}
 return <figure className="personal-film"><figcaption>{name}</figcaption><div className="segmented"><button className={!immersive?'selected':''} onClick={()=>setImmersive(false)}>Standard video</button><button className={immersive?'selected':''} onClick={()=>{setError('');setImmersive(true)}}>360 panorama</button></div><video ref={video} src={src} controls={!immersive} style={{display:immersive?'none':'block'}} crossOrigin="anonymous" playsInline preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={()=>setTime(video.current?.currentTime||0)} onLoadedMetadata={()=>setDuration(Number.isFinite(video.current?.duration)?video.current!.duration:0)} onError={()=>setError('This video could not load. Try another supported file.')}/>{immersive&&<><div className="panorama-canvas" ref={host}/><div className="panorama-controls"><button className="outline" onClick={toggle}>{playing?'Pause':'Play'}</button><input aria-label="Video position" type="range" min="0" max={duration||1} step=".1" value={time} onChange={e=>{if(video.current)video.current.currentTime=Number(e.target.value)}}/><span>{Math.floor(time)} / {Math.floor(duration)} s</span></div><p className="small">Requires an equirectangular 360 video. Ordinary footage is not a panoramic recording.</p></>}{error&&<p role="status">{error}</p>}</figure>;
}
