# @adunblock/server-tag for React Router

This package provides a React component to fetch and render scripts from a remote URL in a client-rendered React application using React Router.

## Installation

Copy the `ServerTag.js` file into your React project.

## Usage

Import the `ServerTag` component into your main App component or any other component that is rendered on every page:

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServerTag from './ServerTag';

const App = () => {
  return (
    <Router>
      <ServerTag remoteUrl="https://your-remote-url.com/scripts.json" />
      <Routes>
        {/* Your routes here */}
      </Routes>
    </Router>
  );
};

export default App;
```

### Custom Rendering

You can provide a custom `renderScript` callback to render the script tags in a different way. Please note that this implementation is basic and for more complex scenarios, you might want to use a library like `react-helmet`.

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServerTag from './ServerTag';

const App = () => {
  return (
    <Router>
      <ServerTag
        remoteUrl="https://your-remote-url.com/scripts.json"
        renderScript={({ js }) => {
          // This is an example of how you might handle custom rendering.
          // You can create script tags and append them to the document head.
          js.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            // Add any other attributes you need
            document.head.appendChild(script);
          });
        }}
      />
      <Routes>
        {/* Your routes here */}
      </Routes>
    </Router>
  );
};

export default App;
```

## Local Testing

To test the `ServerTag` component locally, navigate to the `test-app` directory. You will need to start both the dummy API server and the React development server.

1.  **Start the Dummy API Server:**

    ```bash
    cd test-app
    node server.js &
    ```

2.  **Start the React Development Server:**

    ```bash
    npm install
    npm start
    ```

Then, open your browser to `http://localhost:3000`.

## End-to-End Testing with Playwright

To run the E2E tests, ensure both the dummy API server and the React development server are running (as described above), then in a new terminal, navigate to the `test-app` directory and run:

```bash
npx playwright test
```