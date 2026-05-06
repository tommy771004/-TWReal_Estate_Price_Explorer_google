import express from "express";
import { createServer as createViteServer } from "vite";
import http from "http";
import path from "path";
import apiApp from "./api/index";

export async function startServer() {
  const PORT = 3000;
  // 使用 apiApp 作為基礎的 Express 實例
  const httpServer = http.createServer(apiApp);

  // 3. Vite整合 (開發環境)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true, hmr: { server: httpServer } }, appType: "spa" });
    apiApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    apiApp.use(express.static(distPath));
    apiApp.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 實價登錄伺服器運作中: http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error(err));