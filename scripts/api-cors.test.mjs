import assert from 'node:assert/strict';
import {apiCors} from '../lib/api-cors.ts';
const own='https://kaal-darshanam.jainashwin400.chatgpt.site';
assert.deepEqual(apiCors(null,own),{});
assert.deepEqual(apiCors(own,own),{});
for(const origin of ['https://kaal-darshanam.web.app','https://kaal-darshanam.firebaseapp.com']){
 assert.equal(apiCors(origin,own)['Access-Control-Allow-Origin'],origin);
 assert.equal(apiCors(origin,own)['Access-Control-Allow-Credentials'],undefined);
}
for(const origin of ['null','https://evil.example','https://kaal-darshanam.web.app.evil.example','http://kaal-darshanam.web.app'])assert.equal(apiCors(origin,own),null);
console.log('CORS tests passed: exact HTTPS origins only, no credential cookies.');
