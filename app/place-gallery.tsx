"use client";
import {useEffect,useRef,useState} from 'react';
import type {Place,MediaItem} from './library';
import {galleryPhotos,type GalleryPhoto} from './gallery-data';

export default function PlaceGallery({place,uploads,onAdd}:{place:Place;uploads:MediaItem[];onAdd:()=>void}){
 const photos:GalleryPhoto[]=[{id:'cover',src:place.image,alt:place.alt,title:'Site overview',credit:place.credit,sourceUrl:place.imageSource},...(galleryPhotos[place.id]||[]),...uploads.filter(m=>m.type==='image'&&m.url).map(m=>({id:m.id,src:m.url!,alt:m.name,title:m.name,credit:'Your private upload',sourceUrl:m.url!}))];
 const [index,setIndex]=useState(0),[expanded,setExpanded]=useState(false),[failed,setFailed]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);const current=photos[Math.min(index,photos.length-1)];
 useEffect(()=>{setFailed(false)},[index]);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(expanded){el.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;el.close()}}el.close()},[expanded]);
 const step=(by:number)=>setIndex(i=>(i+by+photos.length)%photos.length);
 const caption=<><strong>{current.title}</strong><p>{current.alt}</p><small>{current.credit}{current.licenseUrl&&<> · <a href={current.licenseUrl} target="_blank" rel="noreferrer">License</a></>}{current.sourceUrl&&<> · <a href={current.sourceUrl} target="_blank" rel="noreferrer">Original photograph</a></>}{current.changes&&<> · {current.changes}</>}</small></>;
 return <section className="place-gallery"><div className="gallery-heading"><div><span className="eyebrow">A CLOSER LOOK</span><h2>{place.name}, beyond the overview</h2></div><span>{photos.length} photographs</span></div>
 <figure className="gallery-feature"><button className="gallery-enlarge" aria-label="Enlarge photograph" onClick={()=>setExpanded(true)}><img src={current.src} alt={current.alt} onError={()=>setFailed(true)}/></button>{failed&&<p role="status">This photograph is temporarily unavailable.</p>}<figcaption><div>{caption}</div><div className="gallery-navigation"><button className="outline" aria-label="Previous photograph" onClick={()=>step(-1)}>Previous</button><span aria-live="polite">{index+1} / {photos.length}</span><button className="outline" aria-label="Next photograph" onClick={()=>step(1)}>Next</button></div></figcaption></figure>
 <div className="gallery-thumbnails" aria-label="Photograph selection">{photos.map((photo,i)=><button key={photo.id} aria-label={`View photograph ${i+1}: ${photo.title}`} aria-pressed={i===index} onClick={()=>setIndex(i)}><img src={photo.src} alt="" loading="lazy"/><span>{String(i+1).padStart(2,'0')} / {photo.title}</span></button>)}</div><button className="outline" onClick={onAdd}>Add your photographs</button>
 <dialog ref={dialog} className="photo-dialog" aria-label="Expanded photograph" onClose={()=>setExpanded(false)} onClick={e=>{if(e.target===e.currentTarget)setExpanded(false)}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}}}><div className="photo-dialog-toolbar"><span>{place.name} · {index+1} / {photos.length}</span><button className="outline" onClick={()=>setExpanded(false)}>Close photograph</button></div><img src={current.src} alt={current.alt}/><div className="photo-dialog-caption">{caption}</div><div className="gallery-navigation"><button className="outline" onClick={()=>step(-1)}>Previous</button><button className="outline" onClick={()=>step(1)}>Next</button></div></dialog></section>;
}
