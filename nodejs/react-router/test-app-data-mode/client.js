import React, { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import routes from "./routes.js";

// Create browser router with hydration data
const router = createBrowserRouter(routes, {
  hydrationData: window.__staticRouterHydrationData,
});

// Hydrate the server-rendered HTML
hydrateRoot(
  document.getElementById("root"),
  React.createElement(StrictMode, null,
    React.createElement(RouterProvider, { router })
  )
);

console.log("🎉 Client hydrated successfully!"); 