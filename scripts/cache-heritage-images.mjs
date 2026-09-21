import {readFile, mkdir, writeFile, access} from 'node:fs/promises';
import {resolve} from 'node:path';
import ts from 'typescript';

// Cache only the curated image URLs; original attribution stays in the dataset.
const destination=resolve('public/heritage');
await mkdir(destination,{recursive:true});
const images=[];
for(const file of ['app/heritage.ts','app/additional-heritage.ts']) {
 const source=ts.createSourceFile(file,await readFile(file,'utf8'),ts.ScriptTarget.Latest,true);
 const visit=node=>{
  if(ts.isObjectLiteralExpression(node)) {
   const fields=Object.fromEntries(node.properties.filter(p=>ts.isPropertyAssignment(p)&&ts.isStringLiteral(p.initializer)).map(p=>[p.name.getText(source).replace(/['"]/g,''),p.initializer.text]));
   const image=fields.originalImage||fields.image;
   if(fields.id&&/^https:\/\//.test(image||''))images.push({...fields,image});
  }
  ts.forEachChild(node,visit);
 };
 visit(source);
}
for(const {id,image} of images) {
 if(!/^[a-z0-9-]+$/.test(id))throw Error('Invalid asset identifier');
 const target=resolve(destination,`${id}.jpg`);
 try {await access(target);console.log(`${id}: already cached`);continue;}catch{}
 const response=await fetch(image,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Kaal-Darshan educational heritage catalogue'}});
 if(!response.ok||!response.headers.get('content-type')?.includes('image/jpeg'))throw Error(`${id}: image download failed (${response.status})`);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes[0]!==0xff||bytes[1]!==0xd8)throw Error(`${id}: unexpected image format`);
 await writeFile(target,bytes);
 console.log(`${id}: cached ${bytes.length} bytes`);
}
