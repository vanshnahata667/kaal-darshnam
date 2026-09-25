declare const __KAAL_API_ORIGIN__: string;
export function apiURL(path:string){
 if(!path.startsWith('/api/'))throw Error('Invalid API path');
 const origin=typeof __KAAL_API_ORIGIN__==='undefined'?'':__KAAL_API_ORIGIN__;
 return origin+path;
}
