import http from 'node:http';

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOSTNAME ?? '0.0.0.0';

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Multi-stage Node App</title></head>
  <body>
    <h1>Hello from a multi-stage container</h1>
    <p>Running as UID ${process.getuid?.() ?? 'unknown'} on Node ${process.version}</p>
  </body>
</html>
`);
});

server.listen(port, hostname, () => {
  console.log(`Server listening on http://${hostname}:${port}`);
});
