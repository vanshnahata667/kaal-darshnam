import {z} from 'zod';

const text=(max:number)=>z.string().max(max);
export const identifier=z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const url=z.string().max(2048).refine(value=>{
 if(!value)return true;
 try{const parsed=new URL(value);return ['https:','http:'].includes(parsed.protocol)&&!parsed.username&&!parsed.password}catch{return false}
},'Invalid URL');
const image=url.or(z.string().regex(/^\/heritage\/[a-z0-9-]+\.jpg$/));
const coordinate=(limit:number)=>z.string().max(24).refine(v=>!v.trim()||(Number.isFinite(Number(v))&&Math.abs(Number(v))<=limit)).optional();
const place=z.object({id:identifier,name:text(200).min(1),region:text(200),era:text(200),dynasty:text(200),image,originalImage:url.optional(),alt:text(500),credit:text(500),imageSource:url,source:url,summary:text(2000),history:text(20000),damage:text(10000),country:text(100).optional(),latitude:coordinate(90),longitude:coordinate(180)});
const event=z.object({event_id:identifier,monument_id:identifier,year_range:text(200).min(1),actor:text(500),description:text(10000).min(1),evidence_type:z.enum(['documented','inferred','disputed']),source_url:url});
const media=z.object({id:identifier,name:text(255),type:z.enum(['image','video','model']),storagePath:z.string().max(350).regex(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/).optional(),url:url.optional()});
export const librarySchema=z.object({places:z.array(place).min(1).max(100),timelines:z.record(identifier,z.array(event).length(4)),media:z.record(identifier,z.array(media).max(30))}).superRefine((value,ctx)=>{
 const ids=new Set(value.places.map(p=>p.id));
 if(ids.size!==value.places.length)ctx.addIssue({code:'custom',message:'Duplicate places'});
 for(const id of ids)if(!value.timelines[id])ctx.addIssue({code:'custom',message:'Missing timeline'});
 for(const [id,events]of Object.entries(value.timelines))if(!ids.has(id)||events.some(e=>e.monument_id!==id))ctx.addIssue({code:'custom',message:'Invalid timeline'});
 for(const id of Object.keys(value.media))if(!ids.has(id))ctx.addIssue({code:'custom',message:'Invalid media owner'});
});
export const preferencesSchema=z.object({saved:z.array(identifier).max(500),visited:z.array(identifier).max(500)}).strict();
export function libraryForUser(value:unknown,userId:string){
 const data=librarySchema.parse(value);
 for(const [placeId,items]of Object.entries(data.media))for(const item of items){
  if(item.storagePath&&item.storagePath!==`${userId}/${placeId}/${item.id}`)throw Error('Invalid media ownership');
 }
 return data;
}
