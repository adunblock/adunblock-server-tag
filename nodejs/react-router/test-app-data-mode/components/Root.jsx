import React from "react";
import { Outlet, Link, useLocation } from "react-router";
import { ServerTag } from "../../src/ServerTag.js";

export default function Root() {
  const location = useLocation();

  return (
    <div className="container">
      <header>
        <ServerTag />
        <nav>
          <Link 
            to="/" 
            className={location.pathname === "/" ? "active" : ""}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={location.pathname === "/about" ? "active" : ""}
          >
            About
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer style={{ marginTop: "40px", padding: "20px 0", borderTop: "1px solid #eee", color: "#666" }}>
        <p>React Router Data Mode SSR Test App</p>
        <p>ServerTag integrated with scripts from: http://config.adunblocker.com/server-tag.json</p>
      </footer>
    </div>
  );
} 