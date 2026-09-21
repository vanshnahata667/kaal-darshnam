import {monuments,events,HistoryEvent} from './heritage';
import {signedInUser} from '../lib/supabase';
import {accountRequest} from '../lib/account-api';
export type Place=Omit<typeof monuments[number],'originalImage'> & {originalImage?:string;country?:string;latitude?:string;longitude?:string};
export type MediaItem={id:string;name:string;type:'image'|'video'|'model';blob?:Blob;url?:string;storagePath?:string};
export type Library={places:Place[];timelines:Record<string,HistoryEvent[]>;media:Record<string,MediaItem[]>};
export const initialLibrary:Library={places:monuments,timelines:events,media:{}};
export async function loadLibrary():Promise<Library>{const data=await accountRequest<{content:Library|null}>('/api/library');const saved=data?.content as Library|undefined;const value=saved?{...saved,places:[...saved.places,...monuments.filter(p=>!saved.places.some(s=>s.id===p.id))],timelines:{...events,...saved.timelines}}:initialLibrary;return resolveMedia(value)}
async function resolveMedia(value:Library){const {supabase}=await signedInUser();const media:Library['media']={};for(const [id,items]of Object.entries(value.media)){media[id]=await Promise.all(items.map(async item=>{if(!item.storagePath)return item;const {data,error}=await supabase.storage.from('heritage-media').createSignedUrl(item.storagePath,86400);if(error)throw error;return {...item,url:data.signedUrl}}))}return {...value,media}}
export async function storeLibrary(value:Library):Promise<Library>{const {supabase,user}=await signedInUser();const media:Library['media']={};for(const [id,items]of Object.entries(value.media)){media[id]=[];for(const item of items){let storagePath=item.storagePath;if(item.blob){storagePath=`${user.id}/${id}/${item.id}`;const uploaded=await accountRequest<{storagePath:string}>(`/api/media?placeId=${encodeURIComponent(id)}&mediaId=${encodeURIComponent(item.id)}`,{method:'POST',body:item.blob});storagePath=uploaded.storagePath}media[id].push({id:item.id,name:item.name,type:item.type,...(storagePath?{storagePath}:{url:item.url})})}}const stored={...value,media};await accountRequest('/api/library',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(stored)});return resolveMedia(stored)}
export async function loadPreferences(){return accountRequest<{saved:string[];visited:string[]}>('/api/preferences')}
let preferenceQueue:Promise<void>=Promise.resolve();
export async function savePreferences(saved:string[],visited:string[]){
 const {user}=await signedInUser();
 const write=async()=>{const current=await signedInUser();if(current.user.id!==user.id)throw Error('Account changed.');await accountRequest('/api/preferences',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({saved,visited})})};
 preferenceQueue=preferenceQueue.catch(()=>{}).then(write);return preferenceQueue;
}
export function safeURL(value:string){return !value || /^https?:\/\//i.test(value)}
