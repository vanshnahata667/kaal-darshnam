import {execFileSync} from 'node:child_process';
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:128*1024*1024});
const objects=git(['rev-list','--objects','--all']).trim().split('\n');
const findings=[];let scanned=0;
const signatures=[/sb_secret_[A-Za-z0-9_-]{20,}/g,/(?:ghp_|github_pat_)[A-Za-z0-9_]{25,}/g,/sk_live_[A-Za-z0-9]{20,}/g,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g];
for(const line of objects){
 const space=line.indexOf(' ');if(space<0)continue;const oid=line.slice(0,space),path=line.slice(space+1);
 if(git(['cat-file','-t',oid]).trim()!=='blob')continue;
 const value=git(['cat-file','-p',oid]);scanned++;
 if(/(^|\/)\.env(?:\.|$)/.test(path)&&!path.endsWith('.example'))findings.push({path,kind:'environment file in history'});
 if(signatures.some(pattern=>{pattern.lastIndex=0;return pattern.test(value)}))findings.push({path,kind:'possible secret signature'});
 for(const token of value.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[]){
  try{if(JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).role==='service_role')findings.push({path,kind:'administrative JWT'})}catch{}
 }
}
console.log(JSON.stringify({scannedBlobs:scanned,findings},null,2));
if(findings.length)process.exitCode=1;
