import assert from 'node:assert/strict';
import {libraryForUser,preferencesSchema} from '../lib/validation.ts';
import {verifiedMediaType} from '../lib/media-validation.ts';
import {publicConfiguration} from '../lib/public-config.ts';
const uid='11111111-1111-4111-8111-111111111111';
const place={id:'test',name:'Test',region:'India',era:'1000',dynasty:'Test',image:'/heritage/hampi.jpg',alt:'Test',credit:'Test',imageSource:'https://example.com',source:'https://example.com',summary:'Test',history:'Test',damage:'Test'};
const base={places:[place],timelines:{test:Array.from({length:4},(_,i)=>({event_id:`event-${i}`,monument_id:'test',year_range:'1000',actor:'Test',description:'Test',evidence_type:'inferred',source_url:'https://example.com'}))},media:{}};
assert.equal(libraryForUser(base,uid).places.length,1);
assert.throws(()=>libraryForUser({...base,places:[{...place,image:'javascript:alert(1)'}]},uid));
assert.throws(()=>libraryForUser({...base,places:[{...place,latitude:'999'}]},uid));
assert.throws(()=>libraryForUser({...base,media:{test:[{id:'media',name:'Test',type:'image',storagePath:'other/test/media'}]}},uid));
assert.throws(()=>preferencesSchema.parse({saved:['test'],visited:[],user_id:'other'}));
assert.throws(()=>preferencesSchema.parse({saved:['../../private'],visited:[]}));
assert.equal(verifiedMediaType(new TextEncoder().encode('<svg onload="alert(1)"></svg>')),null);
assert.equal(verifiedMediaType(new TextEncoder().encode('<html><script>alert(1)</script></html>')),null);
const jpeg=new Uint8Array(20);jpeg.set([255,216,255]);assert.equal(verifiedMediaType(jpeg),'image/jpeg');
const original=process.env.SUPABASE_PUBLISHABLE_KEY;process.env.SUPABASE_PUBLISHABLE_KEY='sb_secret_not_for_browser';assert.equal(publicConfiguration().supabaseKey,'');
if(original===undefined)delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=original;
const root='http://localhost:5173';
for(const path of ['/api/library','/api/preferences','/api/media','/api/catalogue']){
 const response=await fetch(root+path,{method:path.endsWith('media')?'POST':'GET',headers:{'x-user-id':uid}});
 assert.equal(response.status,401,path+' must reject forged user IDs');
}
for(const path of ['/.env','/.env.local','/.git/config','/admin','/api/admin'])assert.equal((await fetch(root+path)).status,404,path);
assert.equal((await fetch(root+'/api/preferences',{method:'PUT',headers:{Origin:'https://attacker.example','Content-Type':'application/json'},body:'{}'})).status,403);
const home=await fetch(root+'/login');
for(const header of ['content-security-policy','x-content-type-options','x-frame-options','permissions-policy'])assert.ok(home.headers.get(header),header);
assert.equal(home.headers.get('access-control-allow-origin'),null);
console.log('Security checks passed: validation, upload rejection, forged IDs, private paths, cross-origin writes and HTTP headers.');
