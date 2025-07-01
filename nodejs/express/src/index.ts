// Main exports
export {
  serverTagMiddleware,
  injectScripts,
  renderServerTags,
} from './middleware.js';

export {
  getScripts,
  generateScriptTags,
  clearCache,
  getCacheSize,
} from './ServerTag.js';

// Type exports
export type {
  ServerTagConfig,
  ScriptDataResponse,
  CacheEntry,
  ScriptAttributes,
  ServerTagMiddlewareOptions,
  ServerTagMiddleware,
  FetchOptions,
  InjectScriptsFunction,
  RenderServerTagsFunction,
  GenerateScriptTagsFunction,
  GetScriptsFunction,
  ServerTagResponse,
} from './types.js';

// Error exports
export {
  ServerTagError,
  NetworkError,
  ValidationError,
  TimeoutError,
} from './types.js';

// Default export for convenience
export { serverTagMiddleware as default } from './middleware.js'; 