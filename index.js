/**
 * Development Server untuk Testing Dashboard Lokal
 * 
 * Usage:
 *   node devServer.js
 * 
 * Kemudian buka: http://localhost:3000/
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5503;
const API_KEY = process.env.API_KEY;
const SHEET_ID = process.env.SHEET_ID;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Route: /getSheet
  if (pathname === '/getSheet') {
    if (!API_KEY || !SHEET_ID) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Missing environment variables',
        message: 'Pastikan API_KEY dan SHEET_ID sudah di-set di .env file',
        help: 'Lihat .env.example untuk contoh format'
      }));
      return;
    }

    try {
      console.log(`[${new Date().toISOString()}] Fetching data dari Google Sheets...`);
      
      const RANGE = "Sheet1!A:AY";
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
      
      const response = await fetch(sheetUrl);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || 'Google Sheets API Error');
      }

      if (!json.values || json.values.length === 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }

      const rows = json.values;
      const header = rows[0];
      const data = rows.slice(1).map((r) => {
        let obj = {};
        header.forEach((h, i) => (obj[h] = r[i] || ""));
        return obj;
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      console.log(`[${new Date().toISOString()}] ✅ Berhasil fetch ${data.length} rows`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Error:`, err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: err.message,
        hint: 'Cek API_KEY dan SHEET_ID di .env'
      }));
    }
    return;
  }

  // Static Files
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath);

  try {
    const file = fs.readFileSync(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(file);
    console.log(`[${new Date().toISOString()}] 📄 ${pathname}`);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    console.log(`[${new Date().toISOString()}] ❌ 404 ${pathname}`);
  }
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   🚀 Development Server Started                 ║
╠════════════════════════════════════════════════════════════════╣
║  URL:          http://localhost:${PORT}                            ║
║  API Endpoint: http://localhost:${PORT}/getSheet                    ║
║  Environment:  ${API_KEY ? '✅ API_KEY set' : '❌ API_KEY missing'}                        ║
║  Sheet ID:     ${SHEET_ID ? '✅ SHEET_ID set' : '❌ SHEET_ID missing'}                      ║
║                                                                ║
║  Tekan Ctrl+C untuk menghentikan server                         ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Server dihentikan');
  process.exit(0);
});
