// Placeholder so `npm run dev` starts on day zero. B replaces this file in Guide B, Step 3.
import { createServer } from 'node:http';

const port = Number(process.env.PORT ?? 8080);
createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, placeholder: true }));
}).listen(port, () => console.log(`API placeholder on http://localhost:${port}`));
