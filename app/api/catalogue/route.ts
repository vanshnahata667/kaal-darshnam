import {authenticatedClient,apiError} from '../../../lib/server-auth';
import {readFirestoreCatalogue} from '../../../lib/firestore-catalogue';

export async function GET(request:Request){
 try{
  const auth=await authenticatedClient(request);if(!auth)return apiError(401,'Sign in required.');
  const project=process.env.FIREBASE_PROJECT_ID||'';
  if(!project)return Response.json({status:'not-configured',content:null},{headers:{'Cache-Control':'no-store'}});
  try{return Response.json({status:'connected',content:await readFirestoreCatalogue(project)},{headers:{'Cache-Control':'no-store'}})}
  catch{return Response.json({status:'unavailable',content:null},{headers:{'Cache-Control':'no-store'}})}
 }catch{return apiError(503,'Unable to verify your session. Try again.');}
}
