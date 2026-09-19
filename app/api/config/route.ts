export function GET(){return Response.json({supabaseUrl:process.env.SUPABASE_URL||'',supabaseKey:process.env.SUPABASE_PUBLISHABLE_KEY||''},{headers:{'Cache-Control':'no-store'}})}
