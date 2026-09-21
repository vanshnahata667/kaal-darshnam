import {publicConfiguration} from '../../../lib/public-config';
export function GET(){return Response.json(publicConfiguration(),{headers:{'Cache-Control':'no-store'}})}
