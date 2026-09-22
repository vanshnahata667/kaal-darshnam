import {authenticatedClient,apiError,boundedJson} from '../../../lib/server-auth';
import {preferencesSchema} from '../../../lib/validation';
export async function GET(request:Request){
 try{const auth=await authenticatedClient(request);if(!auth)return apiError(401,'Sign in required.');
 const {data,error}=await auth.client.from('profiles').select('saved_places,visited_places').eq('id',auth.user.id).maybeSingle();
 if(error)return apiError(503,'Your saved places are temporarily unavailable.');
 const values=preferencesSchema.parse({saved:data?.saved_places??[],visited:data?.visited_places??[]});
 return Response.json(values,{headers:{'Cache-Control':'no-store'}});
 }catch{return apiError(503,'Unable to load saved places. Try again.');}
}
export async function PUT(request:Request){
 try{const auth=await authenticatedClient(request);if(!auth)return apiError(401,'Sign in required.');
 let values;try{values=preferencesSchema.parse(await boundedJson(request))}catch{return apiError(400,'Invalid saved-place selection.');}
 const {error}=await auth.client.from('profiles').upsert({id:auth.user.id,saved_places:values.saved,visited_places:values.visited,updated_at:new Date().toISOString()});
 return error?apiError(503,'Your saved places could not sync. Try again.'):Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return apiError(503,'Your saved places could not sync. Try again.');}
}
