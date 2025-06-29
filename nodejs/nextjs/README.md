# @adunblock/server-tag for Next.js

This package provides a React Server Component to fetch and render scripts from a remote URL before the page is rendered on the server.

## Installation

Copy the `ServerTag.tsx` file into your Next.js project.

## Usage

Import the `ServerTag` component into your page or layout:

```jsx
import ServerTag from './ServerTag';

const MyPage = () => {
  return (
    <div>
      <ServerTag remoteUrl="https://your-remote-url.com/scripts.json" />
      <h1>My Page</h1>
    </div>
  );
};

export default MyPage;
```

### Custom Rendering

You can provide a custom `renderScript` callback to render the script tags in a different way:

```jsx
import ServerTag from './ServerTag';

const MyPage = () => {
  return (
    <div>
      <ServerTag
        remoteUrl="https://your-remote-url.com/scripts.json"
        renderScript={({ js }) =>
          js.map((src) => <script key={src} src={src} strategy="lazyOnload" />)
        }
      />
      <h1>My Page</h1>
    </div>
  );
};

export default MyPage;
```

## Local Testing

To test the `ServerTag` component locally, navigate to the `test-app` directory and run the Next.js development server:

```bash
cd test-app
npm install
npm run dev
```

Then, open your browser to `http://localhost:3000`.

## End-to-End Testing with Playwright

To run the E2E tests, ensure the Next.js development server is running (as described above), then in a new terminal, navigate to the `test-app` directory and run:

```bash
npx playwright test
```