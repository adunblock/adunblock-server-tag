import React from "react";

export default function Home() {
  return (
    <div>
      <h1>🏠 Home Page</h1>
      <p>Welcome to the React Router Data Mode SSR test application!</p>
      
      <div style={{ background: "#e8f4f8", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
        <h2>✨ Features Demonstrated</h2>
        <ul>
          <li><strong>Server-Side Rendering (SSR):</strong> This page is rendered on the server</li>
          <li><strong>Data Mode:</strong> Using createBrowserRouter and createStaticRouter</li>
          <li><strong>ServerTag Integration:</strong> Scripts loaded from remote URL in the document head</li>
          <li><strong>Hydration:</strong> Client-side JavaScript takes over after initial render</li>
          <li><strong>Route-based Loading:</strong> Each route can have its own loader</li>
        </ul>
      </div>

      <div style={{ background: "#f0f8f0", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
        <h2>🔧 Technical Implementation</h2>
        <p>This app uses:</p>
        <ul>
          <li>Custom server with <code>createStaticHandler</code></li>
          <li>Browser hydration with <code>createBrowserRouter</code></li>
          <li>ServerTag component for script injection</li>
          <li>Shared route configuration between server and client</li>
        </ul>
      </div>
    </div>
  );
} 