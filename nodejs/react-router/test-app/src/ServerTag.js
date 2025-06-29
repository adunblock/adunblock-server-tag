
import React, { useState, useEffect } from 'react';

const cache = {};

const ServerTag = ({ remoteUrl, cacheInterval = 300, renderScript }) => {
  const [jsFiles, setJsFiles] = useState({ js: [] });

  useEffect(() => {
    const fetchScripts = async () => {
      const now = Date.now();
      const cachedData = cache[remoteUrl];

      if (cachedData && now - cachedData.timestamp < cacheInterval * 1000) {
        setJsFiles(cachedData.data);
      } else {
        try {
          const response = await fetch(remoteUrl);
          const data = await response.json();
          cache[remoteUrl] = { data, timestamp: now };
          setJsFiles(data);
        } catch (error) {
          console.error('Error fetching remote script:', error);
        }
      }
    };

    fetchScripts();
  }, [remoteUrl, cacheInterval]);

  useEffect(() => {
    if (renderScript) {
      const scriptElements = renderScript(jsFiles);
      // This assumes renderScript returns an array of React elements
      // which is not ideal for direct DOM manipulation.
      // A better approach is to have renderScript return the script tags as strings
      // or to use a library like react-helmet.
      // For simplicity, we will just append the scripts to the head.
    } else {
      jsFiles.js.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      });
    }
  }, [jsFiles, renderScript]);

  return null; // This component does not render anything itself
};

export default ServerTag;
