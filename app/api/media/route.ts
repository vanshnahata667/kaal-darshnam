import {authenticatedClient,apiError,boundedBytes} from '../../../lib/server-auth';
import {identifier} from '../../../lib/validation';
import {MAX_UPLOAD_BYTES,verifiedMediaType} from '../../../lib/media-validation';
export async function POST(request:Request){
 try{
  const auth=await authenticatedClient(request);if(!auth)return apiError(401,'Sign in required.');
  const params=new URL(request.url).searchParams;
  const place=identifier.safeParse(params.get('placeId')),media=identifier.safeParse(params.get('mediaId'));
  if(!place.success||!media.success)return apiError(400,'Invalid upload destination.');
  let bytes;try{bytes=await boundedBytes(request,MAX_UPLOAD_BYTES)}catch{return apiError(413,'Choose a file smaller than 25 MB.');}
  const contentType=verifiedMediaType(bytes);
  if(!contentType)return apiError(400,'Choose a JPEG, PNG, WebP, MP4, WebM or self-contained GLB file.');
  const storagePath=`${auth.user.id}/${place.data}/${media.data}`;
  const {error}=await auth.client.storage.from('heritage-media').upload(storagePath,bytes,{contentType,upsert:true});
  return error?apiError(503,'Upload could not complete. Please try again.'):Response.json({storagePath},{headers:{'Cache-Control':'no-store'}});
 }catch{return apiError(503,'Upload could not complete. Please try again.');}
}
