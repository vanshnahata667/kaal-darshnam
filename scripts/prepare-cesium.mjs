import {cpSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const source=resolve('node_modules/cesium/Build/Cesium');const target=resolve('public/cesium');
mkdirSync(target,{recursive:true});
for(const file of ['Assets','ThirdParty','Widgets','Workers','Cesium.js'])cpSync(resolve(source,file),resolve(target,file),{recursive:true});
console.log('Cesium browser assets ready.');
