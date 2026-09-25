const router={replace:(url:string)=>window.location.replace(url),push:(url:string)=>window.location.assign(url)};
export function useRouter(){return router}
