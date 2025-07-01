import { createServer } from "http";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { renderToString } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import React from "react";
import routes from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create static handler for SSR
const { query, dataRoutes } = createStaticHandler(routes);

// Serve static files in production
const isProduction = process.env.NODE_ENV === "production";
const publicDir = isProduction ? join(__dirname, "dist/client") : join(__dirname, "public");

async function createRequestFromNodeRequest(req) {
  const origin = `http://${req.headers.host}`;
  const url = new URL(req.url, origin);
  
  const controller = new AbortController();
  
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        for (const v of value) {
          headers.append(key, v);
        }
      } else {
        headers.set(key, value);
      }
    }
  }

  const init = {
    method: req.method,
    headers,
    signal: controller.signal,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req;
  }

  return new Request(url.href, init);
}

async function handler(req, res) {
  try {
    // Handle static files
    if (req.url.startsWith("/assets/") || req.url === "/favicon.ico") {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }

    // Convert Node.js request to Web API Request
    const request = await createRequestFromNodeRequest(req);
    
    // 1. Run actions/loaders to get the routing context with `query`
    const context = await query(request);

    // If `query` returns a Response, send it raw (a route probably redirected)
    if (context instanceof Response) {
      res.writeHead(context.status, Object.fromEntries(context.headers.entries()));
      res.end(await context.text());
      return;
    }

    // 2. Create a static router for SSR
    const router = createStaticRouter(dataRoutes, context);

    // 3. Render everything with StaticRouterProvider
    const html = renderToString(
      React.createElement(StaticRouterProvider, {
        router,
        context,
      })
    );

    // Setup headers from action and loaders from deepest match
    const leaf = context.matches[context.matches.length - 1];
    const actionHeaders = context.actionHeaders[leaf.route.id];
    const loaderHeaders = context.loaderHeaders[leaf.route.id];
    const headers = new Headers(actionHeaders);
    if (loaderHeaders) {
      for (const [key, value] of loaderHeaders.entries()) {
        headers.append(key, value);
      }
    }

    headers.set("Content-Type", "text/html; charset=utf-8");

    // 4. Send response with embedded hydration data
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Router Data Mode SSR</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
      .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      nav { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
      nav a { margin-right: 15px; color: #0066cc; text-decoration: none; }
      nav a:hover { text-decoration: underline; }
      .active { font-weight: bold; color: #333; }
    </style>
  </head>
  <body>
    <div id="root">${html}</div>
    <script>
      window.__staticRouterHydrationData = ${JSON.stringify({
        loaderData: context.loaderData,
        actionData: context.actionData,
        errors: context.errors,
      })};
    </script>
    <script type="module" src="/client.js"></script>
  </body>
</html>`;

    res.writeHead(context.statusCode || 200, Object.fromEntries(headers.entries()));
    res.end(fullHtml);

  } catch (error) {
    console.error("SSR Error:", error);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
}

const server = createServer(handler);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📖 Mode: React Router Data Mode SSR`);
}); 