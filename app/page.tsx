"use client";
import {SessionGate} from './auth';
import Explorer from './explorer';
export default function Home(){return <SessionGate>{(user,logout)=><Explorer key={user.id} user={{name:user.user_metadata.display_name||user.user_metadata.full_name||user.email?.split('@')[0]||'Explorer',email:user.email||''}} onSignOut={logout}/>}</SessionGate>}
