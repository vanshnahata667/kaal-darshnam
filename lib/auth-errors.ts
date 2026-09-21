export function authMessage(error:unknown){
 const value=error as {code?:string;status?:number;message?:string};
 if(value?.code==='email_not_confirmed'||value?.message?.startsWith('Confirm your email')||value?.message==='Email not confirmed')return 'Confirm your email before signing in. Check your inbox and spam folder, or resend the confirmation below.';
 if(value?.code==='invalid_credentials'||value?.message==='Invalid login credentials')return 'Invalid login credentials';
 if(value?.status===429||value?.code?.includes('rate_limit'))return 'Too many attempts. Wait a few minutes before trying again.';
 if(value?.code==='weak_password')return 'Choose a stronger password with at least eight characters.';
 if(value?.message?.startsWith('Supabase is not connected yet.'))return 'Supabase is not connected yet. The site owner needs to add the project URL and public key.';
 return 'Unable to complete sign-in. Check your connection and try again, or reset your password.';
}
