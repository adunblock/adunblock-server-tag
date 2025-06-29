"use server";
import React from "react";
import Script from "next/script";

export interface ServerTagProps {
  remoteUrl: string;
  cacheInterval?: number;
  renderScript?: (jsFiles: { js: string[] }) => React.ReactNode;
}

const cache: { [url: string]: { data: { js: string[] }; timestamp: number } } =
  {};

const ServerTag = async ({
  remoteUrl,
  cacheInterval = 300,
  renderScript,
}: ServerTagProps) => {
  // Ensure this only runs on the server
  if (typeof window !== "undefined") {
    throw new Error("ServerTag can only be used on the server side");
  }
  const now = Date.now();
  const cachedData = cache[remoteUrl];

  let jsFiles: { js: string[] };

  if (cachedData && now - cachedData.timestamp < cacheInterval * 1000) {
    jsFiles = cachedData.data;
  } else {
    try {
      // Validate that remoteUrl is a full URL
      const url = new URL(remoteUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`Invalid protocol: ${url.protocol}. Only http: and https: are allowed.`);
      }
        
      const response = await fetch(remoteUrl);
      jsFiles = await response.json();
      cache[remoteUrl] = { data: jsFiles, timestamp: now };
    } catch (error) {
      console.error("Error fetching remote script:", error);
      jsFiles = { js: [] };
    }
  }

  return (
    <>
      {renderScript
        ? renderScript(jsFiles)
        : jsFiles.js?.map((src) => (
            <Script key={src} src={src} strategy="beforeInteractive" />
          ))}
    </>
  );
};

export default ServerTag;
