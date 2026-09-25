import {NextResponse,type NextRequest} from 'next/server';
import {blockedPath,securityHeaders} from './lib/security-headers';
import {apiCors} from './lib/api-cors';
import {effectiveProtocol,httpsRedirectUrl,isProductionBuild} from './lib/https-policy';
export function middleware(request:NextRequest){
 const url=new URL(request.url);
 if(blockedPath(url.pathname))return new NextResponse('Not found',{status:404});
 const origin=request.headers.get('origin');
 const cors=url.pathname.startsWith('/api/')?apiCors(origin,url.origin):{};
 if(cors===null)return new NextResponse('Not allowed',{status:403});
 if(url.pathname.startsWith('/api/')&&request.method==='OPTIONS')return new NextResponse(null,{status:204,headers:cors});
 const forwardedProto=request.headers.get('x-forwarded-proto');
 const host=request.headers.get('host')||url.host;
 const secure=effectiveProtocol(forwardedProto,url.protocol)==='https';
 // A public plain-HTTP link is upgraded so the address bar and every link stay HTTPS.
 // Local previews and CORS preflights are left alone.
 if(!secure&&request.method!=='OPTIONS'&&isProductionBuild(process.env.NODE_ENV)){
  const target=httpsRedirectUrl(host,url.pathname,url.search,forwardedProto,url.protocol);
  if(target)return NextResponse.redirect(target,308);
 }
 const response=NextResponse.next();
 for(const [name,value]of Object.entries(cors))response.headers.set(name,value);
 for(const [name,value]of Object.entries(securityHeaders(process.env.NODE_ENV!=='production',secure)))response.headers.set(name,value);
 response.headers.delete('X-Powered-By');
 return response;
}
export const config={matcher:['/:path*']};
