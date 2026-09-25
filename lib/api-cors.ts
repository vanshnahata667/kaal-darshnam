const origins=new Set(['https://kaal-darshanam.web.app','https://kaal-darshanam.firebaseapp.com']);
export function apiCors(origin:string|null,ownOrigin:string):Record<string,string>|null{
 if(!origin||origin===ownOrigin)return {};
 if(!origins.has(origin))return null;
 return {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, PUT, POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'};
}
