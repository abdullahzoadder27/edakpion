import express from "express";
import compression from "compression";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getGoogleFeed } from "./feed";

async function startServer() {
  const app = express();
  app.use(compression());
  const PORT = 3000;

  // Google Merchant Center Feeds
  app.get('/google-feed.xml', getGoogleFeed);


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files and handle SPA fallback
    // When built with esbuild to dist/server.cjs, __dirname will be the dist directory
    const distPath = __dirname;
    
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
