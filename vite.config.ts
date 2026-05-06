import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR 設定：
      // - 若環境變數 DISABLE_HMR=true 則完全關閉（AI Studio 使用）
      // - 否則保持啟用。實際的 hmr.server 綁定在 server.ts 的 createViteServer 呼叫中完成，
      //   因為那裡才有 http.Server 實體可以傳入。
      //   這裡不設 hmr.port / hmr.host，讓 server.ts 的設定優先。
      hmr: process.env.DISABLE_HMR === 'true' ? false : true,
    },
  };
});