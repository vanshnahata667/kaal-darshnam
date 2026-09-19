export function GET(){return Response.json({googleMapsKey:process.env.GOOGLE_MAPS_API_KEY||''})}
