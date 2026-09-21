export async function googleSignInEnabled(): Promise<boolean> {
  try {
    const configResponse = await fetch('/api/config', {signal: AbortSignal.timeout(10000)});
    if (!configResponse.ok) return false;
    const config = await configResponse.json() as {supabaseUrl?:string;supabaseKey?:string};
    if (!config.supabaseUrl || !config.supabaseKey) return false;
    const response = await fetch(`${config.supabaseUrl}/auth/v1/settings`, {
      headers: {apikey: config.supabaseKey},
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return false;
    const settings = await response.json() as {external?:{google?:boolean}};
    return settings.external?.google === true;
  } catch {
    return false;
  }
}
