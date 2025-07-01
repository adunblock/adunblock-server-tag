import type { Request, Response, NextFunction } from 'express';

/**
 * Configuration options for ServerTag
 */
export interface ServerTagConfig {
  /** Cache interval in seconds */
  cacheInterval?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts */
  retries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
}

/**
 * Response from remote script endpoint
 */
export interface ScriptDataResponse {
  /** Array of script URLs */
  js: string[];
}

/**
 * Cache entry structure
 */
export interface CacheEntry {
  /** Cached script data */
  data: ScriptDataResponse;
  /** Timestamp when cached */
  timestamp: number;
}

/**
 * Script tag attributes
 */
export interface ScriptAttributes {
  /** Whether script should load asynchronously */
  async?: boolean;
  /** Whether script should be deferred */
  defer?: boolean;
  /** Script type */
  type?: string;
  /** Additional custom attributes */
  [key: string]: string | boolean | number | undefined;
}

/**
 * ServerTag middleware options
 */
export interface ServerTagMiddlewareOptions extends ServerTagConfig {
  /** URL to fetch scripts from (required) */
  remoteUrl: string;
  /** Whether to automatically inject scripts into HTML responses */
  injectIntoHtml?: boolean;
  /** Where to inject scripts in HTML */
  injectPosition?: string;
  /** Additional attributes for script tags */
  scriptAttributes?: ScriptAttributes;
  /** Custom error handler */
  onError?: (error: Error, req: Request, res: Response) => void;
  /** Function to determine if scripts should be injected */
  shouldInject?: (req: Request, res: Response) => boolean;
}

/**
 * Express middleware function type
 */
export type ServerTagMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Fetch options for script loading
 */
export interface FetchOptions extends ServerTagConfig {
  /** Additional headers to send */
  headers?: Record<string, string>;
}

/**
 * Extended Express Response with ServerTag locals
 */
export interface ServerTagResponse extends Response {
  locals: {
    /** Array of script URLs */
    serverTagScripts?: string[];
    /** Pre-rendered HTML script tags */
    serverTagHtml?: string;
    [key: string]: any;
  };
}

/**
 * Helper function types
 */
export type InjectScriptsFunction = (
  html: string,
  scripts: string[],
  attributes?: ScriptAttributes,
  position?: string
) => string;

export type RenderServerTagsFunction = (
  res: Response,
  attributes?: ScriptAttributes
) => string;

export type GenerateScriptTagsFunction = (
  scriptUrls: string[],
  attributes?: ScriptAttributes
) => string;

export type GetScriptsFunction = (
  remoteUrl: string,
  config?: ServerTagConfig
) => Promise<ScriptDataResponse>;

/**
 * Error types
 */
export class ServerTagError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ServerTagError';
  }
}

export class NetworkError extends ServerTagError {
  constructor(message: string, public url: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ServerTagError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends ServerTagError {
  constructor(message: string) {
    super(message, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
} 