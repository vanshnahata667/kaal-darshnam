import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 root:'firebase-web',publicDir:'../public',
 plugins:[react()],
 resolve:{alias:{'next/navigation':fileURLToPath(new URL('./firebase-web/navigation.ts',import.meta.url))}},
 define:{__KAAL_API_ORIGIN__:JSON.stringify('https://kaal-darshanam.jainashwin400.chatgpt.site')},
 build:{outDir:'../dist-firebase',emptyOutDir:true},
});
