import './prepare-cesium.mjs';
import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.firebase.config.ts'],{stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
