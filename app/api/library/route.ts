import {authenticatedClient,apiError,boundedJson} from '../../../lib/server-auth';
import {libraryForUser} from '../../../lib/validation';
export async function GET(request:Request){
 try{const auth=await authenticatedClient(request);if(!auth)return apiError(401,'Sign in required.');
 const {data,error}=await auth.client.from('user_libraries').select('content').eq('user_id',auth.user.id).maybeSingle();
 if(error)return apiError(503,'Your library is temporarily unavailable.');
 return Response.json({content:data?.content?libraryForUser(data.content,auth.user.id):null},{headers:{'Cache-Control':'no-store'}});
 }catch{return apiError(503,'Unable to load your library. Try again.');}
}
export async function PUT(request:Request){
 try{const auth=await authenticatedClient(request);if(!auth)return apiError(401,'Sign in required.');
 let content;try{content=libraryForUser(await boundedJson(request),auth.user.id)}catch{return apiError(400,'Check the place details, sources and uploaded files.');}
 const {error}=await auth.client.from('user_libraries').upsert({user_id:auth.user.id,content,updated_at:new Date().toISOString()});
 return error?apiError(503,'Your changes could not be saved. Try again.'):Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return apiError(503,'Your changes could not be saved. Try again.');}
}
