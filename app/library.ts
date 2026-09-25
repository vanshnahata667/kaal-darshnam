import {monuments,events,HistoryEvent} from './heritage';
import {signedInUser} from '../lib/supabase';
import {accountRequest} from '../lib/account-api';
import {libraryForUser,preferencesSchema} from '../lib/validation';
export type Place=Omit<typeof monuments[number],'originalImage'> & {originalImage?:string;country?:string;latitude?:string;longitude?:string};
export type MediaItem={id:string;name:string;type:'image'|'video'|'model';blob?:Blob;url?:string;storagePath?:string};
export type Library={places:Place[];timelines:Record<string,HistoryEvent[]>;media:Record<string,MediaItem[]>};
export const initialLibrary:Library={places:monuments,timelines:events,media:{}};
async function directLibrary(){
 const {supabase,user}=await signedInUser();
 const {data,error}=await supabase.from('user_libraries').select('content').eq('user_id',user.id).maybeSingle();
 if(error)throw error;
 return {content:data?.content?libraryForUser(data.content,user.id):null};
}
async function directPreferences(){
 const {supabase,user}=await signedInUser();
 const {data,error}=await supabase.from('profiles').select('saved_places,visited_places').eq('id',user.id).maybeSingle();
 if(error)throw error;
 return preferencesSchema.parse({saved:data?.saved_places??[],visited:data?.visited_places??[]});
}
export async function loadLibrary():Promise<Library>{
 let data:{content:Library|null};
 try{data=await accountRequest<{content:Library|null}>('/api/library')}catch{try{data=await directLibrary()}catch{data={content:null}}}
 let published:Library|null=null;
 try{published=(await accountRequest<{content:Library|null}>('/api/catalogue',{signal:AbortSignal.timeout(7000)})).content}catch{/* Optional editorial content must not block personal data. */}
 const saved=data.content;
 const allowed=new Set(monuments.map(p=>p.id));
 const permitted=(p:Place)=>allowed.has(p.id)&&!JSON.stringify(p).toLowerCase().includes('unesco');
 const selected=monuments.map(seed=>{
  const personal=saved?.places.find(p=>p.id===seed.id);
  const editorial=published?.places.find(p=>p.id===seed.id);
  return personal&&permitted(personal)?personal:editorial&&permitted(editorial)?editorial:seed;
 });
 const timelines=Object.fromEntries(selected.map(p=>{const old=saved?.timelines[p.id]||published?.timelines[p.id];return [p.id,old&&!JSON.stringify(old).toLowerCase().includes('unesco')?old:events[p.id]]}));
 const media=Object.fromEntries(Object.entries(saved?.media||{}).filter(([id])=>allowed.has(id)));
 return resolveMedia({places:selected,timelines,media});
}
async function resolveMedia(value:Library){const {supabase}=await signedInUser();const media:Library['media']={};for(const [id,items]of Object.entries(value.media)){media[id]=await Promise.all(items.map(async item=>{if(!item.storagePath)return item;const {data,error}=await supabase.storage.from('heritage-media').createSignedUrl(item.storagePath,86400);if(error)throw error;return {...item,url:data.signedUrl}}))}return {...value,media}}
export async function storeLibrary(value:Library):Promise<Library>{const {supabase,user}=await signedInUser();const media:Library['media']={};for(const [id,items]of Object.entries(value.media)){media[id]=[];for(const item of items){let storagePath=item.storagePath;if(item.blob){storagePath=`${user.id}/${id}/${item.id}`;const uploaded=await accountRequest<{storagePath:string}>(`/api/media?placeId=${encodeURIComponent(id)}&mediaId=${encodeURIComponent(item.id)}`,{method:'POST',body:item.blob});storagePath=uploaded.storagePath}media[id].push({id:item.id,name:item.name,type:item.type,...(storagePath?{storagePath}:{url:item.url})})}}const stored={...value,media};await accountRequest('/api/library',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(stored)});return resolveMedia(stored)}
export async function loadPreferences(){
 let values:{saved:string[];visited:string[]};
 try{
  values=await accountRequest<{saved:string[];visited:string[]}>('/api/preferences');
 }catch{
  try{values=await directPreferences()}
  catch{values={saved:[],visited:[]}}
 }
 const allowed=new Set(monuments.map(p=>p.id));
 return {saved:values.saved.filter(id=>allowed.has(id)),visited:values.visited.filter(id=>allowed.has(id))};
}
let preferenceQueue:Promise<void>=Promise.resolve();
export async function savePreferences(saved:string[],visited:string[]){
 const {user}=await signedInUser();
 const write=async()=>{const current=await signedInUser();if(current.user.id!==user.id)throw Error('Account changed.');await accountRequest('/api/preferences',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({saved,visited})})};
 preferenceQueue=preferenceQueue.catch(()=>{}).then(write);return preferenceQueue;
}
export function safeURL(value:string){return !value || /^https?:\/\//i.test(value)}
