const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/scripts.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ js: ['https://example.com/script1.js', 'https://example.com/script2.js'] }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Dummy API server listening on port 3000');
});
