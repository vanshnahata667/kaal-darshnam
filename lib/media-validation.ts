export const MAX_UPLOAD_BYTES=25*1024*1024;
export function verifiedMediaType(bytes:Uint8Array):string|null {
 if(bytes.length<12||bytes.length>MAX_UPLOAD_BYTES)return null;
 const ascii=(start:number,end:number)=>new TextDecoder().decode(bytes.slice(start,end));
 if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'image/jpeg';
 if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
 if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP')return 'image/webp';
 if(ascii(4,8)==='ftyp')return 'video/mp4';
 if([0x1a,0x45,0xdf,0xa3].every((v,i)=>bytes[i]===v))return 'video/webm';
 if(ascii(0,4)==='glTF'){
  try{
   const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
   if(view.getUint32(4,true)!==2||view.getUint32(8,true)!==bytes.length||view.getUint32(16,true)!==0x4e4f534a)return null;
   const length=view.getUint32(12,true);if(length>bytes.length-20)return null;
   const document=JSON.parse(ascii(20,20+length));
   // Keep uploaded models self-contained; never fetch URLs embedded in a GLB.
   const external=(value:unknown):boolean=>!!value&&typeof value==='object'&&Object.entries(value).some(([key,item])=>key==='uri'||external(item));
   if(external(document))return null;
   return 'model/gltf-binary';
  }catch{return null}
 }
 return null;
}
