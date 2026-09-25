let navigating=false;
function navigate(url:string,replace:boolean){
 if(navigating)return;
 navigating=true;
 if(replace)window.location.replace(url);else window.location.assign(url);
}
const router={replace:(url:string)=>navigate(url,true),push:(url:string)=>navigate(url,false)};
export function useRouter(){return router}
