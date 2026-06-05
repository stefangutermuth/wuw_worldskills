// @ts-check
import { defineConfig } from 'astro/config';

// All-Inkl hat kein Node → reiner statischer Build (dist/ per FTP).
// Animationen laufen ohnehin client-seitig; SSR ist nicht nötig.
export default defineConfig({
  output: 'static',
  site: 'https://shanghai.wirth-wiener.de',
  server: { port: 4321, host: true },
  vite: {
    server: {
      // Zugriff über die Local-Domain erlauben (nginx-Proxy)
      allowedHosts: ['worldskills-shanghai-2026.local'],
      // HMR-Websocket DIREKT auf den Dev-Server (Port 4321) statt über den Proxy –
      // der nginx-Proxy reicht den WS-Upgrade nicht zuverlässig durch.
      hmr: {
        host: 'localhost',
        clientPort: 4321,
        protocol: 'ws',
      },
    },
  },
});
