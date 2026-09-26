"use client";
import {useState} from 'react';
import {placeContext} from './additional-heritage';
import type {Place} from './library';
export default function HeritageVideo({place}:{place:Place}){
 const [playing,setPlaying]=useState(false);
 const context=placeContext[place.id],id=context?.videoId;
 return <article className="heritage-film"><div className="film-player">{playing&&id?<iframe title={place.name+' - heritage film'} src={'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1'} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>:id?<button className="film-cover" aria-label="Watch heritage film" onClick={()=>setPlaying(true)}><img src={place.image} alt={place.alt}/><span>Watch heritage film</span></button>:<img className="film-cover" src={place.image} alt={place.alt}/>}</div><div className="film-caption"><h3>{place.name}: on location</h3><p>{context?.videoCredit||'Original publisher'}. Original publisher retains all rights.</p>{!id&&<p>A verified film from an approved publisher is still needed. Personal videos and the live 3D tour remain available.</p>}{context?.videoSource&&<a href={context.videoSource} target="_blank" rel="noreferrer">Open publisher / destination reference</a>}<p className="small">External playback depends on the publisher.</p></div></article>;
}
