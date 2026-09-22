import {getSupabase} from './supabase';
export async function accountRequest<T>(path:string,init:RequestInit={}):Promise<T>{
 const client=await getSupabase();const {data,error}=await client.auth.getSession();
 if(error||!data.session)throw Error('Please sign in again.');
 const headers=new Headers(init.headers);headers.set('Authorization',`Bearer ${data.session.access_token}`);
 const response=await fetch(path,{...init,headers,signal:init.signal||AbortSignal.timeout(60000)});
 if(!response.ok)throw Error(response.status===401?'Please sign in again.':'Your changes could not sync. Check your connection and try again.');
 return response.json() as Promise<T>;
}
