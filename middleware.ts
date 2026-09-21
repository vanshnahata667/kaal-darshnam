import {NextResponse,type NextRequest} from 'next/server';
import {blockedPath,securityHeaders} from './lib/security-headers';
export function middleware(request:NextRequest){
 const url=new URL(request.url);
 if(blockedPath(url.pathname))return new NextResponse('Not found',{status:404});
 const origin=request.headers.get('origin');
 if(url.pathname.startsWith('/api/')&&origin&&origin!==url.origin)return new NextResponse('Not allowed',{status:403});
 const response=NextResponse.next();
 for(const [name,value]of Object.entries(securityHeaders(process.env.NODE_ENV!=='production')))response.headers.set(name,value);
 if(url.protocol==='https:')response.headers.set('Strict-Transport-Security','max-age=31536000');
 response.headers.delete('X-Powered-By');
 return response;
}
export const config={matcher:['/:path*']};
