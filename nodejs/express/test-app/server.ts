import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  serverTagMiddleware, 
  injectScripts,
  type ServerTagMiddlewareOptions,
  type ScriptAttributes 
} from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Define ServerTag configuration
const serverTagConfig: ServerTagMiddlewareOptions = {
  remoteUrl: 'http://config.adunblocker.com/server-tag.json',
  cacheInterval: 300, // 5 minutes
  injectIntoHtml: false, // We'll handle injection manually for demo
  onError: (error: Error, req: Request, res: Response) => {
    console.error('ServerTag error on', req.path, ':', error.message);
  },
  shouldInject: (req: Request, res: Response) => {
    // Only inject on HTML pages, not API routes
    return !req.path.startsWith('/api/');
  }
};

// ServerTag middleware - this will be available on all routes
app.use(serverTagMiddleware(serverTagConfig));

// Routes

// Home page - using EJS template with helper function
app.get('/', (req: Request, res: Response) => {
  res.render('index', {
    title: 'Express ServerTag Demo',
    description: 'Demonstration of ServerTag middleware integration',
    scripts: res.locals.serverTagScripts || []
  });
});

// About page - using EJS template
app.get('/about', (req: Request, res: Response) => {
  res.render('about', {
    title: 'About - Express ServerTag Demo',
    description: 'Learn about ServerTag middleware for Express',
    scripts: res.locals.serverTagScripts || []
  });
});

// Manual injection example
app.get('/manual', (req: Request, res: Response) => {
  const scripts = res.locals.serverTagScripts || [];
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Manual Injection Example</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .demo-box { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    nav a { margin-right: 15px; color: #0066cc; text-decoration: none; }
    nav a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/manual">Manual Injection</a>
    <a href="/api/scripts">API</a>
  </nav>
  
  <h1>Manual Script Injection</h1>
  <div class="demo-box">
    <p>This page demonstrates manual script injection using the <code>injectScripts</code> helper function.</p>
    <p>Scripts are injected into the HTML at runtime without using templates.</p>
    <p>Loaded scripts: <strong>${scripts.length}</strong></p>
  </div>
</body>
</html>`;

  // Manually inject scripts
  const modifiedHtml = injectScripts(html, scripts);
  res.send(modifiedHtml);
});

// Auto-injection example
const autoInjectConfig: ServerTagMiddlewareOptions = {
  remoteUrl: 'http://config.adunblocker.com/server-tag.json',
  injectIntoHtml: true, // Enable auto-injection for this route
  scriptAttributes: { defer: true } as ScriptAttributes // Custom attributes
};

app.get('/auto', serverTagMiddleware(autoInjectConfig), (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Auto Injection Example</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .demo-box { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    nav a { margin-right: 15px; color: #0066cc; text-decoration: none; }
    nav a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/manual">Manual Injection</a>
    <a href="/api/scripts">API</a>
  </nav>
  
  <h1>🚀 Auto Script Injection</h1>
  <div class="demo-box">
    <p>This page uses automatic script injection!</p>
    <p>The ServerTag middleware automatically injects scripts into the HTML response.</p>
    <p>Scripts are added with <code>defer</code> attribute in this example.</p>
    <p>Check the page source to see the injected scripts in the &lt;head&gt; section.</p>
  </div>
</body>
</html>`);
});

// API endpoint to return scripts as JSON
app.get('/api/scripts', (req: Request, res: Response) => {
  const scripts = res.locals.serverTagScripts || [];
  res.json({
    scripts,
    count: scripts.length,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const scripts = res.locals.serverTagScripts || [];
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    serverTag: {
      scriptsLoaded: scripts.length,
      scripts
    }
  });
});

// TypeScript demo endpoint
app.get('/typescript', (req: Request, res: Response) => {
  const scripts = res.locals.serverTagScripts || [];
  res.json({
    message: 'This endpoint demonstrates TypeScript integration!',
    features: [
      'Full type safety',
      'IntelliSense support',
      'Compile-time error checking',
      'Modern ES modules',
      'Vite build system'
    ],
    scripts: {
      count: scripts.length,
      urls: scripts
    },
    buildInfo: {
      typescript: '5.3.0',
      vite: '5.0.0',
      node: process.version
    }
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Express error:', err);
  res.status(500).send(`
    <h1>Something went wrong!</h1>
    <p>Error: ${err.message}</p>
    <a href="/">← Back to Home</a>
  `);
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).send(`
    <h1>Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">← Back to Home</a>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Express ServerTag test app running at http://localhost:${PORT}`);
  console.log(`📖 Features:`);
  console.log(`   • ServerTag middleware integration`);
  console.log(`   • TypeScript with full type safety`);
  console.log(`   • Multiple injection patterns`);
  console.log(`   • Template engine support`);
  console.log(`   • API endpoints`);
  console.log(`\n🔗 Routes:`);
  console.log(`   • http://localhost:${PORT}/ - Home (EJS template)`);
  console.log(`   • http://localhost:${PORT}/about - About (EJS template)`);
  console.log(`   • http://localhost:${PORT}/manual - Manual injection`);
  console.log(`   • http://localhost:${PORT}/auto - Auto injection`);
  console.log(`   • http://localhost:${PORT}/api/scripts - Scripts API`);
  console.log(`   • http://localhost:${PORT}/typescript - TypeScript demo`);
  console.log(`   • http://localhost:${PORT}/health - Health check`);
}); 