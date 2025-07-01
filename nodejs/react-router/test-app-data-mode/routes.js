import { ServerTag, serverTagLoader } from "../src/ServerTag.js";
import Root from "./components/Root.jsx";
import Home from "./components/Home.jsx";
import About from "./components/About.jsx";

export const routes = [
  {
    path: "/",
    Component: Root,
    loader: async () => {
      // Load global scripts for all pages using ServerTag loader
      return await serverTagLoader({
        remoteUrl: "http://config.adunblocker.com/server-tag.json",
        cacheInterval: 300
      });
    },
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "/about",
        Component: About,
        loader: async () => {
          // Example of route-specific data loading
          return {
            pageTitle: "About Us",
            description: "Learn more about our application"
          };
        }
      }
    ]
  }
];

export default routes; 