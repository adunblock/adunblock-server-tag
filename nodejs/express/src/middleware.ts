import type { Request, Response, NextFunction } from 'express';
import { getScripts, generateScriptTags } from './ServerTag.js';
import type {
  ServerTagMiddlewareOptions,
  ServerTagMiddleware,
  ScriptAttributes,
  InjectScriptsFunction,
  RenderServerTagsFunction,
} from './types.js';

/**
 * ServerTag Express middleware
 */
export function serverTagMiddleware(
  options: ServerTagMiddlewareOptions
): ServerTagMiddleware {
  const {
    remoteUrl,
    cacheInterval = 300,
    injectIntoHtml = true,
    injectPosition = '</head>',
    scriptAttributes = {},
    onError,
    shouldInject = () => true,
    ...fetchOptions
  } = options;

  if (!remoteUrl) {
    throw new Error('ServerTag middleware requires a remoteUrl option');
  }

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fetch scripts and store in res.locals for use in templates
      const scriptData = await getScripts(remoteUrl, { cacheInterval, ...fetchOptions });
      res.locals.serverTagScripts = scriptData.js;
      res.locals.serverTagHtml = generateScriptTags(scriptData.js, scriptAttributes);

      // Auto-inject into HTML responses if enabled
      if (injectIntoHtml && shouldInject(req, res)) {
        const originalSend = res.send.bind(res);

        res.send = function(this: Response, data: any): Response {
          // Only inject into HTML responses
          const contentType = this.get('Content-Type') || '';
          if (contentType.includes('text/html') && typeof data === 'string') {
            const scriptsHtml = generateScriptTags(scriptData.js, scriptAttributes);
            if (scriptsHtml && data.includes(injectPosition)) {
              // Inject scripts before the specified position
              data = data.replace(injectPosition, `${scriptsHtml}\n${injectPosition}`);
            }
          }

          return originalSend.call(this, data);
        };
      }

      next();
    } catch (error) {
      console.error('ServerTag middleware error:', error);

      // Set empty defaults
      res.locals.serverTagScripts = [];
      res.locals.serverTagHtml = '';

      if (onError) {
        onError(error as Error, req, res);
      }

      next(); // Continue even if script loading fails
    }
  };
}

/**
 * Helper function to manually inject scripts into HTML
 */
export const injectScripts: InjectScriptsFunction = (
  html: string,
  scripts: string[],
  attributes: ScriptAttributes = {},
  position: string = '</head>'
): string => {
  if (!html || !scripts || scripts.length === 0) {
    return html;
  }

  const scriptsHtml = generateScriptTags(scripts, attributes);
  if (!scriptsHtml) return html;

  return html.replace(position, `${scriptsHtml}\n${position}`);
};

/**
 * Template helper function for use in template engines
 */
export const renderServerTags: RenderServerTagsFunction = (
  res: Response,
  attributes: ScriptAttributes = {}
): string => {
  const scripts = res.locals.serverTagScripts || [];
  return generateScriptTags(scripts, attributes);
};

/**
 * Higher-order function to create multiple middleware instances
 */
export function createServerTagMiddleware(
  defaultOptions: Partial<ServerTagMiddlewareOptions> = {}
) {
  return function(options: ServerTagMiddlewareOptions): ServerTagMiddleware {
    return serverTagMiddleware({ ...defaultOptions, ...options });
  };
}

/**
 * Conditional middleware that only applies ServerTag to specific routes
 */
export function conditionalServerTag(
  condition: (req: Request, res: Response) => boolean,
  options: ServerTagMiddlewareOptions
): ServerTagMiddleware {
  const middleware = serverTagMiddleware(options);
  
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (condition(req, res)) {
      return middleware(req, res, next);
    }
    next();
  };
}

/**
 * Route-specific middleware factory
 */
export function routeServerTag(
  routes: string | string[] | RegExp,
  options: ServerTagMiddlewareOptions
): ServerTagMiddleware {
  const routeArray = Array.isArray(routes) ? routes : [routes];
  const middleware = serverTagMiddleware(options);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const shouldApply = routeArray.some(route => {
      if (typeof route === 'string') {
        return req.path === route || req.path.startsWith(route);
      }
      if (route instanceof RegExp) {
        return route.test(req.path);
      }
      return false;
    });

    if (shouldApply) {
      return middleware(req, res, next);
    }
    next();
  };
} 