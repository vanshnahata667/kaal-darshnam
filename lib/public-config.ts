export function publicConfiguration(){
 const supabaseUrl=process.env.SUPABASE_URL||'';
 const key=process.env.SUPABASE_PUBLISHABLE_KEY||'';
 let safe=key.startsWith('sb_publishable_');
 if(!safe&&key.split('.').length===3){try{safe=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role==='anon'}catch{safe=false}}
 // Reject administrative keys before they can reach an HTTP response or bundle.
 return {supabaseUrl,supabaseKey:safe?key:''};
}
