import React from "react";
import { useLoaderData } from "react-router";

export default function About() {
  const { pageTitle, description } = useLoaderData();

  return (
    <div>
      <h1>📖 {pageTitle}</h1>
      <p>{description}</p>
      
      <div style={{ background: "#fff3cd", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
        <h2>🎯 About This App</h2>
        <p>This is a demonstration of React Router's <strong>Data Mode</strong> with server-side rendering.</p>
        <p>Unlike Framework Mode, Data Mode gives you full control over your server and bundler setup.</p>
      </div>

      <div style={{ background: "#f8d7da", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
        <h2>🔧 ServerTag Integration</h2>
        <p>The ServerTag component is integrated at the root level and loads scripts from:</p>
        <code style={{ background: "#fff", padding: "4px 8px", borderRadius: "4px" }}>
          http://config.adunblocker.com/server-tag.json
        </code>
        <p style={{ marginTop: "10px" }}>These scripts are loaded server-side and injected into the HTML head during SSR.</p>
      </div>

      <div style={{ background: "#d4edda", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
        <h2>🎪 Data Loading Example</h2>
        <p>This route demonstrates loader data:</p>
        <ul>
          <li><strong>Page Title:</strong> {pageTitle}</li>
          <li><strong>Description:</strong> {description}</li>
        </ul>
        <p><em>This data was loaded server-side in the route's loader function!</em></p>
      </div>
    </div>
  );
} 