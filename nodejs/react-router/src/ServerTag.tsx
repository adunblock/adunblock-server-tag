import React from "react";
import { useMatches } from "react-router";

export interface ServerTagProps {
  async?: boolean;
  renderScript?: (jsFiles: { js: string[] }) => React.ReactNode;
}

export interface ServerTagLoaderData {
  js: string[];
}

export interface ServerTagLoaderArgs {
  remoteUrl: string;
  cacheInterval?: number;
}

const cache: { [url: string]: { data: { js: string[] }; timestamp: number } } =
  {};

// Core loader implementation - shared between both functions
async function loadServerTagData(
  config: ServerTagLoaderArgs
): Promise<ServerTagLoaderData> {
  // Ensure this only runs on the server
  if (typeof window !== "undefined") {
    throw new Error("ServerTag loader can only be used on the server side");
  }

  const { remoteUrl, cacheInterval = 300 } = config;
  const now = Date.now();
  const cachedData = cache[remoteUrl];

  let jsFiles: { js: string[] };

  if (cachedData && now - cachedData.timestamp < cacheInterval * 1000) {
    jsFiles = cachedData.data;
  } else {
    try {
      // Validate that remoteUrl is a full URL
      const url = new URL(remoteUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error(
          `Invalid protocol: ${url.protocol}. Only http: and https: are allowed.`
        );
      }

      const response = await fetch(remoteUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      jsFiles = await response.json();
      cache[remoteUrl] = { data: jsFiles, timestamp: now };
    } catch (error) {
      console.error("Error fetching remote script:", error);
      jsFiles = { js: [] };
    }
  }

  return jsFiles;
}

// Server-side loader function for React Router data/framework mode
export const serverTagLoader = (
  config: ServerTagLoaderArgs
): Promise<ServerTagLoaderData> => {
  return loadServerTagData(config);
};

// Server-side component for React Router data/framework mode
export const ServerTag: React.FC<ServerTagProps> = ({
  renderScript,
  async = true,
}) => {
  const matches = useMatches();

  const allScripts = matches.flatMap((match) => {
    // The data type from `useMatches` can be anything, so we cast and check
    const data = match.data as ServerTagLoaderData;

    // The loader data for this route might not have scripts, so we check.
    if (data && Array.isArray(data.js)) {
      return data.js;
    }

    return [];
  });

  const uniqueScripts = [...new Set(allScripts)];
  const jsFiles = { js: uniqueScripts };

  if (jsFiles.js.length === 0) {
    return null;
  }

  return (
    <>
      {renderScript
        ? renderScript(jsFiles)
        : jsFiles.js.map((src) => <script key={src} src={src} async={async} />)}
    </>
  );
};
