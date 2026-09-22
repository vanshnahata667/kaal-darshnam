import {librarySchema} from './validation.ts';

export function parseFirestoreCatalogue(document:unknown){
 const fields=(document as {fields?:Record<string,{booleanValue?:boolean;stringValue?:string}>})?.fields;
 if(fields?.published?.booleanValue!==true)throw Error('Catalogue is not published');
 const json=fields.contentJSON?.stringValue;
 if(typeof json!=='string'||json.length>900000)throw Error('Invalid catalogue');
 const content=librarySchema.parse(JSON.parse(json));
 // Firestore contains editorial content only, never personal uploads or signed URLs.
 if(Object.keys(content.media).length)throw Error('Private media is not allowed');
 return content;
}

export async function readFirestoreCatalogue(projectId:string,fetcher:typeof fetch=fetch){
 if(!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId))throw Error('Invalid Firebase project ID');
 const url=`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/heritage_catalogue/current`;
 const response=await fetcher(url,{signal:AbortSignal.timeout(5000)});
 if(!response.ok)throw Error('Catalogue unavailable');
 const reader=response.body?.getReader();if(!reader)throw Error('Empty catalogue');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2*1024*1024){await reader.cancel();throw Error('Catalogue too large')}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
 return parseFirestoreCatalogue(JSON.parse(new TextDecoder().decode(bytes)));
}
