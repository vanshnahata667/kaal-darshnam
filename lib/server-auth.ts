import {createClient} from '@supabase/supabase-js';
import {publicConfiguration} from './public-config';

export async function authenticatedClient(request:Request){
 const header=request.headers.get('authorization')||'';
 if(!header.startsWith('Bearer ')||header.length>8192)return null;
 const token=header.slice(7);
 const {supabaseUrl,supabaseKey}=publicConfiguration();
 if(!supabaseUrl||!supabaseKey)return null;
 const client=createClient(supabaseUrl,supabaseKey,{global:{headers:{Authorization:`Bearer ${token}`},fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.any([AbortSignal.timeout(15000),...(init?.signal?[init.signal]:[])])})},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const {data,error}=await client.auth.getUser(token);
 return error||!data.user?null:{client,user:data.user};
}
export const apiError=(status:number,message:string)=>Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
export async function boundedBytes(request:Request,maximum:number){
 const reader=request.body?.getReader();if(!reader)throw Error('Missing body');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum){await reader.cancel();throw Error('Request too large')}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
 return bytes;
}
export async function boundedJson(request:Request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw Error('Invalid content type');
 return JSON.parse(new TextDecoder().decode(await boundedBytes(request,2*1024*1024)));
}
