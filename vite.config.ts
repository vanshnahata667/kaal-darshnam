import vinext from "vinext";
import { defineConfig, loadEnv } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { readExecutionProfile } from "./scripts/execution-profile.mjs";
import { sites } from "./build/sites-vite-plugin";
import {securityHeaders,blockedPath} from './lib/security-headers';

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const managedLinux = readExecutionProfile() === "managed-linux";

const localBindingConfig = {
  main: "vinext/server/fetch-handler",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async ({mode}) => {
  const environment=loadEnv(mode,process.cwd(),'');
  const publicKey=environment.SUPABASE_PUBLISHABLE_KEY||'';
  if(publicKey&&!publicKey.startsWith('sb_publishable_')){
    let anonymous=false;
    try{anonymous=JSON.parse(Buffer.from(publicKey.split('.')[1]||'','base64url').toString()).role==='anon'}catch{}
    if(!anonymous)throw new Error('Only a Supabase publishable or anon key may be configured for this app.');
  }
  // Use Miniflare's local Request.cf placeholder unless fetching is requested.
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.WRANGLER_REGISTRY_PATH ??= ".wrangler/dev-registry";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    define: {
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(environment.FIREBASE_PROJECT_ID || ''),
      'process.env.SUPABASE_URL': JSON.stringify(loadEnv(mode, process.cwd(), '').SUPABASE_URL || ''),
      'process.env.SUPABASE_PUBLISHABLE_KEY': JSON.stringify(loadEnv(mode, process.cwd(), '').SUPABASE_PUBLISHABLE_KEY || ''),
      'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(loadEnv(mode, process.cwd(), '').GOOGLE_MAPS_API_KEY || '')
    },
    server: {
      fs:{deny:['.env','.env.*','**/.env','**/.env.*','**/.git/**','**/*.{crt,pem,key}']},
      ...(managedLinux ? { host: "0.0.0.0", allowedHosts: ["terminal.local"] } : {}),
      ...(isCodexSeatbeltSandbox ? { watch: { useFsEvents: false, usePolling: true } } : {}),
    },
    plugins: [
      {name:'local-security',configureServer(server:import('vite').ViteDevServer){server.middlewares.use((request,response,next)=>{
        const pathname=new URL(request.url||'/','http://localhost').pathname;
        if(blockedPath(pathname)){response.statusCode=404;response.end('Not found');return}
        for(const [name,value]of Object.entries(securityHeaders(true)))response.setHeader(name,value);
        next();
      })}},
      vinext(),
      sites({ mockAuth: false }),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
